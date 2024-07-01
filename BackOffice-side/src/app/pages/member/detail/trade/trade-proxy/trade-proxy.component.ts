import { Component, OnInit } from '@angular/core';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PrepaidComponent } from './prepaid/prepaid.component';
import { TransferComponent } from './transfer/transfer.component';
import { LatestComponent } from './latest/latest.component';
import { CommissionComponent } from './commission/commission.component';
import { OfflineComponent } from './offline/offline.component';
import { UserComponent } from './user/user.component';
import { PlanComponent } from './plan/plan.component';
import { InfoComponent } from './info/info.component';
import { NgIf } from '@angular/common';

@Component({
  templateUrl: './trade-proxy.component.html',
  styleUrls: ['./trade-proxy.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    InfoComponent,
    PlanComponent,
    UserComponent,
    OfflineComponent,
    CommissionComponent,
    LatestComponent,
    TransferComponent,
    PrepaidComponent,
    LangPipe,
  ],
})
export class TradeProxyComponent implements OnInit {
  constructor() {}

  curTab = 0;

  ngOnInit(): void {}

  loadData(): void {}
}
