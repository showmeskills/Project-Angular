import { MemberApi } from 'src/app/shared/api/member.api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { CouponDetailComponent } from 'src/app/pages/member/detail/overview/coupon-detail/coupon-detail.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, AngularSvgIconModule, CurrencyIconDirective, CurrencyValuePipe, LangPipe],
})
export class WalletComponent implements OnInit {
  constructor(
    private appService: AppService,
    private memberApi: MemberApi,
    private route: ActivatedRoute,
    private drawer: DrawerService
  ) {}

  uid!: string;
  isLoading = false;
  bonusList: any[] = [];

  typeList = [
    { name: '全部', value: 0, lang: 'common.all' },
    { name: '待领取', value: 1, lang: 'member.detail.discount.await' },
    { name: '已领取', value: 2, lang: 'member.detail.discount.received' },
  ];

  activeType = this.typeList[0].value;

  /** getters */
  get curType() {
    return this.typeList[this.activeType];
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.route.queryParams.pipe().subscribe((v: any) => {
      this.uid = v.uid;
      if (this.uid != undefined) this.loadData();
    });
  }

  loadData() {
    this.loading(true);
    this.memberApi.getBonusBalance({ uid: this.uid, status: this.activeType }).subscribe((data) => {
      this.loading(false);
      this.bonusList = data;
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onType(type: number) {
    this.activeType = type;
    this.loadData();
  }

  openDiscount() {
    this.drawer.open(CouponDetailComponent, { width: '60%', maxWidth: '800px' });
  }
}
