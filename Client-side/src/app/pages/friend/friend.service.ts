import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { SetUserApplyBody } from 'src/app/shared/interfaces/friend.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { AddNewRecommendComponent } from './components/add-new-recommend/add-new-recommend.component';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class FriendService {
  /** H5切换页面需要隐藏导航 */
  isShowNav$: BehaviorSubject<any> = new BehaviorSubject(true);

  /** 获取好友游戏类型 */
  gameType$: BehaviorSubject<any> = new BehaviorSubject([]);

  /** 默认比例和邀请码*/
  defaultLinkData$: BehaviorSubject<any> = new BehaviorSubject({});

  /** 代理申请状态 10000 - 可申请, 10002 - 正在申请中 , 10003 - 已成为代理 , 10004 审核被拒绝; */
  agentApplyStatus$: BehaviorSubject<any> = new BehaviorSubject(0);

  /** 获取推荐列表 */
  getRcommendList$: BehaviorSubject<any> = new BehaviorSubject({});

  /** 联盟代理登录缓存订阅 */
  agentLogin$!: Observable<boolean>;

  constructor(
    private friendApi: FriendApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private dialog: MatDialog,
  ) {}

  // 获取代理申请状态
  public async getAgentApplyStatus() {
    const result: any = await this.friendApi.agentApplyStatus();
    if (result?.data) return result.data;
    return 0;
  }

  //确认转入申请
  public async setUserApply(body: SetUserApplyBody) {
    const apply: any = await this.friendApi.setUserApply(body);
    const { success, data } = apply;
    if (success) return data;
  }

  //获取游戏类型 0
  public async getGameType() {
    const gameType = await this.friendApi.getGameType();
    if (gameType?.success) return gameType?.data;
    return null;
  }

  /**
   * 用户是否为代理接口订阅
   *
   * @returns
   */
  public getUserAgentStatus() {
    return (
      this.agentLogin$ ??
      ((this.agentLogin$ = this.friendApi.getIsAgent().pipe(cacheValue(1000 * 60 * 10))), this.agentLogin$)
    );
  }

  /** 获取所有推荐列表 */
  getAllRecomLists() {
    this.friendApi.getList({ page: 1, pageSize: 10 }).subscribe(data => {
      this.getRcommendList$.next(data);
    });
  }

  /** 获取默认推荐 */
  getDefaultLink() {
    this.friendApi.getDefault().subscribe(data => {
      this.defaultLinkData$.next(data);
    });
  }

  /**
   * 设计默认推荐
   *
   * @param inviteCode 推荐码
   */
  setDefaultInviteCode(inviteCode: string) {
    this.dialog.open(StandardPopupComponent, {
      disableClose: false,
      data: {
        type: 'warn',
        description: this.localeService.getValue('rp_set_d', inviteCode),
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('confirm_button'), primary: true },
        ],
        callback: () => {
          this.friendApi
            .setDefault({
              inviteCode,
            })
            .pipe(untilDestroyed(this))
            .subscribe(data => {
              if (data) {
                this.getAllRecomLists();
                this.getDefaultLink();
                this.toast.show({
                  message: this.localeService.getValue('rp_set_s'),
                  type: 'success',
                });
              } else {
                this.toast.show({
                  message: this.localeService.getValue('rp_set_f'),
                  type: 'fail',
                });
              }
            });
        },
      },
    });
  }

  /** 添加新比例推荐码 */
  onAddNewInviteCode() {
    this.dialog.open(AddNewRecommendComponent, {
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {
        callback: (data: any) => {
          if (data.isSave) {
            this.getAllRecomLists();
            this.getDefaultLink();
          }
        },
      },
    });
  }

  commingSoon() {
    // 换成敬请期待
    this.toast.show({
      message: `${this.localeService.getValue('comming')}, ${this.localeService.getValue('waiting')}`,
      title: this.localeService.getValue('hint'),
      type: 'fail',
    });
  }
}
