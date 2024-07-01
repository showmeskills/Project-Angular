import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import {
  BackwaterDataList,
  BonusDetailList,
  BonusSelect,
  BonusSortParam,
  BonusTypeList,
} from 'src/app/shared/interfaces/bonus.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { CardCenterService } from '../card-center.service';

@Component({
  selector: 'app-coupon-card',
  templateUrl: './coupon-card.component.html',
  styleUrls: ['./coupon-card.component.scss'],
})
export class CouponCardComponent implements OnInit, OnDestroy {
  isH5 = toSignal(this.layout.isH5$);
  renderH5 = computed(() => this.isH5);

  objectKeys = Object.keys;

  isLeftMenuKeepOpen!: boolean;

  constructor(
    private localStorageService: LocalStorageService,
    private layout: LayoutService,
    private popup: PopupService,
    private toast: ToastService,
    private bonusApi: BonusApi,
    private appService: AppService,
    private router: Router,
    private localeService: LocaleService,
    public cardCenterService: CardCenterService,
    private dataCollectionService: DataCollectionService,
    private destroyRef: DestroyRef,
    private currencyValue: CurrencyValuePipe
  ) {}

  // 卡劵类型
  selectedCardType: string = '';

  /** 卡券下拉 */
  cardTypeList: WritableSignal<Array<BonusTypeList>> = signal([]);
  renderCardTypeList = computed(() => {
    if (this.cardTypeList().length > 0) return this.cardTypeList();
    return [];
  });

  // 卡劵状态
  selectedCardStatus: string = 'Unclaimed';

  /** 头部导航下拉状态 */
  cardStatusList: WritableSignal<BonusSelect[]> = signal([]);
  renderCardStatusList = computed(() => {
    if (this.cardStatusList().length > 0) return this.cardStatusList();
    return [];
  });

  // 排序
  selectedCardSort: boolean = true;
  cardSortList = [
    { name: this.localeService.getValue('receive_card_early'), value: true },
    { name: this.localeService.getValue('receive_card_latest'), value: false },
  ];

  // h5筛选弹窗
  @ViewChild('h5Filter') h5FilterRef!: TemplateRef<Element>;
  h5FilterPopup!: MatDialogRef<Element>;

  // page 数据
  listData: WritableSignal<BonusDetailList[]> = signal([]);
  renderListData = computed(() => {
    if (this.listData().length > 0) return this.listData();
    return [];
  });

  // page 分页
  paginator: PaginatorState = { page: 1, pageSize: 6, total: 0 };

  // page 加载状态
  loading: boolean = false;

  // page 选择的数据索引
  selectedIndex?: number;

  // 是否登录状态
  logined = toSignal(this.appService.userInfo$);

  // --------- popup --------

  /** 详情id */
  detailId: number = 0;

  detailList: WritableSignal<BackwaterDataList[]> = signal([]);
  renderDetailList = computed(() => {
    if (this.detailList().length > 0) return this.detailList();
    return [];
  });

  /** 详情loading */
  detailLoading = false;

  /** 详情类型 */
  detailType?: 'water' | 'offset';

  detailWaterTotal: number = 0;

  /** 返水&抵用金详情分页 */
  detailPaginator: PaginatorState = { page: 1, pageSize: 10, total: 0 };

  // web detailWebPopup
  @ViewChild('detailWeb') detailWebPopupRef!: TemplateRef<Element>;
  detailWebPopup!: MatDialogRef<Element>;

  // h5 detailWebPopup
  @ViewChild('detailH5') detailH5PopupRef!: TemplateRef<Element>;
  detailH5Popup!: MatDialogRef<Element>;

  /** 卡券数量 */
  bonusCount = toSignal(this.cardCenterService.bounsCount$);

  /** 抵用金排序弹窗 */
  @ViewChild('creditOrderPopup') creditOrderPopup!: TemplateRef<Element>;
  creditOrderPopupRef!: MatDialogRef<Element>;

  /** 抵用金loading */
  creditOrderLoading: boolean = false;

  /** 使用中的 卡券 */
  creditBets: BonusDetailList[] = [];

  /** 可以提交 顺序选择 */
  disabledOrderSubmit: boolean = true;

  /** 提交 顺序loading */
  orderLoading: boolean = false;

  /** 排序参数 */
  bonusSortParam!: BonusSortParam[];

  /** 用户深copy */
  copyCreditBets: BonusDetailList[] = [];

