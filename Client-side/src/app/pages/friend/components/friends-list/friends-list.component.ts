import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { FriendService } from '../../friend.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@UntilDestroy()
@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
})
export class FriendsListComponent implements OnInit {
  isH5!: boolean;

  loading: boolean = false;

  /** 邀请码下的好友列表 */
  friendList: any[] = [];

  // 设备列表分页信息
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  /** 所有推荐列表 */
  /** 所有推荐列表 */
  allList: any = {
    header: [this.localeService.getValue('shared_r'), this.localeService.getValue('friends_fybl')],
    data: [],
  };
  constructor(
    private layout: LayoutService,
    private friendApi: FriendApi,
    private dialogRef: MatDialogRef<FriendsListComponent>,
    private friendService: FriendService,
    private localeService: LocaleService,
    @Inject(MAT_DIALOG_DATA)
    public data: { callback: DialogDataSubmitCallback<any>; title: string; inviteCode: string; id: number }
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    if (this.data.id === 0) {
      this.getRelation();
    } else {
      this.getAllFriendList();
    }
  }

  /** 好友list */
  getRelation() {
    this.loading = true;
    const params = {
      inviteCode: this.data.inviteCode,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.friendApi.getRelation(params).subscribe((data: any) => {
      this.loading = false;
      this.paginator.total = data?.total || 0;
      this.friendList = data?.list || [];
    });
  }

  /** 所有推荐列表 */
  getAllFriendList() {
    this.loading = true;
    this.friendService.getRcommendList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.loading = false;
      this.allList.data = data?.list || [];
    });
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

  /** 添加新比例推荐码 */
  onAddNewInviteCode(): void {
    this.friendService.onAddNewInviteCode();
  }

  /** 关闭 */
  close(): void {
    this.dialogRef.close();
  }
}
