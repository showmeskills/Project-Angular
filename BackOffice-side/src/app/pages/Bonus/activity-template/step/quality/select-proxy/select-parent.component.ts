import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { AppService } from 'src/app/app.service';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormsModule } from '@angular/forms';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivityCreateStep2ParentInfo } from 'src/app/shared/interfaces/activity';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';

@Component({
  selector: 'select-parent',
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    LangPipe,
    ModalFooterComponent,
    FormRowComponent,
    FormsModule,
    SelectGroupDirective,
    SelectChildrenDirective,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    PaginatorComponent,
    EmptyComponent,
  ],
  templateUrl: './select-parent.component.html',
  styleUrls: ['./select-parent.component.scss'],
})
export class SelectParentComponent implements OnInit {
  modal = inject(MatModalRef<SelectParentComponent>);
  private api = inject(ActivityAPI);
  private appService = inject(AppService);
  merchantId = 0;
  uid = '';
  userType = 2; // 用户类型(2=推荐上级/3=代理)
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(1, 10); // 分页
  list: ActivityCreateStep2ParentInfo[] = [];

  get title() {
    switch (this.userType) {
      case 2:
        return 'luckRoulette.friendSelect.title';
      case 3:
        return 'luckRoulette.proxySelect.title';
      default:
        return '';
    }
  }

  ngOnInit() {
    this.loadData(true);
  }

  /**
   * 提交
   */
  submit() {
    this.modal.close(this.list.filter((e) => e['checked']).map((e) => e.superId));
  }

  /**
   * 请求数据
   */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .referral_getSuperList({
        current: this.paginator.page,
        size: this.paginator.pageSize,
        tenantId: this.merchantId,
        uid: this.uid,
        userType: this.userType,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      });
  }
}
