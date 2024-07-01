import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'commission-detail',
  templateUrl: './commission-detail.component.html',
  styleUrls: ['./commission-detail.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    CurrencyIconDirective,
    NgIf,
    NgbTooltip,
    AngularSvgIconModule,
    ProgressComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class CommissionDetailComponent implements OnInit {
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private api: AgentApi,
    private appService: AppService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = +id || 0;
  }

  id: number;
  data: any = {};

  /** getters */
  get list(): any[] {
    return this.data.auditCommissionInfo || [];
  }

  ngOnInit(): void {
    this.getDetail();
  }

  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    this.api.auditcommission_info(this.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.data = res?.data || {};
    });
  }

  onSubmit(): void {
    if (this.data.auditStatus) return this.appService.showToastSubject.next({ msg: '审核状态错误' });

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .auditcommission_audit([
        {
          auditStatus: 1, // 0:未审核 1:渠道经理审核通过 2:总经理审核通过 -1:审核不通过
          monthId: this.id,
        },
      ])
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(res.data === true);
        res.data === true && this.getDetail();
      });
  }

  tipData: any[] = [];

  // 计算百分比
  getPercent(n1: any, n2: any): number {
    return +((n1 / n2) * 100 || 0).toFixed(2);
  }

  onBack() {
    this.router.navigate(['/proxy/commission']);
  }
}
