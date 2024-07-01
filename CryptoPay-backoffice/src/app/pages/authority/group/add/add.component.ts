import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateGroupParams, Group, UpdateGroupParams } from 'src/app/shared/interfaces/group';
import { MemberSelectComponent } from './member-select/member-select.component';
import { UserApi } from 'src/app/shared/api/user.api';
import { AppService } from 'src/app/app.service';
import { Subscription } from 'rxjs';
import { AuthorityGroupApi } from 'src/app/shared/api/authority-group.api';
// import { RoleTransferComponent } from './role-transfer/role-transfer.component';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AuthorityRoleApi } from 'src/app/shared/api/authority-role.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { UserInfo } from 'src/app/shared/interfaces/common.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { EditComponent } from '../../role/edit/edit.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    LabelComponent,
    AngularSvgIconModule,
    EditComponent,
    LangPipe,
  ],
})
export class AddComponent implements OnInit, OnDestroy {
  group!: Group;
  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  userInfoList!: Array<UserInfo>;
  id!: number;
  memberSelectedList: Array<any> = [];
  memberSelectedListOrigin: Array<any> = [];
  private isLoading = false; // 是否处于加载
  private getUserSubscription!: Subscription;
  private createGroupSubscription!: Subscription;
  private getRoleSubscription!: Subscription;
  private paginator: PaginatorState = new PaginatorState(); // 分页
  // roleList: Array<any> = [];

