import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NavigationEnd, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { filter, forkJoin, Subject, takeUntil } from 'rxjs';
import { MessagestationApi } from 'src/app/shared/api/messagestation.api';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messagestation-template',
  templateUrl: './messagestation-template.component.html',
  styleUrls: ['./messagestation-template.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    SelectChildrenDirective,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class MessagestationTemplateComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  userName: any = ''; // 发送人
  time: Date[] = []; // 时间区间

  list: any[] = []; // 表格列表数据
  statusList: any[] = []; // 用户状态下拉列表
  showList = false; // 是否显示列表
  isLoading = false; // 是否处于加载
  searchData: any = {}; // 表单搜索数据
  searchDataEMPT: any = {
    Title: '',
    Status: '',
  };

  private _destroyed = new Subject<void>();

  constructor(
    public router: Router,
    private api: MessagestationApi,
    private ls: LocalStorageService,
    private appService: AppService,
    private lang: LangService
  ) {}

  async ngOnInit() {
    this.searchData = { ...this.searchDataEMPT };
    const al = await this.lang.getOne('common.all');

    forkJoin([this.api.getNoticeTypeList()]).subscribe(([statusList]) => {
      this.statusList = [{ value: '', label: al }, ...statusList];
    });

    this.loadData();

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
        if (this.router.routeReuseStrategy['curr'] === 'messagestation-manage/messagestation-template/:id')
          this.loadData();
      });
  }

  // 获取数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.api
      .getQueryTemplate({
        TenantId: this.ls.userInfo?.tenantId, //商户ID
        ...this.paginator,
        ...(this.searchData.Title ? { Title: this.searchData.Title } : {}),
        ...(this.searchData.Status ? { NoticeType: this.searchData.Status } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.list || [];
        this.paginator.total = res.total;
      });
  }

  // 重置
  onReset(): void {
    this.searchData = { ...this.searchDataEMPT };
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
