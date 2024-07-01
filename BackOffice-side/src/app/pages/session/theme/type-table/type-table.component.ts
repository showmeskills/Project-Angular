import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormsModule } from '@angular/forms';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TypeEditComponent } from './type-edit/type-edit.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ThemeApi } from 'src/app/shared/api/theme.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CategoryItem } from 'src/app/shared/interfaces/theme.interface';
import { ThemeService } from 'src/app/pages/session/theme/theme.service';
import { TopicLabelComponent } from 'src/app/pages/session/components/topic-label/topic-label.component';
@Component({
  selector: 'type-table',
  templateUrl: './type-table.component.html',
  styleUrls: ['./type-table.component.scss'],
  host: {
    class: 'card px-12 py-10',
  },
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    AngularSvgIconModule,
    FormsModule,
    TimeFormatPipe,
    LangPipe,
    TypeEditComponent,
    TopicLabelComponent,
  ],
})
export class TypeTableComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    private modalService: MatModal,
    private api: ThemeApi,
    private subHeaderService: SubHeaderService,
    public lang: LangService,
    public themeService: ThemeService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: CategoryItem[] = []; // 表格列表数据

  _destroy$ = new Subject<void>();
  deleteId!: number;
  /** lifeCycle */
  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  loadData(): void {
    this.loading(true);
    this.api.getCategoryQuery(this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.loading(false);
      if (res.code === '0') {
        this.list = res.data;
        this.themeService.categoryList$.next(res.data);
      }
    });
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  openAddColorPopup() {
    const modalRef = this.modalService.open(TypeEditComponent, {
      width: '600px',
      data: {},
    });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.result
      .then(() => {
        this.loadData();
      })
      .catch(() => {});
  }

  openEidtColorPopup(item: CategoryItem) {
    const modalRef = this.modalService.open(TypeEditComponent, {
      width: '600px',
      data: item,
    });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.componentInstance['isEdit'] = true;
    //刷新界面
    modalRef.result
      .then(() => {
        this.loadData();
      })
      .catch(() => {});
  }

  onDelete(tpl, id) {
    this.modalService.open(tpl, { width: '500px' });
    this.deleteId = id;
  }

  onDeleteSubmit() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.delCategory(this.subHeaderService.merchantCurrentId, this.deleteId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      const successed = res.code == '0';
      const msgLang = successed ? 'common.operationSuccess' : 'common.operationFailed';
      this.appService.showToastSubject.next({ msgLang, successed });
      this.themeService.delCategory$.next(true);
      this.loadData();
      this.modalService.closeAll();
    });
  }
}
