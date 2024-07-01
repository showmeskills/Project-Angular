import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Subject, takeUntil } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';

@Component({
  selector: 'app-select-channel',
  templateUrl: './select-channel.component.html',
  styleUrls: ['./select-channel.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormRowComponent,
    FormWrapComponent,
    FormsModule,
    NgIf,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    PaginatorComponent,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class SelectChannelComponent implements OnInit, OnDestroy {
  constructor(
    public modal: MatModalRef<SelectChannelComponent, boolean>,
    private appService: AppService,
    private memberApi: MemberApi,
    public subHeaderService: SubHeaderService
  ) {}

  @Output() selectSuccess = new EventEmitter();

  _destroyed$: any = new Subject<void>(); // 订阅商户的流

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  uid: any = '';
  list: any = [];

  ngOnInit() {
    this.paginator.pageSize = 8;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe(() => {
      this.getList(true);
    });
  }

  getList(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      TenantId: +this.subHeaderService.merchantCurrentId,
      SearchContent: this.uid,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.memberApi.getMemberRelationList(params).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  onClear() {
    this.uid = '';
    this.getList(true);
  }

  confirm() {
    if (this.list.length > 0) this.selectSuccess.emit(this.list.filter((v) => v.checked));
    this.modal.close(true);
  }

  // onSort(type?: any) {}

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
