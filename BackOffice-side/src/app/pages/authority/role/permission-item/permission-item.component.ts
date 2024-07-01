import { Component, EventEmitter, HostBinding, Input, OnInit, Output, forwardRef } from '@angular/core';
import { RolePermission, RolePermissionList } from 'src/app/shared/interfaces/role';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgTemplateOutlet, JsonPipe } from '@angular/common';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';

@Component({
  selector: 'permission-item',
  templateUrl: './permission-item.component.html',
  styleUrls: ['./permission-item.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgFor,
    NgTemplateOutlet,
    forwardRef(() => PermissionItemComponent),
    JsonPipe,
    AttrDisabledDirective,
  ],
})
export class PermissionItemComponent implements OnInit {
  constructor() {}

  /**
   * 公共配置id 不允许编辑 WU2021-18639
   * @protected
   */
  protected readonly commonConfigId = 10000;

  @Input() data!: RolePermissionList;

  /**
   * 是否禁用
   */
  @Input() disabled = false;

  /** 是否打开 */
  @HostBinding('class.is-open')
  @Input('open')
  get open() {
    return this.data['open'];
  }

  set open(v: boolean) {
    this.data['open'] = v;
  }

  @Output() updateCheck = new EventEmitter<RolePermissionList>();

  /** lifeCycle */
  ngOnInit(): void {
    this._updateAllCheckStatus();
  }

  get hasDisabled() {
    return this.disabled || this.data.id === this.commonConfigId;
  }

  /** methods */

  /** 是否有权限列表 */
  hasPermission(item?: RolePermissionList): boolean {
    if (!item) return false;

    return !!item?.permissions?.length || item?.subTitles?.some((e) => this.hasPermission(e));
  }

  /**
   * 递归勾选所有子集
   * @param checked
   */
  public updateChecked(checked: boolean): void {
    this.loopCheck(this.data, checked, true, true); // 递归勾选所有子集
    this._updateAllCheckStatus(); // 更新父节点所选状态（对应子节点所选状态）
  }

  onChange(item: RolePermissionList | RolePermission, isAllType = false): void {
    if (item.id === this.commonConfigId || this.disabled) return; // 公共配置不允许编辑

    if (isAllType) {
      this.loopCheck(item, item['checked'], true, true); // 递归勾选所有子集
    } else {
      this.loopCheck(item); // 递归勾选sub子集
    }

    this._updateAllCheckStatus(); // 更新所有勾选状态
  }

  onChangeSub(item: RolePermissionList | RolePermission): void {
    this.loopCheck(item, item['checkedPermission'], true, true); // 递归勾选子集
    this._updateAllCheckStatus(); // 更新所有勾选状态
  }

  /** 更新当前组件所有勾选状态 */
  _updateAllCheckStatus(): void {
    this._updateCheckFn(this.data);
    this.updateCheck.emit();
  }

  /** 检测 */
  private _updateCheckFn(data: RolePermissionList | RolePermission) {
    const loop = (data: RolePermissionList | RolePermission) => {
      /** ================================================ */
      /** =================== 主要更新逻辑 ================= */
      /** ================================================ */
      if (data?.permissions?.length) {
        const isAllPermission = this.getHasAllPermission(data); // 是否全选权限
        const hasCheckedPermission = this.getHasCheckPermission(data); // 是否有勾选权限

        data['checkedPermission'] = hasCheckedPermission; // 勾选
        data['indeterminatePermission'] = hasCheckedPermission && !isAllPermission; // 半选 -> 如果有勾选且不是全选

        // 如果只有权限级，同步到当前组状态
        if (!data.subTitles.length) {
          data['checked'] = hasCheckedPermission;
          data['indeterminate'] = hasCheckedPermission && !isAllPermission;
        }
      }

      // 检测子集勾选和全选
      if (data?.subTitles?.length) {
        // 只需要检测子集是否有勾选
        const hasChecked = data.subTitles.some((e) => this.getHasCheck(e));
        const isAll = data?.subTitles
          .filter((j) => j?.permissions?.length || j?.subTitles?.length) // 过滤都为空的情况，避免被统计为false
          .every((e) => this.getHasAll(e)); // 是否全选

        data['checked'] = hasChecked;
        data['indeterminate'] = hasChecked && !isAll;
      }

      // 如果子集还有再进行递归更新
      if (data.subTitles.length) {
        data.subTitles.forEach((e) => loop(e));
      }
    };

    loop(data); // 递归更新
  }

  /** 是否有勾选 */
  getHasCheck(data: RolePermissionList | RolePermission): boolean {
    const checkedPermission = data?.permissions?.some((e) => e['checked']);
    const checkedSub = data?.subTitles?.some((e) => this.getHasCheck(e));

    if (data.permissions.length && data.subTitles.length) {
      return checkedPermission || checkedSub;
    } else if (data.permissions.length) {
      return checkedPermission;
    } else if (data.subTitles.length) {
      return checkedSub;
    } else {
      return data['checked']; // 当前分组是否勾选
    }
  }

  /** 是否有全选 */
  getHasAll(data: RolePermissionList | RolePermission): boolean {
    const allPermission = this.getHasAllPermission(data);
    const allSub = data?.subTitles?.every((e) => this.getHasAll(e));

    if (data?.permissions?.length && data?.subTitles?.length) {
      return allPermission && allSub;
    } else if (data.permissions.length) {
      return allPermission;
    } else if (data.subTitles.length) {
      return allSub;
    } else {
      return data['checked']; // 当前分组是否勾选
    }
  }

  /** 是否有勾选权限 */
  getHasCheckPermission(data: RolePermissionList | RolePermission): boolean {
    if (data?.permissions?.length) {
      return data.permissions.some((e) => e['checked']);
    } else {
      return !!data['checkedPermission']; // 当前分组是否勾选
    }
  }

  /** 是否有全选权限 */
  getHasAllPermission(data: RolePermissionList | RolePermission): boolean {
    // 迭代往里遍历查看是否有权限
    if (data.permissions.length) {
      return data.permissions.every((e) => e['checked']);
    } else {
      return data['checkedPermission']; // 当前分组是否勾选
    }
  }

  /** 递归勾选所有 */
  loopCheck(
    item: RolePermissionList | RolePermission,
    checked?: boolean,
    isPermission?: boolean,
    isSub?: boolean
  ): void {
    if (!item || this.hasDisabled) return;

    const val = checked !== undefined ? checked : item['checked'];
    const checkedPermission = checked !== undefined ? checked : item['checkedPermission'];

    // 过滤当前
    if (checked !== undefined) {
      // 如果接口有权限配置
      if (item?.permissions?.length) {
        item['checkedPermission'] = checkedPermission; // 勾选

        item.permissions?.forEach((e) => {
          e['checked'] = checkedPermission;
        });
      }
    }

    if (isPermission && !isSub) return; // 如果是权限就不递归了

    item.subTitles?.forEach((e) => {
      e['checked'] = val;
      this.loopCheck(e, val, isPermission, isSub);
    });
  }

  /** 切换打开 */
  onChangeOpen(event: MouseEvent) {
    event.stopPropagation(); // 阻止父级冒泡

    this.open = !this.open;
  }
}
