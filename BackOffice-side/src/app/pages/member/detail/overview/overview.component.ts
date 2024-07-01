import { Component, OnDestroy, OnInit } from '@angular/core';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MemberService } from '../../member.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ActivatedRoute } from '@angular/router';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { GrowthComponent } from './growth/growth.component';
import { FundingComponent } from './funding/funding.component';
import { WalletComponent } from './wallet/wallet.component';
import { TradeRowComponent } from './trade-row/trade-row.component';
import { UserActivityComponent } from './user-activity/user-activity.component';
import { TradeComponent } from './trade/trade.component';
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  standalone: true,
  imports: [
    TradeComponent,
    UserActivityComponent,
    TradeRowComponent,
    WalletComponent,
    FundingComponent,
    GrowthComponent,
  ],
})
export class OverviewComponent implements OnInit, OnDestroy {
  constructor(
    public memberService: MemberService,
    private modalService: MatModal,
    private appService: AppService,
    private api: MemberApi,
    private selectApi: SelectApi,
    private route: ActivatedRoute,
    public lang: LangService
  ) {}

  isLoading = false;
  providerList: any[] = [];

  ngOnInit(): void {
    this.loading(true);
    zip(this.selectApi.getProviderSelect(this.route.snapshot.queryParams['tenantId'])).subscribe(([provider]) => {
      this.loading(false);
      this.providerList = provider;
    });
  }

  ngOnDestroy(): void {
    this.onReset();
  }

  /** getters */
  get uid(): string {
    return this.route.snapshot.queryParams['uid'] || 0;
  }

  onReset(): void {
    this.isLoading = false;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
