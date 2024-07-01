import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { VipApi } from 'src/app/shared/api/vip.api';

@Component({
  selector: 'app-select-member',
  templateUrl: './select-member.component.html',
  styleUrls: ['./select-member.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormRowComponent,
    FormWrapComponent,
    FormsModule,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    SelectChildrenDirective,
    SelectGroupDirective,
    PaginatorComponent,
    ModalFooterComponent,
    LangPipe,
    VipNamePipe,
  ],
})
export class SelectMemberComponent implements OnInit {
  constructor(
    public modal: MatModalRef<SelectMemberComponent, boolean>,
    private appService: AppService,
    private memberApi: MemberApi,
    public subHeaderService: SubHeaderService,
    private vipApi: VipApi
  ) {}

  @Input() tenantId;

  @Output() selectSuccess = new EventEmitter();

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  uid: any = '';
  vipLevel: any = '';

  vipLevelList: { name: string; value: number }[] = [];

  list: any[] = [];

  ngOnInit() {
    this.paginator.pageSize = 8;
    this.getVipLevelList();
    this.getList(true);
  }

  /** 获取VIPA/VIPC的等级 */
  getVipLevelList() {
    this.vipApi.vip_manage_level_simple_list(+this.tenantId).subscribe((res) => {
      if (res?.code === '0000' && Array.isArray(res?.data))
        this.vipLevelList = res.data.map((v) => ({ name: v.vipName, value: v.vipLevel }));
    });
  }

  getList(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      TenantId: +this.tenantId,
      SearchContent: this.uid,
      ...(this.vipLevel !== '' ? { VipGrade: this.vipLevel } : {}),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.memberApi.getMemberMiniList(params).subscribe((res) => {
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
}
