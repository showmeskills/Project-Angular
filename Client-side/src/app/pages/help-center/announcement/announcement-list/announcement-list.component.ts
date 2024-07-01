import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { HelpCenterService } from '../../help-center.service';

@UntilDestroy()
@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.scss'],
})
export class AnnouncementListComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helpCenterApi: HelpCenterApis,
    private helpCenterService: HelpCenterService,
    private location: Location,
    private appService: AppService,
    private localeService: LocaleService,
  ) {}
  /**@themeTitle 主题名字*/
  themeTitle: string = this.localeService.getValue('ann_center');

  /**@h5DialogTitle h5 弹窗的title  */
  h5DialogTitle: string = this.localeService.getValue('latest_ann');

  isH5!: boolean;
  menuList: any[] = []; //菜单数组
  isListPage: boolean = true; // 是否显示列表页面
  isActiveIndex!: number; // 进入页面激活的菜单主题
  currentTitle!: string; // 当前进入主题的title
  isLoading!: boolean; // 加载动画
  list: any[] = []; // 2级列表
  // 设备列表分页信息
  paginator: PaginatorState = {
    page: 1,
    pageSize: 15,
    total: 0,
  };
  article: any = {
    //详情页文章数据
    title: '',
    content: '',
    releaseTime: '',
  };
  categoryId!: string;
  isShowH5Paginator: boolean = true;

  /**@rightList 订阅最新的公告*/
  rightList: any[] = [];

  /**@detailLoading 详情页面的loading 状态 */
  detailLoading: boolean = false;

  ngOnInit(): void {
    // 订阅最新公告
    this.helpCenterService.latestAnnouncement$.pipe(untilDestroyed(this)).subscribe(latestAnnouncement => {
      this.rightList = latestAnnouncement;
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // 订阅文章articleCode
    this.activatedRoute.queryParamMap.pipe(untilDestroyed(this)).subscribe(params => {
      const articleCode = params.get('articleCode');
      const categoryId = this.activatedRoute.snapshot.params.id;
      if (articleCode) this.toDetailPage({ categoryId, id: articleCode });
    });
    this.helpCenterService.announcementList$.pipe(untilDestroyed(this)).subscribe(data => {
      this.menuList = data;
      // 订阅路由的类型 id 值变化
      this.activatedRoute.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
        const categoryId = params.get('id');
        if (data.length > 0) {
          data.forEach((list: any, idx: any) => {
            if (categoryId == list.id) {
              this.isActiveIndex = idx;
              this.currentTitle = list.title;
              this.categoryId = list.id;
              if (this.isListPage) this.loadListData();
            }
          });
        }
      });
    });
  }

  //初始化
  loadListData() {
    this.isLoading = true;
    this.helpCenterApi
      .getAnnouncementArticleListById({
        ClientType: 'Web',
        CategoryId: this.categoryId,
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
      })
      .pipe(debounce(() => timer(1000)))
      .subscribe(data => {
        if (this.isH5) {
          data.list.forEach((item: any) => this.list.push(item));
        } else {
          this.list = data.list;
        }
        this.paginator.total = data.total;
        if (this.paginator.page * this.paginator.pageSize >= this.paginator.total) {
          this.isShowH5Paginator = false;
        }
        this.isLoading = false;
      });
  }
  // h5 下一页
  onNextPage() {
    this.paginator.page = this.paginator.page + 1;
    if (this.paginator.page * this.paginator.pageSize >= this.paginator.total) {
      this.isShowH5Paginator = false;
    }
    this.loadListData();
  }
  //切换菜单显示不同的文章
  selectedMenuItem(idx: number, item: any): void {
    this.isListPage = true;
    this.isActiveIndex = idx;
    this.currentTitle = item.title;
    this.categoryId = item.id;
    this.onReset();
    this.router.navigate([this.appService.languageCode, 'help-center', 'announcement', item.id]); //更新路由
  }
  onReset() {
    this.list = []; // 清空数组 防止不断累加
    this.paginator = {
      page: 1,
      pageSize: 15,
      total: 0,
    };
    this.isShowH5Paginator = true;
  }
  //进入详情页面
  toDetailPage(item: any) {
    this.isListPage = false;
    this.detailLoading = true;
    //情况详情组件内容
    this.article = {
      title: '',
      content: '',
      releaseTime: '',
    };
    const params = {
      id: item.id,
    };
    this.helpCenterApi.getAnnouncementArticleDetail(params).subscribe(announcementDetail => {
      this.detailLoading = false;
      this.article.title = announcementDetail.title;
      this.article.content = announcementDetail.content;
      this.article.releaseTime = announcementDetail.releaseTime;
    });
  }
  /**
   * 更新当前路由，更新详情部分的数据
   *
   * @param item 列表属性
   */
  jumpToDetailPage(item: any) {
    this.helpCenterService.jumpToDetailPage(item);
  }

  //返回路由
  debounceBack: boolean = false;
  goBack(): void {
    this.location.back();
    this.debounceBack = true;
    setTimeout(() => {
      if (this.router.url.match('articleCode')) {
        this.isListPage = false;
      } else {
        this.isListPage = true;
        if (this.isListPage) {
          //监听失效 强制更新; e.g:/123456789?articleCod=123456 to /123456789
          this.onReset();
          this.loadListData();
        }
      }
      this.debounceBack = false;
    }, 500);
  }
}
