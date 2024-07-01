import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { Router } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'commission-monthly-bill',
  templateUrl: './commission-monthly-bill.component.html',
  styleUrls: ['./commission-monthly-bill.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    EmptyComponent,
    CurrencyIconDirective,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    WinDirective,
    WinColorDirective,
    AngularSvgIconModule,
    NgbTooltip,
    ModalFooterComponent,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class CommissionMonthlyBillComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: AgentApi,
    private router: Router
  ) {}

  /** 净利润一览 */
  netProfitList = [
    { name: '平台合计收入', lang: 'marketing.commissionList.bill.totalPlatformIn', field: '' },
    { name: '平台费用', lang: 'marketing.commissionList.bill.platformFee', field: '' },
    { name: '场馆费用', lang: 'marketing.commissionList.bill.venueFee', field: '' },
    { name: '存提款手续费', lang: 'marketing.commissionList.bill.dpAndWdFee', field: '' },
    { name: '红利费用', lang: 'marketing.commissionList.bill.bonusFee', field: '' },
    { name: '调账杂费', lang: 'marketing.commissionList.bill.adjustmentOrOtherFee', field: '' },
    { name: '合计净利润', lang: 'marketing.commissionList.bill.totalNetProfit', field: '' },
  ];

  /** 分红金额 */
  dividend: any[] = [];

  /** 佣金详情表格 */
  commissionList: any[] = [];
  commissionPageSizes: number[] = [8, ...PageSizes]; // 页大小
  commissionPaginator: PaginatorState = new PaginatorState(1, 8); // 分页

  /***********
   * lifeCycle *
   *********/
  ngOnInit(): void {
    this.commissionList = [{}, {}, {}, {}, {}, {}, {}, {}];
    this.commissionPaginator.total = 8;
  }

  /***********
   * methods *
   *********/

  /** 加载佣金详情表格 - 流 */
  loadCommissionTable$(resetPage = false) {
    resetPage && (this.commissionPaginator.page = 1);

    return this.api.get('');
  }

  /** 加载佣金详情表格 */
  loadCommission(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadCommissionTable$(resetPage).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /** 返回 */
  onBack() {
    this.router.navigate(['/proxy/commission']);
  }

  /** 提交 */
  onSubmit() {}
}
