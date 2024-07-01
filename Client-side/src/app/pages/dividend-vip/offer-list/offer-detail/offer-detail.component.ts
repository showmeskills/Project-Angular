import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { DailyRacesService } from 'src/app/pages/daily-races/daily-races.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { UserVipData } from 'src/app/shared/interfaces/vip.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DividendVipService } from '../../dividend-vip.service';
@UntilDestroy()
@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss'],
})
export class OfferDetailComponent implements OnInit {
  constructor(
    private bounsApi: BonusApi,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private toast: ToastService,
    private localeSerive: LocaleService,
    private layout: LayoutService,
    private router: Router,
    private dividendVipService: DividendVipService,
    public dailyRacesService: DailyRacesService,
  ) {}

  isH5!: boolean;

  loading: boolean = false;

  detailData: any = {};

  theme!: string;

  logined!: boolean;

  vipUserInfo?: UserVipData;

  bonusActivitiesNo: string = '';

  applyLoading: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.appService.vipUserInfo$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) this.vipUserInfo = v;
    });

    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(v => {
      this.logined = !!v;
    });

    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.theme = v === 'sun' ? 'light' : 'dark';
    });

    this.activatedRoute.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
      const bonusActivitiesNo = params.get('activitiesNo') as string;
      this.bonusActivitiesNo = bonusActivitiesNo;
      this.getActivitiesList();
    });
  }

  /** 获取活动列表 */
  getActivitiesList() {
    this.loading = true;
    this.dividendVipService.getActivitiesList({ equipment: 'Web' }).subscribe((data: any) => {
      const list = data.list[0]?.list || [];
      if (this.bonusActivitiesNo.length > 0) {
        if (list.find((x: any) => x.activitiesNo === this.bonusActivitiesNo)) {
          this.getAcitvityDetail(this.bonusActivitiesNo);
        } else {
          this.jump404();
        }
      }
    });
  }

  /**
   * 活动code
   *
   * @param bonusActivitiesNo 活动编号
   * @returns
   */
  getAcitvityDetail(bonusActivitiesNo: string) {
    this.bounsApi.getActivityDetail({ bonusActivitiesNo, equipment: 'Web' }).subscribe((data: any) => {
      this.loading = false;
      this.detailData = data;
    });
  }

  /** 跳转到404 */
  jump404() {
    this.loading = false;
    this.router.navigateByUrl(`/${this.appService.languageCode}/404`, { replaceUrl: true });
  }

  /** 用户提交报名 */
  submitApply() {
    if (this.detailData.isEnroll) return;
    this.applyLoading = true;
    const params = {
      vipLevel: this.vipUserInfo?.currentVipLevel || 0,
      bonusActivitiesNo: this.bonusActivitiesNo,
    };
    this.bounsApi.bonusCustomerApply(params).subscribe(data => {
      this.applyLoading = false;
      if (data) {
        this.toast.show({ message: this.localeSerive.getValue('resp'), type: 'success' });
        this.detailData.isEnroll = !this.detailData.isEnroll;
      } else {
        this.toast.show({ message: this.localeSerive.getValue('resp_f'), type: 'fail' });
      }
    });
  }
}
