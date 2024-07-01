import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-role-transfer',
  templateUrl: './role-transfer.component.html',
  styleUrls: ['./role-transfer.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, SelectGroupComponent, NgFor, FormsModule],
})
export class RoleTransferComponent implements OnInit, OnDestroy {
  constructor(public modal: MatModalRef<any>) {}

  @Input() public list!: Array<any>;
  @Input() public selectedList!: Array<any>;

  roleList: Array<any> = []; //角色列表
  selectedLeft: Array<any> = []; // 左侧选中的角色
  rightList: Array<any> = []; //右侧角色列表

  /** lifeCycle */
  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.roleList = this.list;
    this.selectedList.forEach((item) => {
      this.selectedLeft.push(item.roleId);
    });
    this.join();
  }

  /** methods */
  ok(): void {
    const res: Array<{ roleId: number; roleName: string }> = [];
    this.rightList.forEach((item) => {
      res.push({ roleId: item.id, roleName: item.name });
    });
    this.modal.close(res);
  }

  close(): void {
    this.modal.dismiss();
  }

  /**
   * 加入
   */
  join() {
    this.rightList = [];
    this.roleList.forEach((item) => {
      if (this.selectedLeft.indexOf(item.id) > -1) {
        item['checked'] = false;
        this.rightList.push(item);
      }
    });
  }

  /**
   * 移除
   */
  del() {
    const ls: Array<any> = [];
    this.rightList.forEach((item) => {
      if (!item.checked) {
        ls.push(item);
      }
    });
    this.rightList = ls;
  }

  /**
   * 清空
   */
  clear() {
    this.rightList = [];
  }
}
