import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { EditAccountComponent } from './edit-account/edit-account.component';
import { AppService } from 'src/app/app.service';
import { forkJoin } from 'rxjs';
import { AuthorityRoleApi } from 'src/app/shared/api/authority-role.api';
import { ResourceApi } from 'src/app/shared/api/resource.api';
import { UserApi } from 'src/app/shared/api/user.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-account-manage',
  templateUrl: './account-manage.component.html',
  styleUrls: ['./account-manage.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    AngularSvgIconModule,
    LabelComponent,
    NgIf,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class AccountManageComponent implements OnInit {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false;

  constructor(
    public appService: AppService,
    private modalService: MatModal,
    private roleApi: AuthorityRoleApi,
    private resourceApi: ResourceApi,
    private selectApi: SelectApi,
    private api: UserApi,
    private lang: LangService
  ) {}

  merchantList: any[] = []; // 商户 数据
  roleList: any = []; // 角色 数据
  resourceList: any = []; // 资源 数据

  data: any = {};
  dataEmpty: any = {
    account: '', // 账号
    role: '', // 角色
    merchant: '', // 商户

    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  list: any[] = [1, 2, 3];

  ngOnInit() {
    forkJoin([
      this.resourceApi.getResourceSelect(), // 获取资源
      this.selectApi.getMerchantList(true), // 获取商户
      this.roleApi.getRoleSelect({ groupId: 0 }), // 获取角色
    ]).subscribe(([resourceList, merchantList, roleRes]) => {
      this.loading(false);
      this.resourceList = resourceList || [];
      this.merchantList = merchantList || [];
      this.roleList = roleRes || [];
    });
    // 数据初始化
    this.onReset();
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      UserName: this.data.account,
      RoleName: this.data.role,
      TenantId: this.data.merchant,
      ...this.paginator,
      ...(this.data.order
        ? {
            UserSort: this.data.order,
            IsAsc: this.data.isAsc,
          }
        : {}),
    };
    this.api.getUser(params).subscribe((res) => {
      this.loading(false);
      this.list = res?.list || [];
      this.paginator.total = res?.total || 0;

      if (!this.list.length) return;
      this.list.forEach((item) => {
        item.status = item.status == 'Enabled' ? true : false;
        item.roleNames = item.roleNames.filter((v) => v) || [];
      });
    });
  }

  async updateStatus(temp, item) {
    const en = await this.lang.getOne('auManage.sys.enable');
    const dis = await this.lang.getOne('auManage.sys.disable');
    setTimeout(() => (item.status = !item.status)); // 还原状态
    const msg = item.status ? en : dis;
    const modalRef = this.modalService.open(temp, { width: '540px', data: { msg, item } });
    modalRef.result.then(() => {}).catch(() => {});
  }

  popupConfirm(close: any, item: any) {
    const params = { ...item };
    params.state = !params.status ? 'Enabled' : 'Disabled';
    this.loading(true);
    this.api.updateuser(params).subscribe((res) => {
      this.loading(false);
      if (res === true) {
        this.list.forEach((v) => {
          if (v.id == params.id) v.status = !params.status;
        });
      }
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'game.change_suc' : 'game.change_fail',
        successed: res === true ? true : false,
      });
      close(true);
    });
  }

  // 重置
  onReset() {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  addAccount() {}

  // 排序
  onSort(sortKey: any) {
    if (!this.list.length) return;

    if (this.data.isAsc === false && this.data.order === sortKey) {
      this.data.order = '';
      this.data.isAsc = true;
      this.loadData(true);
      return;
    }

    if (!this.data.order || this.data.order !== sortKey) {
      this.data.order = sortKey;
      this.data.isAsc = false;
    }

    this.data.isAsc = !this.data.isAsc;
    this.loadData(true);
  }

  onAddEdit(type: any, id?: any) {
    if (type === 'edit') {
      this.loading(true);
      this.api.getUserInfo({ userId: id }).subscribe((res) => {
        this.loading(false);
        if (res) {
          this.openAddEditPopup(type, res);
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'auManage.sys.infoFail',
            successed: false,
          });
        }
      });
    } else {
      this.openAddEditPopup(type);
    }
  }

  openAddEditPopup(type: any, data?: any) {
    const modalRef = this.modalService.open(EditAccountComponent, { width: '650px', disableClose: true });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['merchantList'] = this.merchantList;
    modalRef.componentInstance['roleList'] = this.roleList;
    modalRef.componentInstance['resourceList'] = this.resourceList;
    if (type === 'edit') modalRef.componentInstance['data'] = data;

    modalRef.componentInstance.AddEditConfirm.subscribe(() => setTimeout(() => this.loadData(), 100));
    modalRef.result.then(() => {}).catch(() => {});
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  resetPassword(temp, id) {
    this.modalService.open(temp, { width: '540px', data: { id } });
  }

  resetConfirm(c, id) {
    this.api.resetPassword({ id }).subscribe((res) => {
      this.appService.showToastSubject.next({
        msgLang: res ? 'auManage.sys.passwordSuc' : 'auManage.sys.auManage.sys.failedPassword',
        successed: res,
      });
    });
    c();
  }
}
