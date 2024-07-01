import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { GameCategory } from 'src/app/shared/interfaces/game';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { ReportDetailService } from 'src/app/pages/finance/report/report.service';
import { ReportAmountComponent } from 'src/app/pages/finance/report/report/report-amount/report-amount.component';
import { ReportGraphComponent } from 'src/app/pages/finance/report/report/report-graph/report-graph.component';
import { StatDataItemComponent } from 'src/app/pages/finance/report/report/stat-data-item/stat-data-item.component';
import { StatProviderItemComponent } from 'src/app/pages/finance/report/report/stat-provider-item/stat-provider-item.component';

@Component({
  selector: 'report-casino-list-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['../../report.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    LangPipe,
    EmptyComponent,
    AngularSvgIconModule,
    FormatMoneyPipe,
    CurrencyValuePipe,
    ReportAmountComponent,
    ReportGraphComponent,
    StatDataItemComponent,
    StatProviderItemComponent,
  ],
})
export class ReportCasinoChartComponent implements OnInit {
  constructor(
    public router: Router,
    public appService: AppService,
    private lang: LangService,
    public reportDetail: ReportDetailService,
    private destroy$: DestroyService
  ) {}

  category: GameCategory = 'SlotGame'; // 类型

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    this.reportDetail
      .loadData$(this.category)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.appService.isContentLoadingSubject.next(false);
        this.loadData();
      });
  }

  loadData() {
    this.appService.isContentLoadingSubject.next(true);
    this.reportDetail.getGraphData$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }
}
