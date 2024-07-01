import { Location } from '@angular/common';
import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { FriendService } from '../../friend.service';
import { FriendsListComponent } from '../friends-list/friends-list.component';
interface ListData {
  header: string[];
  list: Array<any>;
}
@UntilDestroy()
@Component({
  selector: 'app-recommend-operation',
  templateUrl: './recommend-operation.component.html',
  styleUrls: ['./recommend-operation.component.scss'],
})
export class RecommendOperation implements OnInit {
  constructor(
    private layout: LayoutService,
    public location: Location,
    private friendApi: FriendApi,
    @Optional() private dialogRef: MatDialogRef<RecommendOperation>,
    private dialog: MatDialog,
    private toast: ToastService,
    private friendService: FriendService,
    private localeService: LocaleService,
    private dataCollectionService: DataCollectionService,
    private nativeAppService: NativeAppService,
  ) {}

  isH5!: boolean;

  /** 列表数据 */
  listData: ListData = {
    header: [
      'ID',
      this.localeService.getValue('your_rate'),
      this.localeService.getValue('fri_return'),
      this.localeService.getValue('rp_h_nf'),
      this.localeService.getValue('remark'),
      '',
      this.localeService.getValue('action'),
    ],
    list: [],
  };

  /** 推荐list loading */
  recomLoading: boolean = false;

  /** note 弹窗loading */
  noteLoading: boolean = false;

  /** 显示默认 */
  idx: number = -1; // 激活下标

  inviteCodeList: string[] = [];

  remarkList: string[] = [];

  // note 弹窗 属性
  remark: string = '';

  inviteCode: string = '';

  ngOnInit(): void {
    this.nativeAppService.setNativeTitle('rp_h_gl');
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.onH5ReLoad();
    this.getRecomList();
  }

  /** 获取推荐订阅 */
  getRecomList() {
    this.recomLoading = true;
    this.friendService.getRcommendList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.recomLoading = false;
      this.listData.list = data?.list || [];
      this.inviteCodeList = this.listData.list.map((item: any) => item.inviteCode);
      this.remarkList = this.listData.list.map((item: any) => item.remark);
      this.listData.list.forEach((item: any, idx: number) => {
        if (item.isDefault) this.idx = idx;
      });
    });
  }

  /** 防止H5 刷新页面没有订阅 */
  onH5ReLoad() {
    if (this.isH5 && this.listData.list.length === 0) this.friendService.getAllRecomLists();
  }

  // 激活当前状态
  onActiveItem(i: number): void {
    this.idx = i;
  }

  // 关闭弹窗
  close() {
    this.dialogRef.close();
    this.defaultLinkData();
  }

  /**
   * 刷新defult 数据
   */
  defaultLinkData() {
    this.friendApi.getDefault().subscribe(data => {
      this.friendService.defaultLinkData$.next(data);
    });
  }

  // 打开备注弹窗
  @ViewChild('noteDialog') noteDialog!: TemplateRef<any>;
  closeNoteDialog: any;
  openNoteEditPopup(i: number) {
    this.inviteCode = this.inviteCodeList[i];
    this.remark = this.remarkList[i];
    this.closeNoteDialog = this.dialog.open(this.noteDialog, {
      panelClass: 'custom-dialog-container',
      disableClose: true,
    });
  }

  /** 更新推荐备注 */
  changeNote() {
    this.noteLoading = true;
    const params = {
      remark: this.remark,
      inviteCode: this.inviteCode,
    };
    this.friendApi.updateRemark(params).subscribe(data => {
      this.noteLoading = false;
      if (data) {
        this.toast.show({ message: this.localeService.getValue('notes_s'), type: 'success' });
        this.friendService.getAllRecomLists();
      } else {
        this.toast.show({ message: this.localeService.getValue('notes_f'), type: 'fail' });
      }
      this.closeNoteDialog.close();
    });
  }

  /**
   * 打开朋友列表弹窗
   *
   * @param inviteCode 对应inviteCode 邀请码弹窗
   */
  openFriendListPopup(inviteCode: string) {
    this.dialog.open(FriendsListComponent, {
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        id: 0,
        title: this.localeService.getValue('friends_l_t'),
        inviteCode,
      },
    });
  }

  /** 添加新比例推荐码 */
  onAddNewInviteCode(): void {
    this.friendService.onAddNewInviteCode();
  }

  /**
   * 设置默认推荐码
   *
   * @param inviteCode 推荐码
   */
  setDefaultInviteCode(inviteCode: string) {
    if (!inviteCode) return;
    this.friendService.setDefaultInviteCode(inviteCode);
  }

  //清空
  clear(): void {
    this.remark = '';
  }

  afterCopyInviteUrl() {
    this.dataCollectionService.addPoint({ eventId: 30016 });
  }
}
