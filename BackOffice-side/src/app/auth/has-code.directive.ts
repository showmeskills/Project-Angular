import { Directive, inject, Input, OnDestroy, TemplateRef } from '@angular/core';
import { NgIf, NgIfContext } from '@angular/common';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { DynamicAsideMenuService } from 'src/app/_metronic/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { AppService } from 'src/app/app.service';

interface HasCodeDirectiveContext<T = unknown> {
  $implicit: T;
  hasCode: T;
  type: 'ngIf' | 'click';
}

/**
 * 权限指令
 * - 用于控制页面元素的显示隐藏
 * - 用于控制页面元素的点击捕获判断是否有权限
 * @usageNotes
 * ### 像ngIf一样使用
 * ```html
 * <div *hasCode="'G0219'"> 有G0219权限的内容 </div>
 * <div *hasCode="['G0219', 'G0218']"> 有权限的内容 </div>
 * <div *hasCode="['G02191', 'G02190']; else noPermissionTpl"> 有权限的内容 </div>
 * <ng-template #noPermissionTpl> 没有权限！ </ng-template>
 * ```
 *
 * ### 点击抛出没有权限的提示 -> 暂时勿用
 * ```html
 * <button
 *   *hasCode="['G02191', 'G02190']; else noPermissionTpl; type: 'click'"
 *   type="button"
 *   class="btn btn-light-primary px-9 fz-14 py-2 ml-4 mb-2"
 *   (click)="onTest()"
 * >
 *  操作按钮
 * </button>
 *
 * <ng-template #noPermissionTpl> 没有权限！ </ng-template>
 * ```
 * @Annotation
 */
@Directive({
  selector: '[hasCode], [hasGB]',
  standalone: true,
  hostDirectives: [NgIf],
  providers: [DestroyService],
})
export class HasCodeDirective<T = unknown> implements OnDestroy {
  private ngIf = inject(NgIf, { host: true });
  private ls = inject(LocalStorageService);
  private menu = inject(DynamicAsideMenuService);
  private destroy$ = inject(DestroyService);
  private appService = inject(AppService);

  constructor() {
    this.showTemplate$
      .pipe(
        tap((show) => {
          this.ngIf.ngIf = this.typeIsClick || show;

          this.removeEventBinding();
          this.eventBinding();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private _type: 'ngIf' | 'click' = 'ngIf';

  get typeIsNgIf() {
    return this._type === 'ngIf';
  }

  get typeIsClick() {
    return this._type === 'click';
  }

  private _hasCode: string | string[] | unknown;
  @Input('hasCode') set hasCode(code: string | string[] | undefined | unknown) {
    this._hasCode = code;
    if (code) {
      this.showTemplate(this.getByCodeAll$().pipe(map((e) => e.permission)));
    }
  }

  /**
   * 是否有GB资源的用户显示
   * @param hasGB {boolean} true=匹配true显示    false=匹配false显示
   */
  @Input({
    alias: 'hasGB',
    transform: (value: boolean | string) => {
      return value === '' ? true : value;
    },
  })
  set hasGB(hasGB: boolean) {
    this.showTemplate(!(+hasGB ^ +this.ls.isGB));
  }

  @Input('hasCodeElse') set hasCodeElse(templateRef: TemplateRef<NgIfContext<T>> | null) {
    this.ngIf.ngIfElse = templateRef;
  }

  @Input('hasCodeType') set hasCodeType(type: 'ngIf' | 'click') {
    this._type = type;
    // 重新计算是否显示
    this.showTemplate(this.showTemplate$.value);
  }

  private readonly showTemplate$ = new BehaviorSubject(false);
  getByCodeAll$() {
    // TODO 是否全部权限都有，true=全部权限都有，false=有一个权限就显示 后期优化开放出去
    const isAllMatch = false;

    return this.menu.getByCodeAll$(this._hasCode, isAllMatch).pipe(takeUntil(this.destroy$));
  }

  showTemplate = (show: boolean | Observable<boolean>) => {
    if (show instanceof Observable) {
      show.subscribe((s) => this.showTemplate$.next(s));
    } else {
      this.showTemplate$.next(show);
    }
  };

  static ngTemplateContextGuard<T>(dir: HasCodeDirective<T>, ctx: any): ctx is HasCodeDirectiveContext<T> {
    return true;
  }

  ngOnDestroy(): void {
    this.showTemplate$.complete();
    this.showTemplate$.unsubscribe();
    this.removeEventBinding();
  }

  /**
   * 添加事件绑定
   * @private
   */
  private eventBindingClick = (e) => this.onClick(e);
  private eventBinding() {
    if (!this.typeIsClick) return;

    this.ngIf['_thenViewRef']?.rootNodes.forEach((node) => {
      node.addEventListener('click', this.eventBindingClick, true);
    });
  }

  /**
   * 点击事件
   * @param event {MouseEvent}
   */
  private onClick(event: MouseEvent) {
    // TODO 不太好的写法，可能会阻断document.click或其他事件，后续包装事件函数提供出去、或proxy一下进行判断后再执行
    if (!this.showTemplate$.value) {
      event.stopPropagation();
      event.preventDefault();

      // TODO 点击提示没有权限的信息
      this.appService.showToastSubject.next({ msgLang: 'common.permissionFail' });

      // TODO 需要提供完整的权限列表API以供匹配，按照现有点击请求接口来获取权限名称，此功能暂放置
      // this.getByCodeAll$().subscribe((e) => {
      //   // 这里计算出哪些没有权限的节点找到父级节点，拼接提示信息
      //   this.meu.getParentNodesByNode()
      // })
    }
  }

  /**
   * 移除事件绑定
   */
  private removeEventBinding() {
    this.ngIf['_thenViewRef']?.rootNodes.forEach((node) => {
      node.removeEventListener('click', this.eventBindingClick, true);
    });
  }
}
