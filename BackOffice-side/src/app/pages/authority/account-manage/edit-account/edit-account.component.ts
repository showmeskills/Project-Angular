import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { AuthorityRoleApi } from 'src/app/shared/api/authority-role.api';
import { ResourceApi } from 'src/app/shared/api/resource.api';
import { UserApi } from 'src/app/shared/api/user.api';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { tap } from 'rxjs/operators';
import { finalize, zip } from 'rxjs';
import { ResourceRegionItem } from 'src/app/shared/interfaces/resource';
import { UserInfoUpdateParams } from 'src/app/shared/interfaces/user';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { searchFilter } from 'src/app/shared/pipes/array.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { CheckboxArrayControlDirective } from 'src/app/shared/directive/input.directive';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    ModalFooterComponent,
    searchFilter,
    LangPipe,
    CheckboxArrayControlDirective,
    AttrDisabledDirective,
  ],
})
export class EditAccountComponent implements OnInit {
  constructor(
    public modal: MatModalRef<EditAccountComponent, boolean>,
    private fb: FormBuilder,
    private appService: AppService,
    private modalService: MatModal,
    private userApi: UserApi,
    private resourceApi: ResourceApi,
    private roleApi: AuthorityRoleApi,
    private ls: LocalStorageService
  ) {}

  @Input() type: any; // 类型 add / edit
  @Input() data?: any; // 编辑 - 用户信息数据

  @Input() merchantList: any;
  @Input() roleList: any;
  @Input() resourceList: any;

  @Output() AddEditConfirm = new EventEmitter();

  formGroup = this.fb.group({
    userName: ['', Validators.required], // 账号
    merchantId: ['', Validators.required], // 商户
    resource: ['', Validators.required], // 资源
    leaderId: [''], // 主管
    leaderSearch: [''],
    mail: [''], // 邮箱
    tenantSuperAdmin: [false], // 所选商户的超级管理员
    groupSate: [false], // 群组状态
    region: [[] as number[]], // 资源地区
    isAccountManager: [false], // 是否是经理账号
    accountManagerName: [''], //经理账号名称
  });

  curRoleList: any = []; // 选中的角色 数据
  retainCurRoleList: any = []; // 不匹配的角色 数据

  curResourceList: any = []; // 选中的资源 数据
  retainCurResourceList: any = []; // 不匹配的资源 数据

  regionList: ResourceRegionItem[] = []; // 资源地区列表
  leaderList: any[] = []; // 主管全部 数据
  searchGroup: any = {};

  get isEdit() {
    return this.type === 'edit';
  }

  ngOnInit() {
    this.loading(true);
    zip([this.getLeaderList$(), this.getRegion$()])
      .pipe(
        finalize(() => {
          this.loading(false);
        })
      )
      .subscribe(() => {
        this.isEdit && this.onEdit();
      });
  }

  /** 打开可搜索过滤的下拉 */
  openSearchSelect(isOpen: boolean, key: string, el: HTMLInputElement): void {
    if (isOpen) {
      el.value = '';
      el.focus();
    } else {
      this.searchGroup[key] = '';
    }
  }

  /** 获取主管下拉列表 */
  getLeaderList$() {
    return this.userApi
      .getUserSelected({
        UserName: this.formGroup.value.leaderSearch,
        Page: 1,
        PageSize: 9999,
      })
      .pipe(
        tap((res) => {
          this.leaderList = Array.isArray(res?.list) ? res.list : [];

          if (res) {
            if (!this.leaderList.length) {
              this.appService.showToastSubject.next({
                msgLang: 'auManage.sys.manNull',
                successed: false,
              });
            }
          } else {
            this.appService.showToastSubject.next({
              msgLang: 'auManage.sys.manFail',
              successed: false,
            });
          }
        })
      );
  }

  /** 获取地区 */
  getRegion$() {
    return this.resourceApi.regionList().pipe(
      tap((res) => {
        this.regionList = res;
      })
    );
  }

  /** 编辑 - 初始化 */
  onEdit() {
    this.formGroup.patchValue({
      userName: this.data?.userName,
      merchantId: this.data?.tenantId,
      leaderId: this.data?.leaderId,
      mail: this.data?.mail,
      tenantSuperAdmin: !!this.data?.isTenantSuperAdmin,
      groupSate: !!this.data?.groupStatus,
      region: this.data?.continentalities.map((e) => e.id) || [],
      isAccountManager: this.data?.isAccountManager || false,
      accountManagerName: this.data?.accountManagerName || '',
    });
    this.curResourceList = this.data?.userResources;
    this.curRoleList = this.data?.userRoles;

    // 1. 从账号已选中的资源 匹配 资源库，筛选出 不在资源库中的特别资源 -> 页面显示不可删除
    this.retainCurResourceList = this.curResourceList.filter((v) => !this.resourceList.map((v) => v.id).includes(v.id));
    // 2. 并在账号已选中的资源 删除 不在资源库的资源 -> 可进行 增加/删除 操作
    this.curResourceList = this.curResourceList.filter(
      (v) => !this.retainCurResourceList.map((e) => e.id).includes(v.id)
    );

    this.retainCurRoleList = this.curRoleList.filter((v) => !this.roleList.map((v) => v.id).includes(v.id));
    this.curRoleList = this.curRoleList.filter((v) => !this.retainCurRoleList.map((e) => e.id).includes(v.id));
  }

