import { ConnectedPosition } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { NotificationCenterApi } from 'src/app/shared/apis/notification-center.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { NotificationService } from './notification.service';
@UntilDestroy()
@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent implements OnInit {
  isH5!: boolean;
  loading: boolean = false;
  menuList: any[] = []; // 左侧菜单栏
  h5MenuList: any[] = []; //h5 下拉框
  isActiveMenuItem: number = 0; // 当前激活菜单
  messageList: any[] = []; // 信息
  panelStatus: boolean = false; // 是否打开下拉信息
  isCurrentMsg: number = -1;
  data: any = {
    isHiddenReadedMsg: false, //是否隐藏已经短信
  };
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
  noticeType: string = ''; // 站内信类型
  isReaded!: boolean | undefined;
  h5BottomOperateAreaSticky!: boolean; // h5 底部固定按钮
  isShowSingleMsg: boolean = false; // 展示一条通知
  singleMsg: any = {}; // 单条信息详情
  iconLists: any[] = [
    { iconName: 'icon-control', text: 'noti_opt_tip' },
    { iconName: 'icon-toast-success', text: 'all_read' },
    { iconName: 'icon-three-dot', text: 'more_opt' },
  ];
  webToolTipPosition: ConnectedPosition[] = [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -5 },
  ];
  /**是否已经全部删除 */
  isDeleteAll: boolean = false;
  /**是否已经全部已读 */
  isReadedAll: boolean = false;
  isShowBoard: boolean = false;

  /**@isSinglarInform  为singlar通知时候设置一个开关防止 H5会自动累加多条*/
  isSinglarInform: boolean = false;

  /**   立即前往翻译字段 */
  goNow: string = this.localService.getValue('bind_p_g');

  constructor(
    private layout: LayoutService,
    private toast: ToastService,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
    private appService: AppService,
    private notificationService: NotificationService,
    private notificationApi: NotificationCenterApi,
    private localeService: LocaleService,
    private localService: LocaleService,
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.notificationService.isDeleteAll$.pipe(untilDestroyed(this)).subscribe(e => (this.isDeleteAll = e));
    this.notificationService.isReadedAll$.pipe(untilDestroyed(this)).subscribe(e => (this.isReadedAll = e));
    this.appService.noticeCounts$.pipe(untilDestroyed(this)).subscribe(e => {
      this.menuList = [
        { icon: 'icon-all', name: 'all_noti', value: '', messages: `${e?.All}` || 0 },
        { icon: 'icon-activities', name: 'activities_noti', value: 'Activity', messages: `${e?.Activity}` || 0 },
        { icon: 'icon-envolopse', name: 'sys_noti', value: 'System', messages: `${e?.System}` || 0 },
        { icon: 'icon-platform', name: 'news_noti', value: 'Information', messages: `${e?.Information}` || 0 },
        { icon: 'icon-trans', name: 'trade_noti', value: 'Transaction', messages: `${e?.Transaction}` || 0 },
      ];
      this.h5MenuList = [
        { name: `all_noti`, msgNumber: (e?.All > 99 ? '99+' : e?.All) || 0, value: '' },
        { name: `activities_noti`, msgNumber: (e?.Activity > 99 ? '99+' : e?.Activity) || 0, value: 'Activity' },
        { name: `sys_noti`, msgNumber: (e?.System > 99 ? '99+' : e?.System) || 0, value: 'System' },
        { name: `news_noti`, msgNumber: (e?.Information > 99 ? '99+' : e?.Information) || 0, value: 'Information' },
        { name: `trade_noti`, msgNumber: (e?.Transaction > 99 ? '99+' : e?.Transaction) || 0, value: 'Transaction' },
      ];
    });
    // 当top-bar和推送事件发生的时候，重新调用一下数据
    this.notificationService.reLoadData$.pipe(untilDestroyed(this)).subscribe(e => {
      if (e) {
        this.isSinglarInform = true;
        this.loadData();
      }
    });
    this.loadData();
  }

  /**@loadData 初始化数据 为当前页面做分页 */
  loadData() {
    this.loading = true;
    const params = {
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      noticeType: this.noticeType,
      isReaded: this.isReaded,
    };

    this.notificationService.getQueryNotice(params).subscribe(data => {
      this.loading = false;
      if (this.isH5) {
        if (this.isSinglarInform) {
          this.messageList = data.list;
          this.isSinglarInform = false;
        } else {
          this.messageList = [...this.messageList, ...data.list];
          this.isShowBoard = false;
        }
      } else {
        this.messageList = data.list;
      }
      //风控消息加链接
      // this.messageList.map(x => {
      //   if (this.notificationService.ifShowRiskLink(x.businessType)) {
      //     x.content = `${x.content} <span
      //             class="risk-link"> ${this.goNow}>>> <span>`;
      //   }
      // });
      this.paginator.total = data.total;
      if (this.messageList.length === 0) {
        this.notificationService.isDeleteAll$.next(true);
      } else {
        this.notificationService.isDeleteAll$.next(false);
      }
      const isReadedList = this.messageList.filter(msg => msg.isReaded === false);
      if (isReadedList.length === 0) {
        this.notificationService.isReadedAll$.next(true);
      } else {
        this.notificationService.isReadedAll$.next(false);
      }
    });
  }

  //选择菜单
  onSelectMenuItem(i: number, item: any): void {
    this.isActiveMenuItem = i;
    this.onReset();
    this.noticeType = item.value;
    this.loadData();
  }

  /**
   * 消息中链接的点击事件
   *
   * @param event
   * @param type
   */
  // onClickRiskFormLink(event: any, type: string) {
  //   if (event.target.localName == 'span' && event.target.className == 'risk-link') {
  //     this.notificationService.clickRiskLink(type);
  //   }
  // }

  // 防止h5 切换页面数据累加
  onReset() {
    this.messageList = [];
    this.paginator = {
      page: 1,
      pageSize: 10,
      total: 0,
    };
  }

  /**
   * 打开下拉panel
   *
   * @idx 通知下标
   * @item 通知信息
   */
  collectPanelId: number[] = [];
  openPanel(idx: number, item: any): void {
    this.panelStatus = true;
    this.isCurrentMsg = idx;
    this.collectPanelId.push(item.id);
    const len = this.collectPanelId.length;
    // 同一个点击2次关闭
    if (len > 1) {
      if (this.collectPanelId[len - 2] === this.collectPanelId[len - 1]) {
        this.panelStatus = false;
        this.collectPanelId = [];
      }
    }
    if (this.panelStatus) {
      if (item.isReaded === false) {
        this.onReadMsgCall([item.id]);
      }
    }
  }

  //标记已经读取
  onReadMsg() {
    // 通知全部已读后 判断后 不请求
    if (this.isReadedAll) {
      this.toast.show({ message: this.localeService.getValue('noti_allread'), type: 'fail' });
      return;
    }
    this.dialog.open(StandardPopupComponent, {
      data: {
        type: 'warn',
        content: this.localeService.getValue('hint'),
        description: this.localeService.getValue('sure_read_noti00'),
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('sure'), primary: true },
        ],
        callback: () => this.onReadMsgCall([], true),
      },
    });
  }

  /**
   * @param list
   * @param tips
   * @list id 数字数组
   * @tips 单个点击不需要提示
   */
  onReadMsgCall(list: number[], tips: boolean = false) {
    this.loading = true;
    if (tips) {
      const params = {
        noticeType: this.noticeType,
      };
      this.notificationApi
        .onReadAll(params)
        .pipe(
          finalize(() => {
            this.loading = false;
            if (this.isH5) {
              this.onReset();
            }
            this.loadData();
          }),
        )
        .subscribe(data => {
          if (data) {
            this.toast.show({ message: this.localeService.getValue('mess_allread'), type: 'success' });
            this.notificationService.getNoticeCounts();
            if (this.noticeType.length === 0) {
              this.notificationService.isReadedAll$.next(data);
            }
          } else {
            this.toast.show({ message: this.localeService.getValue('mess_read_f'), type: 'fail' });
          }
        });
    } else {
      const params = {
        idList: list,
      };
      this.notificationService
        .readNotice(params)
        .pipe(
          finalize(() => {
            this.loading = false;
            if (this.isH5) {
              this.onReset();
            }
            this.loadData();
          }),
        )
        .subscribe(data => {
          if (data) {
            this.notificationService.getNoticeCounts();
          }
        });
    }
  }
  //隐藏已读信息
  onHiddenReadedMsg(): void {
    if (this.isH5) {
      if (!this.data.isHiddenReadedMsg) {
        this.isReaded = false;
        this.data.isHiddenReadedMsg = true;
      } else {
        this.isReaded = undefined;
        this.data.isHiddenReadedMsg = false;
      }
    } else {
      this.isReaded = this.data.isHiddenReadedMsg ? !this.data.isHiddenReadedMsg : undefined;
    }
    this.onReset();
    this.loadData();
  }
  //删除信息
  onDeleteMsg(): void {
    const isAlReadyDeleteMsgLen = this.messageList.filter(list => list.isReaded === true).length;
    // 通知全部删除后 判断后 不请求
    if (this.isDeleteAll || !isAlReadyDeleteMsgLen) {
      this.toast.show({ message: this.localeService.getValue('noti_all_de'), type: 'fail' });
      this.isShowBoard = false;
      return;
    }
    this.dialog.open(StandardPopupComponent, {
      data: {
        type: 'warn',
        content: this.localeService.getValue('hint'),
        description: this.localeService.getValue('sure_del_noti00'),
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('sure'), primary: true },
        ],
        callback: () => {
          const params = {
            noticeType: this.noticeType,
          };
          this.loading = true;
          this.notificationApi
            .onDeleteAll(params)
            .pipe(
              finalize(() => {
                this.loading = false;
                this.isShowBoard = false;
                if (this.isH5) {
                  this.onReset();
                }
                this.loadData();
              }),
            )
            .subscribe(data => {
              if (data) {
                this.toast.show({ message: this.localeService.getValue('noti_delete'), type: 'success' });
                this.notificationService.isDeleteAll$.next(data);
                this.notificationService.getNoticeCounts();
              } else {
                this.toast.show({ message: this.localeService.getValue('noti_de_f'), type: 'fail' });
              }
            });
        },
      },
    });
  }

  /**@page 页面名字 前往设置页面*/
  jumpToPage(page: string): void {
    this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
  }

  /**@activeToolIdx toolTips 当前激活下标 */
  activeToolIdx: number = -1;
  onShowTool(idx: number) {
    this.activeToolIdx = idx;
  }

  //返回上一页面
  goBack() {
    if (this.isShowSingleMsg) {
      // 单条信息页退出
      this.isShowSingleMsg = !this.isShowSingleMsg;
      this.onReset();
      this.loadData();
    } else {
      this.location.back();
    }
  }

  openSingleMsg(item: any) {
    this.isShowSingleMsg = !this.isShowSingleMsg;
    this.singleMsg = item;
    if (item.isReaded === false) {
      this.onReadMsgCall([item.id]);
    }
  }

  /**
   * 展示删除按钮
   *
   * @param element
   */
  onShowBoard(element: Element) {
    this.isShowBoard = !this.isShowBoard;
    const clickEvent = (event: any) => {
      if (event.target !== element) {
        this.isShowBoard = false;
        window.removeEventListener('click', clickEvent);
      }
    };
    window.addEventListener('click', clickEvent);
  }

  /**
   * 统一前往kyc首页，用户自选
   */
  openKycPage() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
  }
}
