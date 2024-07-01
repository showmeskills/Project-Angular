import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { Subject, takeUntil } from 'rxjs';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CategoryMenuComponent } from '../category-menu/category-menu.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-competition-manage',
  templateUrl: './competition-manage.component.html',
  styleUrls: ['./competition-manage.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatTabsModule,
    NgFor,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    CategoryMenuComponent,
    AngularSvgIconModule,
    LabelComponent,
    FormWrapComponent,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class CompetitionManageComponent implements OnInit, OnDestroy {
  _destroyed$: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false;

  constructor(
    private appService: AppService,
    private modalService: MatModal,
    private subHeaderService: SubHeaderService
  ) {}

  currentTab: any = 2; // 当前选中
  tabs = [
    { name: '滚球', value: 1 },
    { name: '24H', value: 2 },
    { name: '未来赛事', value: 3 },
    { name: '冠军', value: 4 },
  ];

  provider: any = 1; // 当前选中
  providerList: any[] = [
    { name: 'GB', value: 1 },
    { name: 'Betrader', value: 2 },
    { name: 'Betgenius', value: 3 },
    { name: 'API-365', value: 4 },
  ];

  currentTabDate: any = 3; // 当前选中
  dateList: any[] = [
    { name: '09/16 (94)', value: 1 },
    { name: '09/17 (305)', value: 2 },
    { name: '09/18 (104)', value: 3 },
    { name: '其他 (99)', value: 4 },
  ];

  curMatched: any = 1;
  notMatchedList: any[] = [
    { value: 1, expand: true, child: [1, 2] },
    { value: 2, child: [1, 2] },
    { value: 3, child: [1, 2] },
    { value: 4, child: [] },
  ];

  listSearch: any = '';

  curCompetition: any = 1;
  competitionList: any[] = [
    { value: 'blue', child: [1, 2] },
    { value: 'green', checked: true, child: [1, 2] },
    { value: 'orange', child: [1, 2] },
    { value: 'red', child: [1, 2] },
    { value: 'blue', hot: true, expand: true, checked: true, child: [1, 2] },
    { value: 'green', child: [1, 2] },
    { value: 'orange', child: [1, 2] },
  ];

  ngOnInit() {
    this.paginator.total = 100;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe(() => {
      this.getList(true);
    });
  }

  changeTabIndex(tabValue: any) {
    this.currentTab = tabValue;
  }

  selectProvider() {}

  sportsMenuChange(e: any) {
    console.log(e);
  }

  changeTabDate(tabValue: any) {
    this.currentTabDate = tabValue;
  }

  onSort(sortKey: any) {
    console.log(sortKey);
  }

  getList(resetPage = false) {
    resetPage && (this.paginator.page = 1);
  }

  onOpenWarningPopup(tpl: any) {
    const modalRef = this.modalService.open(tpl, { width: '540px', disableClose: true });
    modalRef.result.then(() => {}).catch(() => {});
  }

  warningPopupConfirm(close: any) {
    close(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
