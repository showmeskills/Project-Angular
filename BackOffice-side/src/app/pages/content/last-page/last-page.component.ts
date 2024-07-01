import { moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FooterApi } from 'src/app/shared/api/footer.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { filter, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { cloneDeep } from 'lodash';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { Breadcrumbs } from 'src/app/shared/interfaces/common.interface';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SafePipe } from 'src/app/_metronic/core/pipes/safe.pipe';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LastPageEditComponent } from './last-page-edit/last-page-edit.component';
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-last-page',
  templateUrl: './last-page.component.html',
  styleUrls: ['./last-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    LastPageEditComponent,
    NgFor,
    LangTabComponent,
    CdkDropList,
    CdkDrag,
    NgTemplateOutlet,
    IconSrcDirective,
    AngularSvgIconModule,
    FormsModule,
    SafePipe,
    LangPipe,
  ],
})
export class LastPageComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: MatModal,
    private router: Router,
    private api: FooterApi,
    public appService: AppService,
    private subHeader: SubHeaderService,
    private breadcrumbsService: BreadcrumbsService
  ) {}

  platformList: any = [
    { name: 'APP', value: 'APP' },
    { name: 'web/H5', value: 'WEB' },
  ];

  selectPlatform: any = { name: 'APP', value: 'APP' };

  selectLang: any = ['zh-cn']; // PM:默认值CN
  curLang: any = 'zh-cn'; // PM:默认值CN
  langList: any = ['1', '2'];

  typeList: any[] = [];
  list: any = [];
  license: any[] = [];
  needUpdateData: any = {};

  private _destroy$ = new Subject<void>();
  type = '';
  record: any = {};

  /** getters */
  private _edit = false;

  get edit() {
    return this._edit;
  }

  set edit(v: boolean) {
    this._edit = v;

    // 如果显示编辑页面，重新计算面包屑
    this.breadcrumbsService.set(this.generateBreadcrumbs());
  }

  /** lifeCycle */
  ngOnInit() {
    this.api.getFooterTypeList().subscribe((res) => {
      this.typeList = Array.isArray(res) ? res : [];

      this.subHeader.merchantId$
        .pipe(
          filter((id) => !!id),
          takeUntil(this._destroy$)
        )
        .subscribe(() => this.loadData());
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  loadData() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getFooterList({
        TenantId: this.subHeader.merchantCurrentId,
        ClientType: this.selectPlatform.value,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.selectLang = res?.footer?.map((e) => e.languageCode) || [];
        this.list = this.processList(res);
        this.license = res?.license || [];

        if (!this.selectLang.includes(this.curLang)) {
          this.curLang = 'zh-cn';
        }
      });
  }

  onSelectedPlatfrom(v) {
    this.selectPlatform = v;
    this.loadData();
  }

  updateLanguageForm(lang) {
    const res = this.list.filter((e) => lang.includes(e.languageCode));
    lang
      .filter((e) => !res.some((j) => j.languageCode === e))
      .forEach((e) => {
        res.push({
          languageCode: e,
          info: this.typeList.map((e) => ({
            footerType: e.footerType,
            detail: [],
          })),
          disclaimer: {
            disclaimer: '',
          },
        });
      });

    this.list = res;
  }

  drop(event: any, items: any) {
    if (event.previousIndex === event.currentIndex) return;
    // 先排序确定位置
    moveItemInArray(items, event.previousIndex, event.currentIndex);

    this.api
      .updateSort(
        this.subHeader.merchantCurrentId,
        items.map((e) => e.id)
      )
      .subscribe((res) => {
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'member.kyc.model.successOperation',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'payment.method.operationFailed',
            successed: false,
          });
        }
      });
  }

  goAddEdit(type: any, item?: any, record?: any) {
    this.needUpdateData = item;
    this.type = type;
    this.record = record;
    this.edit = true;
  }

  async confirm(event: MouseEvent, tpl: any, parent: any, item: any) {
    event.stopPropagation();
    event.preventDefault();

    if (this.curLang === 'zh-cn') {
      const cur = this.list.find((e) => e.languageCode === this.curLang);

      if (cur) {
        const lenTotal = cur.info.reduce((t, j) => t + j.detail?.length, 0);
        if (lenTotal <= 1)
          return this.appService.showToastSubject.next({
            msgLang: 'content.foot.keepOne',
            successed: false,
          });
      }
    }

    // 如果没有进行保存直接删除
    if (!item.id) return this.removeArrItem(parent, item);
    const res = this.modalService.open(tpl, { width: '500px' });

    if (await res.result) {
      this.api.deleteFooter(this.subHeader.merchantCurrentId, item.id).subscribe((res) => {
        if (res === true) {
          this.removeArrItem(parent, item);
        } else {
          this.appService.showToastSubject.next({ msgLang: 'content.ba.failDel', successed: false });
        }
      });
    }
  }

  removeArrItem(arr: any[], item: any) {
    if (arr.indexOf(item) <= -1)
      return this.appService.showToastSubject.next({
        msgLang: 'content.foot.noContent',
        successed: true,
      });
    arr.splice(arr.indexOf(item), 1);
    this.appService.showToastSubject.next({ msgLang: 'content.ba.suc', successed: true });
    this.loadData();
  }

  /** 提交请求 */
  submit$() {
    this.appService.isContentLoadingSubject.next(true);

    return this.api
      .updateFooter({
        tenantId: this.subHeader.merchantCurrentId,
        clientType: this.selectPlatform.value,
        footer: this.list,
        license: this.license,
      })
      .pipe(tap(() => this.appService.isContentLoadingSubject.next(false)));
  }

  onSubmit() {
    this.submit$().subscribe((res) => {
      if (res === true) {
        this.appService.showToastSubject.next({
          msgLang: 'content.foot.saveSuc',
          successed: true,
        });
        this.loadData();
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'content.foot.saveFail',
          successed: false,
        });
      }
    });
  }

  updateData($event: any) {
    if (this.type === 'license') {
      if ($event.id) {
        Object.keys($event).forEach((key) => {
          this.needUpdateData[key] = $event[key];
        });
      } else {
        this.license.push($event);
      }
    } else {
      if ($event.id) {
        Object.keys($event).forEach((key) => {
          this.needUpdateData[key] = $event[key];
        });
      } else {
        this.record.push($event);
      }
    }

    this.onSubmit(); // 每次操作之后提交一次更新数据比较好
  }

  private processList(res: any) {
    res = res?.footer || [];

    res.forEach((e) => {
      e.info.forEach(() => {});

      this.typeList.forEach((j) => {
        if (!e.info.some((k) => k.footerType === j.footerType)) {
          e.info.push({ footerType: j.footerType, detail: [] });
        }
      });
    });

    return res;
  }

  /** 删除牌照 */
  async onDelLicense(event: MouseEvent, tpl: TemplateRef<any>, i: number) {
    event.stopPropagation();

    const res = this.modalService.open(tpl, { width: '500px' });

    if (await res.result) {
      const tmp = cloneDeep(this.license);
      this.license.splice(i, 1);

      this.submit$().subscribe((res) => {
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'content.ba.suc',
            successed: true,
          });
          this.loadData();
        } else {
          this.license = tmp;
          this.appService.showToastSubject.next({
            msgLang: 'content.ba.failDel',
            successed: false,
          });
        }
      });
    }
  }

  /** 生成面包屑 */
  generateBreadcrumbs(): Breadcrumbs[] {
    const res: Breadcrumbs[] = [
      {
        name: '页尾管理',
      },
    ];

    if (!this.edit) return res;
    res[0].click = () => (this.edit = false); // !!! 请注意：click后修改edit值不要造成死循环

    return [...res, { name: this.type === 'license' ? '编辑牌照' : '编辑主题' }];
  }
}
