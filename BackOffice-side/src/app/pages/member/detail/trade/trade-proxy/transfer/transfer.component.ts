import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberService } from 'src/app/pages/member/member.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivatedRoute } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class TransferComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: AgentApi,
    private memberService: MemberService,
    private route: ActivatedRoute
  ) {}

  uid!: string;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据

  ngOnInit(): void {
    this.uid = this.route.snapshot.queryParams['uid'];
    this.uid && this.loadData();
  }

  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      uid: this.uid,
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
    this.api.details_transfer(params).subscribe((data) => {
      this.loading(false);
      this.list = data?.data?.records || [];
      this.paginator.total = data?.data?.total || 0;
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}