  /** 删除资源/角色 */
  delResourceRole(type: any, i: any) {
    if (type === 'resource') {
      this.curResourceList.splice(i, 1);
    } else {
      this.curRoleList.splice(i, 1);
    }
  }

  /** 增加资源/角色 弹窗打开 */
  openAddPopup(tpl: any, type: any) {
    if (type === 'resource') {
      this.resourceList.forEach((item) => {
        item['checked'] = false;
        this.curResourceList.forEach((curItem) => {
          if (item.id === curItem.id) item['checked'] = true;
        });
      });
    } else {
      this.roleList.forEach((item) => {
        item['checked'] = false;
        this.curRoleList.forEach((curItem) => {
          if (item.id === curItem.id) item['checked'] = true;
        });
      });
    }
    const modalRef = this.modalService.open(tpl, {
      width: '540px',
      data: { type, list: type === 'resource' ? this.resourceList : this.roleList },
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 增加资源/角色 弹窗确认 */
  addConfirm(close: any, type: any) {
    if (type === 'resource') {
      this.curResourceList = this.resourceList.filter((e) => e.checked).map((v) => ({ id: v['id'], name: v['name'] }));
    } else {
      this.curRoleList = this.roleList.filter((e) => e.checked).map((v) => ({ id: v['id'], name: v['name'] }));
    }
    close(true);
  }

  confirm() {
    this.formGroup.patchValue({
      resource: [...this.retainCurResourceList, ...this.curResourceList].length > 0 ? '1' : '',
    });

    this.formGroup.markAllAsTouched(); // 手动执行验证
    if (this.formGroup.invalid) return;

    const editParams: UserInfoUpdateParams = {
      id: this.data?.id,
      userName: this.formGroup.value.userName || '',
      tenantId: this.formGroup.value.merchantId!,
      mail: this.formGroup.value.mail || '',
      userResources: [...this.curResourceList, ...this.retainCurResourceList],
      userRoles: [...this.curRoleList, ...this.retainCurRoleList],
      groupStatus: this.formGroup.value.groupSate!,
      leaderId: +this.formGroup.value.leaderId! || undefined,
      isTenantSuperAdmin: this.formGroup.value.tenantSuperAdmin!,
      // bann: 状态&超级管理员 默认使用账户信息数据，不传 后台默认关闭
      state: this.data?.status,
      isSuperAdmin: this.data?.isSuperAdmin,
      continentalities: this.regionList.filter((e) => this.formGroup.value.region?.includes(e.id)),
      isAccountManager: this.formGroup.value.isAccountManager || false,
      accountManagerName: this.formGroup.value.accountManagerName || '',
    };

    this.loading(true);
    // 新增
    if (!this.isEdit) {
      this.userApi
        .getCreateUser({
          ...editParams,
          state: 'Enabled', // 创建账号 默认账号开启状态
          isSuperAdmin: false, // 创建账号 默认账号非超级管理员
        })
        .subscribe((res) => {
          this.loading(false);
          if (typeof res === 'number' && !isNaN(res)) {
            this.AddEditConfirm.emit();
            this.appService.showToastSubject.next({
              msgLang: 'auManage.sys.accSuc',
              successed: true,
            });
            this.modal.close(true);

            let resourceParams = [
              ...this.curResourceList.map((v) => ({ userId: res, resourceId: v.id })),
              ...this.formGroup.value.region!.map((e) => ({ userId: res, resourceId: e })),
            ];

            let roleParams: any = [];
            if (this.curRoleList.length > 0) roleParams = this.curRoleList.map((v) => ({ userId: res, roleId: v.id }));

            // 添加账号资源
            if (resourceParams.length > 0) {
              this.loading(true);
              this.resourceApi.getCreateUserResource(resourceParams).subscribe((res) => {
                this.loading(false);
                this.appService.showToastSubject.next({
                  msgLang: res === true ? 'auManage.sys.accSourceSuc' : 'auManage.sys.accSourceFail',
                  successed: res === true,
                });
              });
            }

            // 添加账号角色
            if (roleParams.length > 0) {
              this.loading(true);
              this.roleApi.createuserrole(roleParams).subscribe((res) => {
                this.loading(false);
                this.appService.showToastSubject.next({
                  msgLang: res === true ? 'auManage.sys.accRoleAdd' : 'auManage.sys.roleFail',
                  successed: res === true,
                });
              });
            }
          } else {
            this.appService.showToastSubject.next({
              msgLang: res.error.detail || 'auManage.sys.accFail',
              successed: false,
            });
          }
        });
    }
    // 编辑
    else {
      this.userApi.updateuser(editParams).subscribe((res) => {
        this.loading(false);
        if (res === true) {
          this.AddEditConfirm.emit();
          this.modal.close(true);
        }
        this.appService.showToastSubject.next({
          msgLang: res === true ? 'auManage.sys.editSuc' : 'auManage.sys.editFail',
          successed: res === true,
        });

        if (this.data.id === this.ls.userInfo.id) {
          // 您修改了当前账号，即将刷新页面
          this.appService.showToastSubject.next({ msgLang: 'auManage.sys.modifyAccountRefresh', type: 'warning' });

          // 编辑自己的账号信息，刷新页面，重新获取当前用户信息
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      });
    }
  }

  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }
}