  /** 点击获取卡券loading */
  clickLoading: boolean = false;

  /** 点击卡券下标准 */
  selectedCardId: number = -1;

  /** 站内信通知后 更新页面 */
  loadData$ = toObservable(this.cardCenterService._loadData).pipe(takeUntilDestroyed(), shareReplay(1));

  ngOnInit() {
    this.dataCollectionService.setEnterTime('coupon');
    this.loadData$.subscribe(() => this.getInitData());
  }

  cardBoxInit(el: HTMLElement) {
    this.layout
      .resizeObservable(el)
      .pipe(
        map(e => e?.contentRect?.width),
        startWith(el.offsetWidth),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(w => {
        this.isLeftMenuKeepOpen = w > 768 && w < 970;
      });
  }

  /** 获取导航数据 */
  getInitData() {
    if (!this.localStorageService.loginToken) return;
    this.loading = true;

    combineLatest([this.bonusApi.getBonusSelect(), this.bonusApi.getBonusTypeList()]).subscribe(
      ([selectRes, TypeListRes]) => {
        this.cardTypeList.set([
          {
            title: this.localeService.getValue('all'),
            newTypeCode: 'All',
            typeCode: null,
            grantType: null,
          },
          ...TypeListRes,
        ]);
        this.cardStatusList.set([
          { code: '', description: this.localeService.getValue('all') },
          ...(selectRes?.data || []),
        ]);
        this.selectedCardSort = false;
        if (this.isH5()) this.listData.set([]);
        this.loadData();
      }
    );
  }

  /** 获取卡券数据 */
  loadData() {
    this.loading = true;
    const cardTypeList = this.renderCardTypeList().filter(
      (list: BonusTypeList) => list?.newTypeCode === this.selectedCardType
    )[0];
    const grantType = cardTypeList?.grantType ?? '';
    const typeCode = cardTypeList?.typeCode ?? '';

    const param = {
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      grantType,
      typeCode,
      status: this.selectedCardStatus,
      ascSort: this.selectedCardSort,
    };
    this.bonusApi
      .getBonusDetail(param)
      .pipe(
        map(v => {
          return {
            total: v?.total || 0,
            list: v?.list?.map(item => {
              return {
                ...item,
                cardStatusDesc: this.renderCardStatusList().find(v => v?.code === item?.cardStatus)?.description || '',
                toParseIntAmount: this.toParseInt(
                  this.currencyValue.transform(
                    item.cardStatus === 'InUse' ? item.balance ?? 0 : item.amount ?? 0,
                    item?.currency || 'USDT'
                  )
                ),
                disbaledBtn: item.cardStatus === 'Rejected' ? false : item.cardStatus !== 'Unclaimed' ? true : false,
              };
            }),
          };
        })
      )
      .subscribe(data => {
        this.paginator.total = data?.total;
        if (this.isH5()) {
          this.listData.set([...this.listData(), ...data.list]);
        } else {
          this.listData.set(data?.list || []);
        }
        this.loading = false;
        //更新卡劵数量
        this.cardCenterService.getBonusCount();
      });
  }

  searchLoadData() {
    this.paginator.page = 1;
    if (this.isH5()) this.listData.set([]);
    this.loadData();
    this.h5FilterPopup?.close();
  }

  reset() {
    this.selectedCardType = '';
    this.selectedCardStatus = 'Unclaimed';
    this.selectedCardSort = false;
    this.selectedCardId = -1;
    if (this.isH5()) this.h5FilterPopup?.close();
    this.searchLoadData();
  }

  // 卡劵按钮点击
  onClickOpenConfirmPopup(status: string, id: number) {
    if (status === 'Unclaimed') {
      this.clickLoading = true;
      this.selectedCardId = id;
      this.bonusApi
        .getReceiveBackwater({ bonusId: id })
        .pipe(map(v => v?.data))
        .subscribe(data => {
          if (data) {
            this.toast.show({ message: this.localeService.getValue('hl_conf_s'), type: 'success' });
            if (this.isH5()) {
              this.listData.set([]);
            }
            this.loadData();
          } else {
            this.toast.show({ message: this.localeService.getValue('hl_conf_f'), type: 'fail' });
          }
          this.clickLoading = false;
          this.selectedCardId = -1;
        });
    } else if (status === 'Rejected') {
      this.popup.open(StandardPopupComponent, {
        data: {
          content: this.localeService.getValue('hint'),
          description: this.localeService.getValue('account_abnormal'),
          type: 'warn',
          buttons: [
            { text: this.localeService.getValue('off_button'), primary: false },
            { text: this.localeService.getValue('con_cus_ser00'), primary: true },
          ],
          callback: () => {
            this.appService.toOnLineService$.next(true);
          },
        },
      });
    }
  }

  // 卡劵 反水详情/抵用金详情 弹窗
  onClickOpenDetailPopup(status: string, id: number, type: string, isAccumulate?: boolean) {
    // (Cash 现金劵 && isAccumulate 卡劵累加 ---> 反水详情) || (Coupon 抵用卷 && InUse 使用中 ---> 抵用卷详情)
    if ((type === 'Cash' && isAccumulate) || (type === 'Coupon' && status === 'InUse')) {
      if (type === 'Cash') {
        this.detailType = 'water';
      } else if (type === 'Coupon') {
        this.detailType = 'offset';
      }

      this.detailId = id;
      this.detailList.set([]);
      this.detailPaginator.page = 1;
      this.detailLoading = false;

      if (!this.isH5()) {
        this.detailWebPopup = this.popup.open(this.detailWebPopupRef, { speed: 'faster' });
      } else {
        this.detailH5Popup = this.popup.open(this.detailH5PopupRef, {
          inAnimation: 'fadeInUp',
          outAnimation: 'fadeOutDown',
          position: { bottom: '0px' },
          speed: 'faster',
          autoFocus: false,
        });
      }

      this.getDetailData();
    }
  }

  // 获取 返水&抵用金 详情数据
  getDetailData() {
    this.detailLoading = true;
    const param = {
      bonusId: this.detailId,
      pageIndex: this.detailPaginator.page,
      pageSize: this.detailPaginator.pageSize,
    };
    //待领取 已失效 显示过期时间 expiredTime
    //使用中 或 已使用 已领取 领取时间 receivedTime
    if (this.detailType === 'water') {
      this.bonusApi
        .getQueryBackwaterList(param)
        .pipe(
          map(v => v?.data || { list: [], total: 0, totalAmount: 0 }),
          map(v => ({
            ...v,
            list: v.list.map(item => ({
              ...item,
              originalCardStatus: item.cardStatus,
              cardStatus: this.renderCardStatusList().find(v => v?.code === item?.cardStatus || '')?.description || '',
            })),
          }))
        )
        .subscribe(data => {
          // 新增判断 返水风控 bug:2021-2221 当有一个状态为Rejected， 之后的所有将待领取的状态改为Rejected 状态 其他不变
          const reject = data?.list?.find(item => item.originalCardStatus === 'Rejected');
          if (reject) {
            this.detailList.set(
              data?.list?.map(item => ({
                ...item,
                originalCardStatus: item.originalCardStatus === 'Unclaimed' ? 'Rejected' : item.originalCardStatus,
                cardStatus:
                  item.originalCardStatus === 'Unclaimed'
                    ? this.renderCardStatusList().find(v => v?.code === 'Rejected')?.description || ''
                    : this.renderCardStatusList().find(v => v?.code === item.originalCardStatus)?.description || '',
              })) || []
            );
          } else {
            this.detailList.set(data?.list || []);
          }
          this.detailPaginator.total = data?.total || 0;
          this.detailWaterTotal = data?.totalAmount || 0;
          this.detailLoading = false;
        });
    } else if (this.detailType === 'offset') {
      this.bonusApi
        .getBonusFlow(param)
        .pipe(
          map(v => v?.data || { list: [], total: 0 }),
          map(v => ({
            ...v,
            list: v.list.map(item => ({
              ...item,
              originalCardStatus: item.cardStatus,
              cardStatus: this.renderCardStatusList().find(v => v?.code === item?.cardStatus || '')?.description || '',
            })),
          }))
        )
        .subscribe(data => {
          this.detailList.set(data?.list || []);
          this.detailPaginator.total = data?.total || 0;
          this.detailLoading = false;
        });
    }
  }

  // 打开h5筛选窗口
  openH5Filter() {
    this.h5FilterPopup = this.popup.open(this.h5FilterRef, {
      inAnimation: 'fadeInRight',
      outAnimation: 'fadeOutRight',
      speed: 'fast',
      autoFocus: false,
      isFull: true,
    });
  }

  jumpToPage() {
    if (this.logined()) {
      this.router.navigateByUrl(
        `/${this.appService.languageCode}/` + `${this.localeService.getValue('card_center_link')}`
      );
    } else {
      this.appService.saveUrl();
      this.router.navigateByUrl(`/${this.appService.languageCode}/` + 'login');
    }
  }

  /**
   * 整数去掉8位小数
   *
   * @param num
   * @returns
   */
  toParseInt(num: string | number): string | number {
    const data = num.toString().replace(',', '');
    if (Number(data) % 1 === 0) {
      return num.toString().split('.')[0];
    } else {
      return num;
    }
  }

  /**
   * 打开 抵用金排序
   */
  openCreditCardPoppup() {
    this.creditOrderLoading = true;
    this.creditBets = [];
    this.disabledOrderSubmit = true;

    const param = {
      status: 'InUse',
      ascSort: false,
      userSort: true,
      isByPage: false,
    };

    this.bonusApi
      .getBonusDetail(param)
      .pipe(
        map(v => {
          return {
            total: v?.total || 0,
            list: v?.list?.map(item => {
              return {
                ...item,
                cardStatusDesc: this.renderCardStatusList().find(v => v?.code === item?.cardStatus)?.description || '',
                toParseIntAmount: this.toParseInt(
                  this.currencyValue.transform(
                    item.cardStatus === 'InUse' ? item.balance ?? 0 : item.amount ?? 0,
                    item?.currency || 'USDT'
                  )
                ),
              };
            }),
          };
        }),
        map(v => {
          return {
            ...v,
            list: v?.list.sort((a, b) => Number(b.sort) - Number(a.sort)),
          };
        })
      )
      .subscribe(data => {
        this.creditBets = data?.list || [];
        this.creditOrderLoading = false;
      });

    if (!this.isH5()) {
      this.creditOrderPopupRef = this.popup.open(this.creditOrderPopup, {
        speed: 'faster',
        autoFocus: false,
        disableClose: true,
      });
    } else {
      this.creditOrderPopupRef = this.popup.open(this.creditOrderPopup, {
        inAnimation: 'fadeInRight',
        outAnimation: 'fadeOutRight',
        speed: 'fast',
        autoFocus: false,
        disableClose: true,
        isFull: true,
      });
    }
  }

  /** 一键领取卡券 */
  onBatchCards() {
    this.loading = true;
    this.bonusApi.onBatchReceiveBonus().subscribe(data => {
      if (data) {
        this.loadData();
        if (this.isH5()) this.listData.set([]);
        this.toast.show({ message: this.localeService.getValue('coupon.get_succes'), type: 'success' });
      } else {
        this.loading = false;
        this.toast.show({ message: this.localeService.getValue('coupon.get_fail'), type: 'success' });
      }
    });
  }

  /**
   * 移动 抵用金
   *
   * @param event
   */
  onDrop(event: CdkDragDrop<BonusDetailList[]>) {
    // 位置挪动处理
    moveItemInArray(this.creditBets, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      // 换了位置
      this.disabledOrderSubmit = false;
      this.copyCreditBets = event.container.data;
    }
  }

  /** 用户提交 抵用金顺序 */
  onSubmitCreditOrder() {
    // 需要深copy一下，UI 有问题
    const data = Array.from(this.copyCreditBets);
    this.bonusSortParam = data
      .reverse()
      ?.map((x, index) => ({
        id: x?.id,
        sort: index + 1,
      }))
      .sort((a, b) => Number(b.sort) - Number(a.sort));
    if (!this.bonusSortParam.length) return;
    this.orderLoading = true;
    this.bonusApi.onOrderCreditBets(this.bonusSortParam).subscribe(data => {
      if (data) {
        this.toast.show({ message: this.localeService.getValue('sequence_order'), type: 'success' });
      } else {
        this.toast.show({ message: this.localeService.getValue('sequence_fail'), type: 'fail' });
      }
      this.creditBets = [];
      this.creditOrderPopupRef.close();
      this.orderLoading = false;
    });
  }

  /** 交换卡券按钮回调函数 */
  onReloadData() {
    this.paginator.page = 1;
    if (this.isH5()) this.listData.set([]);
    this.loadData();
  }

  ngOnDestroy(): void {
    this.dataCollectionService.addPoint({
      eventId: 30019,
      actionValue1: this.dataCollectionService.getTimDiff('coupon'),
    });
  }
}