  constructor(
    private api: AuthorityGroupApi,
    private fb: FormBuilder,
    private router: Router,
    private modalService: MatModal,
    private userApi: UserApi,
    private appService: AppService,
    public lang: LangService,
    private activatedRoute: ActivatedRoute,
    private roleApi: AuthorityRoleApi
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  typeList: any[] = [
    { value: 'None', label: '无' },
    { value: 'Agent', label: '代理' },
    { value: 'Finance', label: '财务' },
    { value: 'Personnel', label: '人事' },
    { value: 'Operation', label: '运营' },
    { value: 'CustomerService', label: '客服' },
    // {value: 'NoUse', label: ''},
  ];

  /** getters */
  get isEdit() {
    return !!this.id;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();
    this.getUser();
    // this.id && this.getRole();
    this.id && this.getbygroup();
  }

  ngOnDestroy(): void {
    this.getUserSubscription.unsubscribe();
    this.createGroupSubscription && this.createGroupSubscription.unsubscribe();
    this.getRoleSubscription && this.getRoleSubscription.unsubscribe();
  }

  /**
   * 选择角色
   */
  // async openSelectRole(item) {
  //   const modalRef = this.modalService.open(RoleTransferComponent, {
  //     width: '800px',
  //   });

  //   modalRef.componentInstance.list = this.roleList;
  //   modalRef.componentInstance.selectedList = item.roles || [];
  //   const res = await modalRef.result;

  //   item.roles = res;
  //   if (!res) return;
  // }

  /**
   * 获取角色
   */
  // getRole() {
  //   this.paginator.page = 0;
  //   this.paginator.pageSize = 999;
  //   const groupId: any = this.id;
  //   this.loading(true);
  //   this.getRoleSubscription = this.roleApi.getList({ ...this.paginator, roleName: '', groupId }).subscribe((res) => {
  //     this.roleList = res.list;
  //     this.loading(false);
  //   });
  // }

  /**
   * 获取已选中成员
   */
  getbygroup() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getbygroup(this.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res instanceof Object) {
        this.memberSelectedList = res.users || [];
        this.memberSelectedListOrigin = JSON.parse(JSON.stringify(this.memberSelectedList)); //保存原始数据
        this.formGroup.controls['groupName'].setValue(res.groupName);
        this.formGroup.controls['supervisor'].setValue(res.leaderId);
        // this.formGroup.controls['type'].setValue(res.groupType);
      }
    });
  }

  /**
   * 删除成员
   * @param id
   */
  async memberDel(id) {
    this.memberSelectedList = this.memberSelectedList.filter((e) => e.id !== id);
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      groupName: ['', Validators.compose([Validators.required])],
      supervisor: [undefined, Validators.compose([Validators.required])],
      // type: ['Agent', Validators.compose([Validators.required])],
      member: [''],
    });
    this.validator = new FormValidator(this.formGroup);
  }

  /** 打开成员 */
  openMember(): void {
    this.loading(true);
    const params = {
      GroupStatus: true,
      page: 1,
      pageSize: 999,
    };
    this.getUserSubscription = this.userApi.getGroupUser(params).subscribe((res) => {
      this.loading(false);
      if (res) {
        const service = this.modalService.open(MemberSelectComponent, { width: '440px' });
        service.componentInstance.list = res?.list || [];
        service.componentInstance.selectedList = this.memberSelectedList;
        service.componentInstance['transferData'].subscribe((selectedList: Array<any>) => {
          this.memberSelectedList = selectedList;
        });
      }
    });
  }

  ok(): void {
    if (this.id) {
      this.update();
    } else {
      this.add();
    }
  }

  /**
   * 添加
   */
  add() {
    this.formGroup.markAllAsTouched(); // 手动执行验证
    if (this.formGroup.invalid) return;
    const params: CreateGroupParams = {
      groupName: this.formGroup.value.groupName,
      leaderId: this.formGroup.value.supervisor,
      // groupType: this.formGroup.value.type === 'None' ? undefined : this.formGroup.value.type,
      remark: '',
      memberIds: this.memberSelectedList.map((e) => e.id),
    };
    this.loading(true);
    this.createGroupSubscription = this.api.creatgroup(params).subscribe((res) => {
      this.loading(false);

      if (res?.repeatedUserNameList?.length) {
        this.appService.showToastSubject.next({
          msgLang: 'auManage.role.reAc' + res.repeatedUserNameList.join(','),
          successed: false,
        });
      }

      if (!res?.success) {
        return this.appService.showToastSubject.next({
          msgLang: 'auManage.role.addFail',
          successed: false,
        });
      }

      this.appService.showToastSubject.next({ msgLang: 'auManage.role.adSuc', successed: true });
      this.back();
    });
  }

  /**
   * 修改
   */
  async update() {
    this.formGroup.markAllAsTouched(); // 手动执行验证
    if (this.formGroup.invalid) return;

    const params: UpdateGroupParams = {
      groupName: this.formGroup.value.groupName,
      leaderId: this.formGroup.value.supervisor,
      // groupType: this.formGroup.value.type,
      remark: '',
      groupId: this.id,
      groupUsers: this.memberSelectedList.map((e) => e.id),
      userRoles: this.memberSelectedList
        .map((e) => e?.roles?.map((j) => ({ roleId: j.roleId, userId: e.id })))
        .flat(Infinity)
        .filter((e) => e),
    };

    this.loading(true);
    const res1 = await this.api.updategroup(params);
    this.loading(false);

    if (res1?.repeatedUserNameList?.length) {
      const reAc = await this.lang.getOne('auManage.role.reAc');
      this.appService.showToastSubject.next({
        msg: reAc + res1.repeatedUserNameList.join(','),
        successed: false,
      });
    }

    if (!res1?.success) {
      return this.appService.showToastSubject.next({
        msgLang: 'auManage.role.changeFail',
        successed: false,
      });
    }

    this.appService.showToastSubject.next({ msgLang: 'auManage.role.changeSuc', successed: true });
    this.back();
  }

  back(): void {
    this.router.navigate(['/authority/group']);
  }

  getUser() {
    this.loading(true);
    this.getUserSubscription = this.userApi.getUser({ page: 0, pageSize: 999 }).subscribe((res) => {
      this.loading(false);
      this.userInfoList = res.list;
    });
  }

  /** loading处理 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /** 打开角色编辑 */
  // openRole(tpl: any) {
  //   const modalRef = this.modalService.open(tpl, { width: '840px' });
  //   modalRef.result.then(() => this.getRole());
  // }
}
