import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { QuizActivityApi } from 'src/app/shared/api/quiz-activity.api';
import { zip } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CurrencyIconDirective,
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
export class DetailsComponent implements OnInit {
  constructor(
    public appService: AppService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbsService: BreadcrumbsService,
    private api: QuizActivityApi,
    public subHeaderService: SubHeaderService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  rankList: any[] = [];
  list: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.getList(true);
  }

  getList(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    const params = {
      tenantId: this.subHeaderService.merchantCurrentId,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.loading(true);
    zip(this.api.getPredictionMaster(params), this.api.getPredictionRankInfo()).subscribe(([res, ranklist]) => {
      this.loading(false);
      console.log(ranklist.data);

      this.list = res?.data?.master || [];
      this.paginator.total = res?.data?.totalCount || 0;
      this.rankList = ranklist.data;
    });
    // this.api.getPredictionRankInfo().subscribe((res) => {
    //   this.rankList = res.data.data;
    // });
    // this.api.getPredictionMaster(params).subscribe((res) => {
    //   this.loading(false);
    //   if (res?.success) {
    //     this.list = res?.data?.master || [];
    //     this.paginator.total = res?.data?.totalCount || 0;
    //   } else {
    //     this.appService.showToastSubject.next({ msg: res?.message });
    //   }
    // });
  }

  /**跳转到单个活动具体排名 */
  goRankList(id) {
    this.router.navigate(['/bonus/activity-manage/activity-list/Details/rank-list/' + id]);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
