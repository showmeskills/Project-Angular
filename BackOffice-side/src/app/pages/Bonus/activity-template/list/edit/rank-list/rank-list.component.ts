import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { BonusActivityApi } from 'src/app/shared/api/bonus-activity.api';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconSrcDirective, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-rank-list',
  templateUrl: './rank-list.component.html',
  styleUrls: ['./rank-list.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    IconSrcDirective,
    NgSwitchDefault,
    CurrencyIconDirective,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    AsyncPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class RankListComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: BonusActivityApi,
    private activatedRoute: ActivatedRoute,
    private breadcrumbsService: BreadcrumbsService,
    public router: Router
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  id: any = '';
  list: any[] = [];

  ngOnInit() {
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.id = v?.id;
      if (v?.id) this.loadData(true);
      this.breadcrumbsService.setBefore([
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        {
          name: '活动列表',
          lang: 'breadCrumb.eventsList',
          click: () =>
            this.router.navigate(['/bonus/activity-manage/activity-list'], {
              queryParams: { activityId: 9, tenantId: v?.tenantId },
            }),
        },
        {
          name: '活动交易列表',
          lang: 'breadCrumb.listActiveTrades',
          click: () =>
            this.router.navigate(['/bonus/activity-manage/activity-list/edit'], {
              queryParams: { activityId: 9, tenantId: v?.tenantId, id: v?.editId },
            }),
        },
      ]);
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    const params = {
      id: this.id,
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
    this.loading(true);
    this.api.getCompetitionRankDetail(params).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      } else {
        this.appService.showToastSubject.next({ msg: res?.message });
      }
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
