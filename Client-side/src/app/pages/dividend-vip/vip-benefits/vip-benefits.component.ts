import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { VipApi } from 'src/app/shared/apis/vip.api';
import { ImgCarouselOptions } from 'src/app/shared/components/img-carousel/img-carousel-options.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { SwiperComponent } from 'swiper/angular';

@UntilDestroy()
@Component({
  selector: 'app-vip-benefits',
  templateUrl: './vip-benefits.component.html',
  styleUrls: ['./vip-benefits.component.scss'],
})
export class VipBenefitsComponent implements OnInit {
  isH5!: boolean;
  loading: boolean = false;

  /**vip福利介绍 */
  vipList: any = [];

  constructor(
    private layout: LayoutService,
    private router: Router,
    private vipApi: VipApi,
    private appService: AppService,
    private localeService: LocaleService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));

    combineLatest([this.vipApi.getVipDetailList(), this.vipApi.getVipTemplateInfo()]).subscribe(
      ([vipSettingInfo, templateInfo]) => {
        if (vipSettingInfo && templateInfo) {
          this.vipList = vipSettingInfo.slice(1, 10).map(x => {
            return {
              url: `assets/images/vip/v${x.vipLevel}.png`,
              kPoints: x.keepPeriodPoints,
              kPeriod: templateInfo.keepPeriod,
              level: x.vipLevel,
              pPoints: x.upgradePoints,
              pPeriod: templateInfo.upgradePeriod,
              birthdayBenefit: {
                title: this.localeService.getValue('birthday_gif'),
                amount: x.birthdayBonus,
              },
              promotionBenefit: {
                title: this.localeService.getValue('pro_bene'),
                amount: x.upgradeBonus,
              },
              keepBenefit: {
                title: this.localeService.getValue('rege_bene'),
                amount: x.keepBonus,
              },
              loginRedPackage: {
                title: this.localeService.getValue('login_red'),
                amount: x.loginRedPackage,
              },
              dayWithdrawLimitMoney: {
                title: this.localeService.getValue('withdrawal'),
                dayWithdrawLimitMoney: x.dayWithdrawLimitMoney + 'X',
              },
              rescueMoney: {
                title: this.localeService.getValue('rescue_money'),
                titleRatio: this.localeService.getValue('rescue_limit'),
                titleUp: this.localeService.getValue('rescue_cap'),
                amount: x.rescueMoney + '%',
                amountMax: x.rescueMoneyMax,
              },
              depositBenefit: {
                title: this.localeService.getValue('depo_week'),
                titleRatio: this.localeService.getValue('depo_week_t'),
                titleUp: this.localeService.getValue('depo_week_c'),
                bonusMax: x.firstDepositMax,
                bonusRate: x.firstDepositBonus + '%',
              },
              returnBouns: {
                mainTitle: this.localeService.getValue('trade_return'),
                subTitleSport: this.localeService.getValue('s_re'),
                sportRate: x.sportsCashback + '%',
                subTitleRealPeople: this.localeService.getValue('real_re'),
                realPeopleRate: x.liveCashback + '%',
                subTitleEntertain: this.localeService.getValue('ca_re'),
                entertainRate: x.casinoCashback + '%',
                subTitleLottery: this.localeService.getValue('agent_return_lottery'),
                lotteryRate: x.lotteryCashback + '%',
                subTitleChess: this.localeService.getValue('chess_re'),
                chessRate: x.chessCashback + '%',
                singleTile: this.localeService.getValue('daily_return_limit'),
                dailyLimited: x.dayLimit,
                dailyCashbackLimit: x.dailyCashbackLimit || 0,
              },
            };
          });
          this.loading = false;
        }
      },
    );
  }

  /**vip 等级页面 */
  toVipLevel() {
    this.router.navigateByUrl('/' + this.appService.languageCode + '/promotions/vip-level');
  }

  @ViewChild('cardSwiper', { static: true }) cardSwiper!: SwiperComponent;
  cardSwiperOption: ImgCarouselOptions = {
    loop: true,
    slidesPerView: 1,
    allowTouchMove: true,
    spaceBetween: 15,
  };
}
