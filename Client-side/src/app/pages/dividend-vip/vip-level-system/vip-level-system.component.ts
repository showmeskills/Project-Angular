import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { UserVipData, VipDetailListData, VipTemplateInfo } from 'src/app/shared/interfaces/vip.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { VipApi } from './../../../shared/apis/vip.api';

@UntilDestroy()
@Component({
  selector: 'app-vip-level-system',
  templateUrl: './vip-level-system.component.html',
  styleUrls: ['./vip-level-system.component.scss'],
})
export class VipLevelSystemComponent implements OnInit, OnDestroy {
  constructor(
    private cdr: ChangeDetectorRef,
    private layout: LayoutService,
    public location: Location,
    private router: Router,
    private appService: AppService,
    private vipApi: VipApi,
    private dataCollectionService: DataCollectionService,
    private localeService: LocaleService
  ) {}

  isH5!: boolean;
  vipDotList: string[] = [];

  /**福利列表 */
  benefitsList: {
    name: string;
    data?: number | string;
    url?: string;
    isPercent?: boolean;
    isMoney?: boolean;
    clickAble?: boolean;
  }[] = [];

  loading: boolean = false;
  /**当前用户vip信息 */
  userVipInfo?: UserVipData;
  /**根据当前vip等级返回的信息 */
  vipSettingInfo: VipDetailListData[] = [];
  /**根据当前vip等级返回的信息 */
  templateInfo?: VipTemplateInfo;
  /**活动列表 */
  activityList: { name: string; icon: string; data: number }[] = [];

  swiperData: { url: string }[] = [];

  logined?: boolean;
  userInfo?: AccountInforData;
  /**vip 从1开始计算 */
  reqVipLevel: number = 1;
  /**登录之后获取用户vip等级 */
  loginedVipLevel: number = 0;

  /**防止页面刷新 下标变成5 */
  isSwitch: boolean = true;
  isSuperVip: boolean = false;

  /**当前颜色主题 */
  theme!: string;

  /**vip 3d siwper */
  @ViewChild('vipSwiperComponent') vipSwiper?: SwiperComponent;
  vipSwiperOption: SwiperOptions = {
    watchSlidesProgress: true,
    loop: true,
    loopedSlides: 3,
    slidesPerView: 'auto',
    allowTouchMove: false,
    breakpoints: {
      767: {
        watchSlidesProgress: true,
        loop: true,
        loopedSlides: 3,
        slidesPerView: 'auto',
        allowTouchMove: true,
      },
      0: {
        watchSlidesProgress: true,
        loop: true,
        loopedSlides: 3,
        slidesPerView: 'auto',
        allowTouchMove: true,
      },
    },
    on: {
      progress(swiper: any) {
        // 处理slids位置
        const len = swiper.slides.length;
        for (let idx = 0; idx < swiper.slides.length; idx++) {
          const slide = swiper.slides[idx];
          const progress = swiper.slides[idx].progress;
          const value = Math.abs(progress);
          let n = 1;
          if (value > 1) {
            n = 0.3 * (value - 1) + 1;
          }
          const els = slide.querySelectorAll('.carousel-slider-animate-opacity');
          const percentX = progress * n * 50 + '%';
          const scale = 1 - 0.2 * value;
          const zIndex = len - Math.abs(Math.round(progress));
          slide.style.transform = `translateX(${percentX}) scale(${scale})`;
          slide.style.zIndex = zIndex;
          els.forEach((e: any) => {
            e.style.opacity = 1 - value / 3;
          });
        }
      },
      setTransition(swiper: any, time: any) {
        // 处理移动间隔
        for (let r = 0; r < swiper.slides.length; r += 1) {
          const slide = swiper.slides[r];
          const els = slide.querySelectorAll('.carousel-slider-animate-opacity');
          slide.style.transitionDuration = `${time}ms`;
          els.forEach((e: any) => {
            e.style.transitionDuration = `${time}ms`;
          });
        }
      },
      slideChange: (swiper: any) => {
        if (this.isSwitch) {
          this.isSwitch = false; // 防止页面刷新 下标会变成5;
          if (!this.logined) {
            this.reqVipLevel = swiper.realIndex + 1;
          }
        } else {
          this.reqVipLevel = swiper.realIndex + 1;
        }
        this.setCurShowData();
      },
      update: () => {
        this.setSwiperDefaultSlide$.next(true);
      },
      afterInit: () => {
        this.setSwiperDefaultSlide$.next(true);
      },
    },
  };

  setSwiperDefaultSlide$: Subject<boolean> = new Subject();

  ngOnInit(): void {
    // 设置初始默认的Slide
    combineLatest([this.setSwiperDefaultSlide$, this.appService.vipUserInfo$])
      .pipe(untilDestroyed(this))
      .subscribe(([e, vipUserInfo]) => {
        if (e && vipUserInfo) {
          if (this.isSuperVip && this.logined) {
            this.vipSwiper?.swiperRef?.slideTo(2, 100, false);
          } else if (this.logined && !this.isSuperVip) {
            this.vipSwiper?.swiperRef?.slideTo((this.loginedVipLevel ? this.loginedVipLevel : 1) + 2, 100, false);
          }
        }
      });

    this.dataCollectionService.setEnterTime('viplevel');
    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.theme = v === 'sun' ? 'light' : 'dark';
      if (this.loginedVipLevel > 4) {
        const len = this.benefitsList.length - 1;
        this.benefitsList.splice(len, 1, {
          name: 'exclusive_cs',
          url: `assets/images/vip/service.${this.theme}.svg`,
          isPercent: false,
        });
      }
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    // 订阅当前登录账号信息，v : AccountInforData 后续需要账号信息可读取
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(v => {
      this.logined = !!v;
      // 需要登录状态改变执行的函数请放在这里
      if (v) {
        this.userInfo = v;
        this.getUserVip();
      }
    });

    // 初始化VIPcard 数据
    this.initSwiperData();
    // 加载vip等级信息
    this.loadData();
  }

