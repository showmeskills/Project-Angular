import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { isEqual, orderBy } from 'lodash';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import BigNumber from 'bignumber.js';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { TenantCurrency } from 'src/app/shared/interfaces/currency';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgTemplateOutlet, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    NgTemplateOutlet,
    NgIf,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CurrencyIconDirective,
    AngularSvgIconModule,
    LangPipe,
  ],
})
export class CurrencyComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: AssetApi,
    private appService: AppService,
    public modalService: NgbModal,
    private currencyService: CurrencyService,
    private subHeaderService: SubHeaderService,
    public ls: LocalStorageService
  ) {}

  private listWrap: TenantCurrency[] = []; // 表格列表数据包装
  isLoading = false; // 是否处于加载
  loadData$ = new Subject<void>(); // 列表数据加载
  private _destroy = new Subject<void>(); // 生命周期销毁

  /** 币种列表 */
  currencyTypeList = [
    { value: '', name: 'common.all' },
    { value: true, name: 'payment.currency.digitalCurrency' },
    { value: false, name: 'payment.currency.fiatCurrency' },
  ];

  /** 状态下拉列表 */
  statusList: any[] = [
    { name: 'common.all', value: '' },
    { name: 'payment.currency.open', value: 'Enabled' },
    { name: 'payment.currency.shutDown', value: 'Disabled' },
  ];

  EMPTY_DATA = {
    curCurrencyType: '' as string | boolean,
    name: '',
    status: '',
  };

  data = { ...this.EMPTY_DATA };
  sort: { field: keyof TenantCurrency; sort: boolean | 'asc' | 'desc' }[] = [];

  /** getter */
  get list() {
    return orderBy(
      this.listWrap,
      this.sort.map((e) => e.field),
      this.sort.map((e) => (e.sort ? e.sort : false))
    );
  }

  /** 是否开启排序币种 */
  get enabledSortCurrency() {
    return isEqual(this.data, this.EMPTY_DATA) && !this.sort.length;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroy)).subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  /** methods */
  /** 排序 */
  onSort(sortKey: string): void {
    const temp = ['', 'desc', 'asc'];
    const curIndex = this.sort.findIndex((e) => e.field === sortKey);
    const curSort = this.sort[curIndex];
    const next = (temp.indexOf((curSort?.sort as any) || '') + 1) % temp.length;
    const nextValue = (temp[next] || false) as boolean | 'desc' | 'asc';

    if (!nextValue) {
      this.sort.splice(curIndex, 1);
      return;
    }

    if (curSort) {
      curSort.sort = nextValue;
    } else {
      this.sort.push({ field: sortKey, sort: nextValue });
    }
  }

  /** 获取字段排序数据 */
  getSort(field: string) {
    return (this.sort.find((e) => e.field === field) || {}).sort;
  }

  /** 获取列表流 */
  getList$() {
    return this.api
      .getCurrencyList({
        MerchantId: +this.subHeaderService.merchantCurrentId || 0,
        Name: this.data.name,
        Status: this.data.status,
        IsDigital: this.data.curCurrencyType === '' ? undefined : (this.data.curCurrencyType as boolean),
      })
      .pipe(
        tap((res) => {
          this.listWrap = res;
        })
      );
  }

  /** 获取数据 */
  loadData() {
    this.loading(true);
    this.getList$().subscribe(() => this.loading(false));
  }

  /** 重置 */
  onReset(): void {
    this.data = { ...this.EMPTY_DATA };
    this.sort = [];
    this.loadData();
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /** 更新状态 */
  updateStatus(item: TenantCurrency) {
    this.loading(true);

    this.api
      .updateCurrencyState({
        merchantId: item.merchantId,
        currency: item.currency,
        isEnable: item.isEnable,
      })
      .subscribe((res) => {
        this.loading(false);

        if (res === true) {
          this.loadData();
          this.currencyService.updateCurrency();
          this.appService.showToastSubject.next({
            msgLang: 'payment.currency.updateCompleted',
            successed: true,
          });
        } else {
          item.isEnable = !item.isEnable; // 还原修改的状态
          this.appService.showToastSubject.next({
            msgLang: 'payment.currency.updateFailed',
            successed: false,
          });
        }
      });
  }

  // 排序修改
  // async onSortChange(tpl, item, sortDom) {
  //   if (!sortDom || +sortDom.value === item.sort) return;
  //   const sort = sortDom.value; // 保存一手要修改的值
  //   sortDom.blur(); // 触发失去焦点事件还原值
  //
  //   const res = await this.modalService.open(tpl, { centered: true }).result;
  //   if (res !== true) return;
  //
  //   this.update(item, { sort });
  // }

  /**
   * 删除
   * @param tpl
   * @param item
   */
  async onDel(tpl, item) {
    const res = await this.modalService.open(tpl, { centered: true }).result;
    if (res !== true) return;

    this.loading(true);
    this.api.deleteCurrencyList(item.id).subscribe((res) => {
      this.loading(false);

      if (res === true) {
        this.loadData();
        this.currencyService.updateCurrency();
        this.appService.showToastSubject.next({
          msgLang: 'payment.currency.sucDeleted',
          successed: true,
        });
      } else {
        item.isEnable = !item.isEnable; // 还原修改的状态
        this.appService.showToastSubject.next({
          msgLang: 'payment.currency.failedToDelete',
          successed: false,
        });
      }
    });
  }

  /**
   * @description 获取系统汇率
   * @param item
   */
  getSystemRate(item: any) {
    return item.isReverse && item.systemRate
      ? new BigNumber(1).dividedBy(item.systemRate).toFixed(8).toString()
      : item.systemRate || 0;
  }

  /**
   * 拖拽排序
   * @param event
   */
  onDrop(event: CdkDragDrop<any, any>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.listWrap, event.previousIndex, event.currentIndex);

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateSort(
        this.subHeaderService.merchantCurrentId,
        this.list.map((e: any) => e.currency)
      )
      .pipe(
        catchError((err, caught) => {
          // 拖拽失败还原排序
          // this.loadData();
          return caught;
        })
      )
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res === true) {
          return this.appService.showToastSubject.next({ msgLang: 'common.operationSuccess', successed: true });
        }

        this.appService.showToastSubject.next({ msgLang: 'payment.currency.sortFail', successed: false });
        this.loadData();
      });
  }
}
