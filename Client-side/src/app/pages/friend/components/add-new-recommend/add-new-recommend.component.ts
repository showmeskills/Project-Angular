import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { FriendService } from './../../friend.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;

@UntilDestroy()
@Component({
  selector: 'app-add-new-recommend',
  templateUrl: './add-new-recommend.component.html',
  styleUrls: ['./add-new-recommend.component.scss'],
})
export class AddNewRecommendComponent implements OnInit {
  isH5!: boolean;
  percentList: any[] = [
    { percent: 0, completed: false, active: true },
    { percent: 0.5, completed: false, active: false },
    { percent: 1, completed: false, active: false },
    { percent: 1.5, completed: false, active: false },
    { percent: 2, completed: false, active: false },
  ]; // percent bar 进度条
  idx: number = 0;
  width: number = 0; // 对应的宽度百分比
  friendPercent: number = 0; // 进度条下面的 朋友百分比
  myPercent: number = 2; // 进度条下面的我的百分比
  percent: boolean = true; // 如果checkbox选中然后,进入条自动前进
  checkedBox: boolean = false; // 是否选中checkbox
  isAgentLogon: boolean = true; // 当前登录是否代理
  isShowAgentInfo: boolean = true; //是需要提示信息
  remark: string = '';
  loading: boolean = false;
  constructor(
    private layout: LayoutService,
    private dialogRef: MatDialogRef<AddNewRecommendComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { callback: DialogDataSubmitCallback<any>; isSave: boolean },
    private friendApi: FriendApi,
    private friendService: FriendService,
    private toast: ToastService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService
      .getUserAgentStatus()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.isAgentLogon = data;
        this.onClickItem(0);
      });
  }

  async postCreateLink() {
    const body = {
      FriendRate: this.friendPercent / 1000,
      IsDefault: this.checkedBox,
      Remark: this.remark,
    };
    this.loading = true;
    await this.friendApi.postCreateLink(body).then((data: any) => {
      this.loading = false;
      if (data?.data) {
        this.toast.show({ message: this.localeService.getValue('add_suc'), type: 'success' });
        this.data.isSave = true;
        this.close();
      } else {
        this.toast.show({ message: this.localeService.getValue('add_rec_lim'), type: 'fail' });
      }
    });
  }

  //判断是非联盟会员申请还是会员申请
  onAgentApply() {
    if (this.isAgentLogon) return true;
    switch (this.friendPercent) {
      case 0:
      case 0.5:
      case 1:
        return (this.isShowAgentInfo = true);
      case 1.5:
      case 2:
        this.toast.show({ message: this.localeService.getValue('add_rec_r', '0-1'), type: 'fail' });
        return (this.isShowAgentInfo = false);
      default:
        return true;
    }
  }

  /**@canSubmit 是否可以提交 */
  canSubmit(): boolean {
    return !this.isAgentLogon && !this.isShowAgentInfo;
  }

  // 关闭弹窗
  close() {
    this.dialogRef.close();
    this.data.callback(this.data);
  }

  // 进度条百分比点击
  onClickItem(i: number): void {
    this.idx = i;
    this.width = [0, 25, 50, 75, 100][i]; //获取width 宽度
    if (i == 0) {
      this.friendPercent = 0;
      this.myPercent = 2;
      this.percent = true;
      //当下标为0 默认显示第一个
      this.percentList.forEach((list, idx) => {
        if (i == idx) {
          list.active = true;
        } else {
          list.active = false;
        }
        list.completed = false;
      });
    } else {
      this.friendPercent = this.percentList[i]['percent']; //获取好友比例
      this.myPercent = this.percentList[this.percentList.length - 1 - i]['percent']; //获取自己的比例
      this.percent = true; //激活默认推荐
      //激活当前进度条样式
      this.percentList.forEach((list, idx) => {
        if (i > idx) {
          //激活完成样式
          list.completed = true;
        } else {
          list.completed = false;
        }
        if (idx == i) {
          //激活当前样式
          list.active = true;
        } else {
          list.active = false;
        }
      });
    }
    this.onAgentApply();
  }
}
