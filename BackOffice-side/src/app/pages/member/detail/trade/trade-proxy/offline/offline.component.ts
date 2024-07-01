import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberService } from 'src/app/pages/member/member.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivatedRoute } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'offline',
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class OfflineComponent implements OnInit {
  constructor(
    private appService: AppService,
    private memberService: MemberService,
    private api: AgentApi,
    private route: ActivatedRoute
  ) {}

  uid!: string;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据

  curTab = 3;
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
      queryType: this.curTab,
      size: this.paginator.pageSize,
    };
    this.api.details_member(params).subscribe((res) => {
      this.loading(false);
      if (!res?.data) return;

      this.list = res.data.list;
      this.paginator.total = res.data.total;
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onCurTab(idx: number) {
    this.curTab = idx;
    this.list = [];
    this.loadData(true);
  }
}
