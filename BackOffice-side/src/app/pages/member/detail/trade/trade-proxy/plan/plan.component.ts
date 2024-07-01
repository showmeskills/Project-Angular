import { MemberService } from 'src/app/pages/member/member.service';
import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    NgSwitch,
    NgSwitchCase,
    EmptyComponent,
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
export class PlanComponent implements OnInit {
  constructor(
    public router: Router,
    private appService: AppService,
    private modal: NgbModal,
    private memberService: MemberService,
    private api: AgentApi,
    private route: ActivatedRoute
  ) {}

  uid: string;
  merchantId: string;
  pageSizes: number[] = [10, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(1, 10); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据
  curTab = 1; // 下标索引

  /** lifeCycle */
  ngOnInit(): void {
    const { uid, tenantId } = this.route.snapshot.queryParams;
    this.uid = uid;
    this.merchantId = tenantId;
    this.uid && this.loadData();
  }

  /** methods */
  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);

    this.loading(true);
    if (this.curTab === 1) {
      this.api
        .getFirstDepositOver({
          page: this.paginator.page,
          pageSize: this.paginator.pageSize,
          uid: this.uid,
        })
        .subscribe((res) => {
          this.loading(false);

          this.list = res?.data?.list || [];
          this.paginator.total = res?.data?.total || 0;
        });
    } else {
      this.api
        .details_deposit({
          uid: this.uid,
          queryType: this.curTab,
          current: this.paginator.page,
          size: this.paginator.pageSize,
        })
        .subscribe((data) => {
          this.loading(false);

          this.list = data?.data?.records || [];
          this.paginator.total = data?.data?.total || 0;
        });
    }
  }

  // async openShare(ref: TemplateRef<any>, type: 'friend' | 'plan'): Promise<void> {
  //   this.curShareTab = 0;
  //
  //   const modal = this.modal.open(ref, {
  //     centered: true,
  //     windowClass: 'share-pic-config-modal',
  //   });
  //   const res = await modal.result;
  //
  //   if (!res) return;
  //   // TODO 弹窗没有任何不一样。这两个地方都是打开分享页配置，一个是联盟计划的分享页配置，一个是推荐好友的分享页配置
  // }

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