  /**加载用户vip信息 */
  getUserVip(): void {
    this.vipApi
      .getUserVip()
      .pipe(untilDestroyed(this))
      .subscribe(vipInfo => {
        if (vipInfo) {
          this.userVipInfo = vipInfo;
          this.loginedVipLevel = vipInfo.currentVipLevel;
          if (this.userVipInfo.isSvip === 0) {
            this.isSuperVip = false;
            this.reqVipLevel = vipInfo?.currentVipLevel - 1 < 0 ? 1 : vipInfo?.currentVipLevel; // vip 请求和页面转动都是重1 开始计算
          } else {
            this.isSuperVip = true;
            this.reqVipLevel = 10;
          }
          this.setCurShowData();
          this.initSwiperData();
          this.appService.vipUserInfo$.next(vipInfo);
        }
      });
  }

  /**初始化VIPcard 数据 */
  initSwiperData() {
    this.vipDotList = [
      'VIP0',
      this.localeService.getValue('customize_vip1'),
      this.localeService.getValue('customize_vip2'),
      this.localeService.getValue('customize_vip3'),
      this.localeService.getValue('customize_vip4'),
      this.localeService.getValue('customize_vip5'),
      this.localeService.getValue('customize_vip6'),
      this.localeService.getValue('customize_vip7'),
      this.localeService.getValue('customize_vip8'),
      this.localeService.getValue('customize_vip9'),
    ];
    this.swiperData = [
      { url: 'assets/images/vip/web-vip-1-bg.png' },
      { url: 'assets/images/vip/web-vip-2-bg.png' },
      { url: 'assets/images/vip/web-vip-3-bg.png' },
      { url: 'assets/images/vip/web-vip-4-bg.png' },
      { url: 'assets/images/vip/web-vip-5-bg.png' },
      { url: 'assets/images/vip/web-vip-6-bg.png' },
      { url: 'assets/images/vip/web-vip-7-bg.png' },
      { url: 'assets/images/vip/web-vip-8-bg.png' },
      { url: 'assets/images/vip/web-vip-9-bg.png' },
    ];
    if (this.isSuperVip) {
      this.vipDotList.push(this.localeService.getValue('customize_vip10'));
      this.swiperData.push({ url: 'assets/images/vip/web-vip-10-bg.png' });
    }
  }

  get curLevelData() {
    return this.vipSettingInfo.find(x => x.vipLevel === this.reqVipLevel);
  }

  setCurShowData() {
    const data: VipDetailListData | null = JSON.parse(JSON.stringify(this.curLevelData || null));
    if (data) {
      this.activityList = [
        { name: 's_re', icon: 'assets/images/vip/w-activity-1.svg', data: data.sportsCashback },
        { name: 'real_re', icon: 'assets/images/vip/w-activity-2.svg', data: data.liveCashback },
        { name: 'ca_re', icon: 'assets/images/vip/w-activity-3.svg', data: data.casinoCashback },
        // 已经和产品沟通;后台没有设置开关，老板没有配置 暂时手动关闭
        // { name: "彩票返还", icon: "assets/images/vip/w-activity-4.svg", data: data.lotteryCashback },
        { name: 'chess_re', icon: 'assets/images/vip/w-activity-5.svg', data: data.chessCashback },
      ];

      this.benefitsList = [
        {
          name: 'birthday_gif',
          data: data.birthdayBonus,
          isPercent: false,
          isMoney: true,
          clickAble: true,
        },
        {
          name: 'pro_bene',
          data: data.upgradeBonus,
          isPercent: false,
          isMoney: true,
          clickAble: true,
        },
        { name: 'rege_bene', data: data.keepBonus, isPercent: false, isMoney: true, clickAble: true },
        {
          name: 'depo_week',
          data: data.firstDepositBonus,
          isPercent: true,
          isMoney: true,
          clickAble: true,
        },
        //商户1救援金隐藏
        // {
        //   name: 'rescue_money',
        //   data: data.rescueMoney,
        //   isPercent: true,
        //   isMoney: true,
        //   clickAble: true,
        // },
        {
          name: 'login_red',
          data: data.loginRedPackage,
          isPercent: false,
          isMoney: true,
          clickAble: true,
        },
        {
          name: 'withdrawal',
          data: `${data.dayWithdrawLimitMoney}X`,
          isPercent: false,
          isMoney: false,
          clickAble: true,
        },
      ];

      if (this.loginedVipLevel > 4) {
        this.benefitsList.push({
          name: 'exclusive_cs',
          url: `assets/images/vip/service.${this.theme}.svg`,
          isPercent: false,
          isMoney: true,
          clickAble: false,
        });
      }
      this.cdr?.detectChanges();
    }
  }

  loadData() {
    this.loading = true;
    combineLatest([this.vipApi.getVipDetailList(), this.vipApi.getVipTemplateInfo()]).subscribe(
      ([vipSettingInfo, templateInfo]) => {
        if (vipSettingInfo && templateInfo) {
          this.loading = false;
          this.vipSettingInfo = vipSettingInfo;
          this.templateInfo = templateInfo;
          this.setCurShowData();
        }
      }
    );
  }

  jumpToPage(page: string) {
    this.appService.saveUrl();
    this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
  }

  ngOnDestroy(): void {
    this.dataCollectionService.addPoint({
      eventId: 30013,
      actionValue1: this.dataCollectionService.getTimDiff('viplevel'),
    });
  }
}
