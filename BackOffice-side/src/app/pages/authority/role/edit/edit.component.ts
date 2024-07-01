import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorityRoleApi } from 'src/app/shared/api/authority-role.api';
import { Role, RolePermission, RolePermissionList } from 'src/app/shared/interfaces/role';
import { PermissionApi } from 'src/app/shared/api/permission.api';
import { AppService } from 'src/app/app.service';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AuthorityGroupApi } from 'src/app/shared/api/authority-group.api';
import { finalize, Subscription } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PermissionItemComponent } from '../permission-item/permission-item.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf } from '@angular/common';
import { PermissionWrapperDirective } from 'src/app/pages/authority/role/permission-item/permission-wrapper.directive';

@Component({
  selector: 'role-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    FormRowComponent,
    MatExpansionModule,
    NgFor,
    PermissionItemComponent,
    LangPipe,
    PermissionWrapperDirective,
  ],
})
export class EditComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: AuthorityRoleApi,
    private appService: AppService,
    private permissionApi: PermissionApi,
    private activatedRoute: ActivatedRoute,
    private groupApi: AuthorityGroupApi,
    private lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = +id || 0;
  }

  id = 0; // 编辑所用id
  role!: Role; // 表单
  isLoading = false; // 是否加载
  permissionList: RolePermissionList[] = []; // 权限列表
  EMPTY_ROLE: Role = {
    // 空值
    id: undefined,
    name: '',
    group: '',
    permissions: [],
    state: true,
  };

  groupList: Array<any> = [];
  getGroupSubscription!: Subscription;
  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  paginator: PaginatorState = new PaginatorState(); // 分页
  isShowGroupDonwList = false;

  @ViewChild(MatAccordion) accordion!: MatAccordion;

  /** 所属群组 */
  @Input()
  get group() {
    return this._group;
  }

  set group(v: any) {
    this._group = v;
    this.formGroup.get('group')?.setValidators(v ? Validators.required : null);
  }

  private _group: any;

  /** 返回事件 */
  @Output() back = new EventEmitter();

  /** 提交事件 */
  @Output() confirm = new EventEmitter();

  /** lifeCycle */
  ngOnDestroy(): void {
    this.getGroupSubscription.unsubscribe();
  }

  get isEdit() {
    return !!this.id;
  }

  get isNew() {
    return !!this.group || !this.id;
  }

  get labelWidth() {
    return '180px';
  }

  get isAllChecked(): boolean {
    return this.permissionList.every((e) => e?.['checked'] && !e['indeterminate']);
  }

  get indeterminate(): boolean {
    return !this.isAllChecked && this.permissionList.some((e) => e['indeterminate'] || e['checked']);
  }

  ngOnInit(): void {
    const isGroupRole = localStorage.getItem('isGroupRole');
    this.isShowGroupDonwList = isGroupRole === '1';
    this.loadForm();
    this.getPermissionList();
    this.getGroupList();

    window['indeterminate'] = this.indeterminate;
    window['isAllChecked'] = this.isAllChecked;
  }

  // 获取数据
  getGroupList(): void {
    this.loading(true);
    this.paginator.page = 1;
    this.paginator.pageSize = 999;
    this.getGroupSubscription = this.groupApi
      .getList(this.paginator)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.groupList = res.list;

        if (this.group && !this.groupList.some((e) => String(e.id) === String(this.group))) {
          this.appService.showToastSubject.next({ msgLang: 'auManage.role.unfind' });
          return this.back.emit();
        } else if (this.group) {
          this.formGroup.patchValue({
            group: this.group,
          });
        }
      });
  }

  // 获取权限列表
  getPermissionList(): void {
    this.loading(true);
    this.permissionApi.getRole(this.group ? 0 : this.id).subscribe((res) => {
      this.loading(false);
      this.permissionList = this.addCheckedVal(res.titles[0]?.subTitles || []);

      if (this.isEdit && !this.group) {
        this.formGroup.patchValue({
          name: res.name,
          state: res.state === 'Enabled',
          group: res.groupID,
        });
      }

      this.accordion.openAll();
    });
  }

  // 获取选中权限id
  getPermissionIds() {
    const ids: number[] = [];

    // 递归获取所有子权限id -> 目前只取权限id 分组没有权限id勾选无效后台也不会保存分组的勾选
    const loop = (list: RolePermissionList[] | RolePermission[]) => {
      list.forEach((e) => {
        if (e.permissions?.length) {
          e.permissions.forEach((j) => {
            if (j['checked']) ids.push(j.id);
          });
        } else if (e.subTitles?.length) {
          loop(e.subTitles);
        }
      });
    };

    loop(this.permissionList);

    return ids;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 给权限列表 添加选择属性
  addCheckedVal(data: any, defaultChecked = false): any[] {
    const process = (obj) => {
      // 编辑的已勾选状态
      if (!this.isNew && obj.access !== undefined) {
        defaultChecked = obj.access;
      }
      obj.checked = defaultChecked;
      obj.subTitles = this.addCheckedVal(obj.subTitles, defaultChecked);
      obj.permissions = this.addCheckedVal(obj.permissions, defaultChecked);
      return obj;
    };

    if (Array.isArray(data)) {
      return data.map((e) => process(e));
    } else if (typeof data === 'object') {
      data = process(data);
    }

    return data;
  }

  onState(): void {
    this.role.state = this.formGroup.controls?.['state']?.value; // 状态
  }

  loadForm(): void {
    this.role = this.EMPTY_ROLE;
    this.formGroup = this.fb.group({
      name: [this.role.name, Validators.required],
      group: [this.role.group, this.group ? Validators.required : null],
      state: [this.role.state],
    });
    this.validator = new FormValidator(this.formGroup);
  }

  onBack(): void {
    if (this.group) {
      return this.back.emit(this.group);
    }

    if (this.isShowGroupDonwList && this.id) {
      this.router.navigate(['/authority/role/groupRole/' + this.id]);
    } else {
      this.router.navigate(['/authority/role']);
    }
  }

  async ok() {
    const cr = await this.lang.getOne('auManage.role.create');
    const change = await this.lang.getOne('auManage.role.chnage');
    const title = this.isNew ? cr : change;
    const formData = this.formGroup.controls;
    this.role.name = formData?.['name']?.value; // 角色名称

    this.loading(true);
    this.permissionApi[this.isNew ? 'createRole' : 'updateRole']({
      id: this.group ? 0 : this.id,
      roleId: this.group ? 0 : this.id,
      groupId: formData?.['group']?.value || 0,
      name: this.role.name,
      state: this.role.state,
      permissionId: this.getPermissionIds(),
    }).subscribe((res) => {
      this.loading(false);

      if (res && res.error) {
        this.appService.showToastSubject.next({
          msg: `${title}失败${res.error.detail.includes('Role Already Exists') ? '，角色名称已存在！' : ''}`,
          successed: false,
        });
      } else if (typeof res === 'number' || res === true) {
        this.formGroup.patchValue(this.EMPTY_ROLE);
        this.appService.showToastSubject.next({
          msg: `${title}角色成功！`,
          successed: true,
        });

        if (this.group) {
          return this.confirm.emit(true);
        } else {
          this.onBack();
        }
      }
    });
  }

  /**
   * 批量展开或收起
   * @param isOpen 是否展开
   */
  batchAll(isOpen: boolean): void {
    const loop = (arr: RolePermissionList[]) => {
      arr.forEach((e) => {
        e['open'] = isOpen;
        e.subTitles?.length && loop(e.subTitles);
      });
    };

    loop(this.permissionList);
  }
}
