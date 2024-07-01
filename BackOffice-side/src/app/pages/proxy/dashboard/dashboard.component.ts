import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { LatestComponent } from './latest/latest.component';
import { CommissionComponent } from './commission/commission.component';
import { PlanComponent } from './plan/plan.component';
import { AllianceComponent } from './alliance/alliance.component';
import { ManagerRankComponent } from './manager-rank/manager-rank.component';
import { GraphPanelComponent } from './graph-panel/graph-panel.component';
import { InfoComponent } from './info/info.component';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavHeaderComponent } from '../nav-header/nav-header.component';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    NavHeaderComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    InfoComponent,
    GraphPanelComponent,
    ManagerRankComponent,
    AllianceComponent,
    PlanComponent,
    CommissionComponent,
    LatestComponent,
    TransactionHistoryComponent,
    LangPipe,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(public proxyService: ProxyService) {}

  private _destroyed = new Subject<void>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
