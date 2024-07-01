import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, DestroyRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { NotificationService } from 'src/app/pages/notification-center/notification.service';
import { TopMenu, orderMenu } from 'src/app/pages/user-center/left-menu.config';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { EddPopupService } from 'src/app/shared/components/edd-popup/edd-popup.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { ChatService } from 'src/app/shared/service/chat.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
@UntilDestroy()
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  constructor(
    public appService: AppService,
    private router: Router,
    private kycService: KycService,
    private layout: LayoutService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private cardCenterService: CardCenterService,
    private eddService: EddPopupService,
    private destroyRef: DestroyRef,
    private kycApi: KycApi,
    private localStorageService: LocalStorageService,
    public chatService: ChatService,
  ) {}

  showPop$: Subject<boolean> = new Subject();
  popStatus: { [key: string]: boolean } = {
    user: false,
    wallet: false,
    order: false,
    notification: false,
    download: false,
    imchat: false,
  };

  orderPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetX: 6 },
  ];
  walletPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetX: -8 },
  ];
  containerPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetX: 0 },
  ];
  loading: boolean = false;
  isSimple!: boolean;
  isH5!: boolean;
  userInfo?: AccountInforData;
  logined!: boolean; //是否登陆状态
  kycLevel: number = 0;
  kycStatusName!: string;
  currentVipLevel: number = 0; //当前vip等级
  isSuperVip: boolean = false;
  orderMenuData = orderMenu;

  menuData = TopMenu.flat();

  messageList: any = []; //通知列表
  messagesCount: number = 0; // 当前有多少信息未读
  isShowNoMsg: boolean = true;
  @Input() vipLoading!: boolean;

  /**@bounsCount 卡券数量 */
  bounsCount: number = 0;

  /** kyc status 状态 */
  kycStatus$ = toObservable(this.kycService._kycStatus).pipe(takeUntilDestroyed(this.destroyRef));
  /** kyc状态loading */
  kycStatusLoading: boolean = false;
  /** 是否已经获取到数据 */
  isGetKycData: boolean = false;

  ngOnInit() {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((x: AccountInforData | null) => {
      this.userInfo = x ?? ({} as any);
      this.logined = !!x;
      if (!x?.isSvip) {
        this.currentVipLevel = x?.viPGrade ?? 0;
      }
      this.isSuperVip = x?.isSvip ?? false;

      // 判断国家开启自我约束功能
      this.menuData.forEach(e => {
        if (e.showOnlyCountry && (this.userInfo?.areaCode == '+599' || this.appService.countryCode == 'CW')) {
          e.showOnlyCountry = false;
        }
      });
    });

    this.layout.page$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isSimple = ['register', 'login', 'password'].includes(e);
      this.closePop();
    });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    //只在kyc页面时候出发该订阅 - kycstatus 订阅方式之后还需要再处理
    this.kycStatus$.subscribe(data => {
      if (data) {
        const currentKyc = this.kycService.checkUserKycStatus(data);
        this.kycLevel = currentKyc.level;
        this.kycStatusName = currentKyc.kycStatusName;
      }
    });

    // 在充值或者提款页面 完成 初级kyc 时触发 - kycstatus  订阅方式之后还需要再处理
    this.kycService.refreshKycStatusTopbar$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      if (data) {
        this.onGetKycStatus(false);
      }
      this.kycService._refreshKycStatusTopbar.set(false);
    });

    this.cardCenterService.bounsCount$.pipe(untilDestroyed(this)).subscribe(bounsCount => {
      this.bounsCount = bounsCount || 0;
    });

    this.appService.noticeCounts$.pipe(untilDestroyed(this)).subscribe(e => {
      this.messagesCount = e?.All || 0;

      if (this.logined) {
        this.getQueryNotice();
      }
      if (this.messagesCount === 0) {
        this.notificationService.isReadedAll$.next(true);
      } else {
        this.notificationService.isReadedAll$.next(false);
      }
    });
  }

  handleClick(item: any) {
    if (item.title == 'online_cs') {
      this.appService.toOnLineService$.next(true);
    }
    if (item.icon == 'exit') {
      this.logout();
    }
  }

  //登出
  logout() {
    this.appService.saveUrl();
    this.appService.logoutSubject$.next(true);
  }

  showPop(v: string, skipRepeat: boolean = true) {
    if (skipRepeat && this.popStatus[v]) return;
    this.closePop();
    this.chatService.toggleChat(this.isH5, false);
    this.showPop$.next(true);
    this.popStatus[v] = true;
    if (v === 'user' && skipRepeat) {
      this.onGetKycStatus();
    }
  }

  closePop(time: number = 0) {
    if (time > 0) {
      timer(time)
        .pipe(takeUntil(this.showPop$))
        .subscribe(() => {
          Object.keys(this.popStatus).forEach(x => (this.popStatus[x] = false));
        });
    } else {
      Object.keys(this.popStatus).forEach(x => (this.popStatus[x] = false));
    }
  }

  /**
   * 获取用户当前KYC状态
   *
   * @param hover
   */
  onGetKycStatus(hover: boolean = true) {
    if (this.isGetKycData && hover) return;
    if (this.localStorageService.loginToken) {
      this.kycStatusLoading = true;
      this.isGetKycData = true;
      this.kycApi.getUserKycStatus().subscribe(data => {
        if (data.length > 0) {
          const currentKyc = this.kycService.checkUserKycStatus(data);
          this.kycLevel = currentKyc.level;
          this.kycStatusName = currentKyc.kycStatusName;
        }
        this.kycStatusLoading = false;
      });
    }
  }

  @ViewChild('noticeDialog') noticeDialog!: TemplateRef<any>;
  closeDialog: any;
  isActiveNoticeIdx: number = 0;
  isLoadNotice: boolean = true;
  onOpenNoticeDialog(idx: number, item: any) {
    this.isActiveNoticeIdx = idx;
    this.onReadMsg(item.id);
    const closeDialog = (this.closeDialog = this.dialog.open(this.noticeDialog, {
      panelClass: 'custom-dialog-container',
    }));
    closeDialog.afterClosed().subscribe(() => this.notificationService.getNoticeCounts());
  }
  nextNotice() {
    if (!this.isShowNoMsg) return;
    this.isActiveNoticeIdx = this.isActiveNoticeIdx + 1;
    if (this.isActiveNoticeIdx === this.messageList.length && this.isShowNoMsg) {
      //this.toast.show({ message: this.localeService.getValue('last_em'), type: 'fail' });
      this.isShowNoMsg = false;
    } else {
      this.onReadMsg(this.messageList[this.isActiveNoticeIdx].id);
    }
  }
  // 关闭弹窗
  closeNoticeDialog() {
    this.closeDialog.close();
    this.isShowNoMsg = true;
    this.notificationService.getNoticeCounts();
  }
  // 获取站内信邮件
  getQueryNotice() {
    this.loading = true;
    this.notificationService.getNoticeList().subscribe(data => {
      this.messageList = data;
      this.loading = false;
    });
  }

  //前往通知中心页面
  onGoToNotificationCenter(): void {
    this.router.navigate([`${this.appService.languageCode}`, 'notification-center']);
  }

  /**
   * 统一前往kyc首页，用户自选
   */
  openKycPage() {
    this.closeNoticeDialog();
    this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
  }

  // //删除所有的信息
  // onClearAllMassages() {
  //   this.loading = true;
  //   this.notificationApi.onDeleteAll({ noticeType: '' }).subscribe(data => {
  //     this.loading = false;
  //     if (data) {
  //       this.toast.show({ message: this.localeService.getValue('dele_em_s'), type: 'success' })
  //       this.notificationService.isDeleteAll$.next(data);
  //       this.notificationService.reLoadData$.next(true);
  //     } else {
  //       this.toast.show({ message: this.localeService.getValue('dele_em_f'), type: 'fail' })
  //     }
  //     this.notificationService.getNoticeCounts();
  //   })
  // }

  onReadMsg(id: number) {
    this.loading = true;
    this.notificationService.readNotice({ idList: [id] }).subscribe(_ => {
      this.loading = false;
      this.notificationService.reLoadData$.next(true);
    });
  }
  jumpToLogin() {
    this.appService.jumpToLogin();
  }

  jumpToRegister() {
    this.appService.jumpToRegister();
  }
  //防止重复点击导致弹出框被重复出现
  handleOpen(item: any) {
    item.onClick = true;
    if (item.onClick) {
      setTimeout(() => {
        item.onClick = false;
      }, 100);
    }
  }

  /**
   * Kyc跳转
   */
  jumpToKyc() {
    // if (this.kycLevel > 1) return;
    this.router.navigate([this.appService.languageCode, 'userCenter', 'kyc']);
  }

  /** 直接打开问卷 */
  openEdd() {
    this.eddService.onJourneyStart(true);
    this.closeNoticeDialog();
  }

  /** 高级kyc */
  openAdvanceKyc() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
    this.closeNoticeDialog();
  }
}
