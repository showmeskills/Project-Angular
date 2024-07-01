import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputPercentageDirective } from 'src/app/shared/directive/input.directive';
import { MatDialogModule } from '@angular/material/dialog';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-lottery-setting',
  templateUrl: './lottery-setting.component.html',
  styleUrls: ['./lottery-setting.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    MatDialogModule,
    InputPercentageDirective,
    LangPipe,
  ],
})
export class LotterySettingComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private appService: AppService,
    public modal: NgbModal,
    private api: LotteryApi,
    public subHeaderService: SubHeaderService
  ) {}

  isLoading = false;
  // 表单搜索数据
  searchData: any = {};
  searchDataEMPT: any = {
    lotteryStatus: '',
    lotteryName: '',
    lotteryType: '',
  };

  // 筛选数据
  lotteryNameList: any[] = [];

  // 编辑表单数据
  editDate: any = {};

  // 页面数据
  list: any = [];

  ngOnInit(): void {
    this.searchData = { ...this.searchDataEMPT };
    // this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData(true);
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;

    this.loading(true);
    this.api
      .lotterySetupPage(this.subHeaderService.merchantCurrentId, {
        size: this.paginator.pageSize,
        current: this.paginator.page,
        ...(this.searchData.lotteryStatus ? { lotteryStatus: this.searchData.lotteryStatus } : {}),
        ...(this.searchData.lotteryName ? { lotteryName: this.searchData.lotteryName } : {}),
        ...(this.searchData.lotteryType ? { lotteryType: this.searchData.lotteryType } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.data.records || [];
        this.paginator.total = res.data.total;
      });
  }

  getLotteryName() {
    this.searchData.lotteryName = '';
    this.loading(true);
    this.api.lotterySetupGetlotteryBylotteryType(this.searchData.lotteryType).subscribe((res) => {
      this.loading(false);
      this.lotteryNameList = res.data || [];
    });
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.searchData = { ...this.searchDataEMPT };
    this.lotteryNameList = [];
    this.loadData(true);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onItemLottery(id: any) {
    this.loading(true);
    this.api.lotterySetupGetById(this.subHeaderService.merchantCurrentId, id).subscribe((res) => {
      this.loading(false);
      this.editDate = res.data;
    });
  }

  async onEdit(detailTpl: TemplateRef<any>, id: any) {
    this.onItemLottery(id);
    this.modal.open(detailTpl, {
      centered: true,
      windowClass: 'lottery-edit-modal',
    });
  }

  onSubmit() {
    this.loading(true);
    this.api
      .lotterySetupUpdate(this.subHeaderService.merchantCurrentId, {
        lotteryId: this.editDate.lotteryId,
        lotteryName: this.editDate.lotteryName,
        lotteryType: this.editDate.lotteryType,
        ...(this.editDate.lotteryStatus ? { lotteryStatus: 1 } : { lotteryStatus: 0 }),
        lotteryCancelOrder: this.editDate.lotteryCancelOrder,
        lotteryStopBetSecond: this.editDate.lotteryStopBetSecond,
      })
      .subscribe((res) => {
        this.loading(false);
        if (res.code === '200') {
          this.appService.showToastSubject.next({
            msgLang: 'lotto.subSucess',
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'lotto.subFailed',
            successed: false,
          });
        }
        this.loadData();
      });
  }
}
