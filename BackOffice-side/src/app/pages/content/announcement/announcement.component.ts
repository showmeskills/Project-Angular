import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AppService } from 'src/app/app.service';
import { filter, forkJoin, of, Subject } from 'rxjs';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    AngularSvgIconModule,
    SelectChildrenDirective,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgIf,
    PaginatorComponent,
    LangPipe,
    AsyncPipe,
  ],
})
export class AnnouncementComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  isLoading = false;
  statusList: any[] = [];
  categoryList: Array<{ key: string; value: string }> = [];
  currentCategory = '';
  merchantList: any[] = [];
  currentStatus = '';
  title = '';
  time: Date[] = [];
  msg = '';

  private _destroyed = new Subject<void>();

  constructor(
    public router: Router,
    private api: ArticleApi,
    private selectApi: SelectApi,
    public appService: AppService,
    private modalService: NgbModal,
    private subHeaderService: SubHeaderService,
    public lang: LangService
  ) {}

  async ngOnInit() {
    this.loading(true);
    const al = await this.lang.getOne('common.all');
    forkJoin([this.api.getArticleStatus(), this.api.getCategoryType()])
      .pipe(
        map(([status, category]) => {
          return [
            status,
            category?.map((item) => ({
              ...item,
              value: this.lang.isLocal ? item.value : item.key,
            })) || [],
          ];
        }),
        catchError(() => {
          return of([[], []]);
        })
      )
      .subscribe(([status, category]) => {
        this.statusList = [{ key: '', value: al }, ...(status || [])];
        this.categoryList = [{ key: '', value: al }, ...(category || [])];
        this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
          this.loadData(true);
        });
      });

    /**
     * 页面被释放缓存后，ngOnInit不会被执行
     * 1. 在路由器事件中完成列表数据的更新。
     * 2. 必须是匹配‘编辑’路由返回才进行列表的初始化，避免在未缓存时切换路由造成二次请求。
     */
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this._destroyed)
      )
      .subscribe(() => {
        if (this.router.routeReuseStrategy['curr'] === 'announcement/:id')
          this.subHeaderService.merchantCurrentId && this.loadData();
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onReset(): void {
    this.time = [];
    this.title = '';
    this.currentStatus = '';
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .articleList({
        PageIndex: this.paginator.page,
        PageSize: this.paginator.pageSize,
        TenantId: this.subHeaderService.merchantCurrentId,
        Status: this.currentStatus,
        Title: this.title,
        CategoryCode: this.currentCategory,
        ...(this.time[0] ? { ReleaseTimeStart: toDateStamp(this.time[0]) } : {}),
        ...(this.time[1] ? { ReleaseTimeEnd: toDateStamp(this.time[1], true) } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = this.handle(Array.isArray(res?.list) ? res?.list : []);
        this.paginator.total = res?.total || 0;
      });
  }

  /**
   * 处理数据
   */
  handle(list: any[]) {
    return list.map((e) => ({
      ...e,
      categoryLang: this.lang.isLocal ? this.categoryList.find((j) => j.key === e.categoryName)?.value : e.categoryName,
    }));
  }

  getMerchantData(tenantId: any) {
    return this.subHeaderService.merchantList.find((e) => +e.value === +tenantId) || {};
  }

  formatDate(releaseTime: string): string {
    if (!releaseTime) return '-';
    return moment(releaseTime).format('YYYY-MM-DD HH:mm:ss');
  }

  async onOpera(tpl, id: number, apiKey: string, word: any): Promise<void> {
    this.msg = word;
    const re = await this.lang.getOne(this.msg);
    const suc = await this.lang.getOne('content.suc');
    const fail = await this.lang.getOne('content.fail');

    const ref = this.modalService.open(tpl, { centered: true });
    const res = await ref.result;
    if (!res?.value) return;

    this.loading(true);
    this.api[apiKey](id).subscribe((res) => {
      this.loading(false);

      if (res === true) {
        this.loadData();

        this.appService.showToastSubject.next({
          msg: re + suc,
          successed: true,
        });
      } else {
        this.appService.showToastSubject.next({
          msg: re + fail,
          successed: false,
        });
      }
    });
  }
}
