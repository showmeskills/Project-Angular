import { Directive, ElementRef, Inject, OnDestroy, Optional, TemplateRef, ViewContainerRef } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * 任意地方模板插入到头部
 * 难点：
 *  因为存着不是父子关系，ContentChildren 修饰器无法修饰查找所有。
 *
 * 思路：
 * 1. 通过`服务共享`管理所绑定的 ng-template
 * 2. 订阅服务每次改变都进行创建模板视图
 *
 * 优化：
 *  命名优化
 */

@Directive({
    selector: '[subHeader]',
    exportAs: 'subHeader',
    standalone: true,
})
export class SubHeaderDirective implements OnDestroy {
  constructor(
    public host: ElementRef,
    @Optional() public templateRef: TemplateRef<any>,
    @Inject(ElementRef) public ___root: ElementRef | TemplateRef<any>,
    private service: SubHeaderService
  ) {
    this.service.pushRender(this.templateRef); // 压栈进行管理
  }

  ngOnDestroy(): void {
    this.service.popRender(this.templateRef);
  }
}

@Directive({
    selector: '[subHeaderContainer]',
    exportAs: 'subHeaderContainer',
    standalone: true,
})
export class SubHeaderContainerDirective implements OnDestroy {
  constructor(
    @Optional() private host: ElementRef,
    @Optional() private _viewContainer: ViewContainerRef,
    private service: SubHeaderService
  ) {
    this.service.renderList.pipe(takeUntil(this._destroyed)).subscribe((res) => {
      if (!this._viewContainer) return;
      // 先清除之前渲染的节点
      this._viewContainer?.clear();

      res?.length &&
        res.forEach((e) => {
          this._viewContainer.createEmbeddedView(e, { $implicit: {} }); // 创建模板视图 这里可以回传给模板参数
        });
    });
  }

  _destroyed = new Subject<void>();

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
