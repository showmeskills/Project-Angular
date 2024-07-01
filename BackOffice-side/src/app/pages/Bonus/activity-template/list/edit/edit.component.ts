import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BonusActivityApi } from 'src/app/shared/api/bonus-activity.api';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CurrencyIconDirective,
    LabelComponent,
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
export class EditComponent implements OnInit {
  constructor(
    public appService: AppService,
    public router: Router,
    private api: BonusActivityApi,
    private activatedRoute: ActivatedRoute,
    private breadcrumbsService: BreadcrumbsService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  id: any = '';
  tenantId: any = '';

  cycleList: any[] = [
    { name: '天', value: 0, lang: 'common.day' },
    { name: '周', value: 1, lang: 'common.week.name' },
    { name: '月', value: 2, lang: 'common.month' },
    { name: '年', value: 3, lang: 'common.year' },
    { name: '单次', value: 4, lang: 'common.once' },
  ];

  rankList: any[] = [];
  list: any[] = [];

  ngOnInit() {
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.id = v?.id;
      this.tenantId = v?.tenantId;
      if (v?.id) this.loadData();

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
      ]);
    });
  }

  loadData() {
    this.api.getCompetitionIssueRank({ id: this.id }).subscribe((res) => {
      if (res?.code === '0000') this.rankList = res?.data.splice(0, 5) || [];
    });
    this.getList(true);
  }

  getList(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    const params = {
      id: this.id,
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
    this.loading(true);
    this.api.getCompetitionIssueList(params).subscribe((res) => {
      this.loading(false);
      if (res?.code === '0000') {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      } else {
        this.appService.showToastSubject.next({ msg: res?.message });
      }
    });
  }

  getIssuePeriod(v: any) {
    if (v || v === 0) {
      return this.cycleList.find((item) => item.value === v)?.lang;
    }
    return '-';
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
