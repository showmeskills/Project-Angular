import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { FriendService } from 'src/app/pages/friend/friend.service';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { RecommendOperation } from '../recommend-operation/recommend-operation.component';
import { SharedDialogComponent } from '../shared-dialog/shared-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-theme-component',
  templateUrl: './theme-component.component.html',
  styleUrls: ['./theme-component.component.scss'],
})
export class ThemeComponentComponent implements OnInit {
  constructor(
    public appService: AppService,
    private layout: LayoutService,
    private friendService: FriendService,
    private router: Router,
    private dialog: MatDialog,
    private friendApi: FriendApi,
    private localeService: LocaleService,
    private nativeAppService: NativeAppService
  ) {}

  isH5!: boolean;

  /**@importByComponent 被哪个组件引入 */
  @Input() importByComponent!: string;

  /**@isShowHomePage  显示主页面*/
  isShowHomePage: boolean = true;

  /**@textData 渲染文字信息 */
  @Input() textData!: any;

  /**@topFormTemp 头部表格template */
  @Input() topFormTemp!: TemplateRef<any>;

  /**@mainNavList 主导航 */
  @Input() mainNavList!: any;

  /**@isActiveBtnIdx 当前激活的下标 */
  isActiveBtnIdx: number = 0;

  /**@subThemeTemp 子主题模版 */
  @Input() subThemeTemp!: TemplateRef<any>;

  /**@onSelectedSubTheme 切换子主题函数 */
  @Output() onSelectedSubTheme: EventEmitter<any> = new EventEmitter();

  /**@topOneList top one 数据 */
  topOneList: any = [];

  /**@topOneLoading */
  topOneLoading: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService.isShowNav$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isShowHomePage = e;
      if (!e) {
        this.nativeAppService.setNativeTitle('concept');
      }
    });
    this.getTopOneData();
  }

  /**@getTopOneData  */
  getTopOneData() {
    this.topOneLoading = true;
    this.friendApi.getCommissionTopOne().subscribe(topOne => {
      this.topOneLoading = false;
      this.topOneList = [
        {
          img: 'assets/images/friend/h5-bonus.svg',
          leftTitle: 'y_price',
          reward: topOne.reward,
        },
        {
          img: 'assets/images/friend/h5-rank.svg',
          leftTitle: 'fir',
          reward: topOne.commission,
          uId: topOne.uId,
        },
      ];
    });
  }

  /**@onToRolePage 跳转规则页面*/
  onToRolePage() {
    this.router.navigate([this.appService.languageCode, 'referral', 'role', this.importByComponent]);
  }

  /**@openRecommendDialog 打开 web 推广操作dialog*/
  openRecommendDialog() {
    this.dialog.open(RecommendOperation, {
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });
  }

  /**@openSharedDialog 打开好友分享轮播dialog*/
  openSharedDialog(isShowGigComponent: boolean): void {
    this.dialog.open(SharedDialogComponent, {
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {
        isShowGigComponent,
      },
    });
  }

  /**
   * @param idx
   * @onSwitchSubTheme 切换不同的子主题
   * @idx 下标
   */
  onSwitchSubTheme(idx: number) {
    this.isActiveBtnIdx = idx;
    this.onSelectedSubTheme.emit(idx);
  }

  /**@onOpenH5Ward 切换H5的概述页面*/
  onOpenH5Ward() {
    this.friendService.isShowNav$.next(false);
  }

  /**@onOpenAllRecDialog 所有推荐*/
  onOpenAllRecDialog() {
    this.dialog.open(FriendsListComponent, {
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {
        title: this.localeService.getValue('friends_t'),
      },
    });
  }
}
