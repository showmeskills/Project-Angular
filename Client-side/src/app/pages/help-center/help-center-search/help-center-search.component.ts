import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { SearchResult } from 'src/app/shared/interfaces/helpCenter.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { HelpCenterService } from './../help-center.service';

@UntilDestroy()
@Component({
  selector: 'app-help-center-search',
  templateUrl: './help-center-search.component.html',
  styleUrls: ['./help-center-search.component.scss'],
})
export class HelpCenterSearchComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private activatedRoute: ActivatedRoute,
    private helpCenterApi: HelpCenterApis,
    private router: Router,
    private helpCenterService: HelpCenterService,
    private location: Location,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  isH5!: boolean;
  isLoading: boolean = false;
  searchNavBarItem: any[] = [{ name: 'help_c_faq' }, { name: 'announcements' }, { name: 'all' }]; // 搜索结果导航
  isActiveIndex!: number; //当前默认显示导航
  searchKeyWord: string = ''; // search 关键字
  type!: string; // 类型 全部0 常见问题1 公告中心2
  searchType!: number;
  isShowH5Paginator: boolean = true;
  searchTypeWords!: string; // 搜索类型的 FAQ, ALL
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
  isShowFooter: boolean = true;
  /**@searchAResultList 获取搜索结果 */
  searchResultList: any[] = [];
  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    //初始化关键字和显示搜索页面
    this.activatedRoute.queryParamMap.pipe(untilDestroyed(this)).subscribe(queryParams => {
      const searchContent = queryParams.get('searchContent');
      const type = queryParams.get('type') as string;
      this.searchTypeWords = type;
      this.searchKeyWord = searchContent || '';
      this.searchType = this.getType(type);
      this.getSearchList();
      this.isActiveIndex = this.getType(type) == 0 ? 2 : this.getType(type) == 1 ? 0 : 1;
    });
  }

  //获取本页搜索结果
  getSearchList() {
    if (!this.searchKeyWord.trim().length) return;
    this.isLoading = true;
    const params = {
      ClientType: 'Web',
      Type: this.searchType == 0 ? '' : this.searchType,
      Keywords: this.searchKeyWord.trim(),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.helpCenterApi.getSearchList(params).subscribe((searchList: SearchResult) => {
      this.isLoading = false;
      const { list, total } = searchList;
      if (this.isH5) {
        list.map((item: any) => this.searchResultList.push(item));
      } else {
        this.searchResultList = list;
      }
      this.paginator.total = total;
      if (this.paginator.page * this.paginator.pageSize >= this.paginator.total) {
        this.isShowH5Paginator = false;
      }
    });
  }
  onNextPage() {
    this.paginator.page = this.paginator.page + 1;
    if (this.paginator.page * this.paginator.pageSize >= this.paginator.total) {
      this.isShowH5Paginator = false;
    }
    this.getSearchList();
  }
  //返回类型
  getType(type: string): number {
    if (type == 'All') {
      return 0;
    } else if (type == 'FAQ') {
      return 1;
    } else {
      return 2;
    }
  }
  onReset() {
    this.paginator = {
      page: 1,
      pageSize: 10,
      total: 0,
    };
    this.searchResultList = [];
    this.isShowH5Paginator = true;
    this.searchType = this.isActiveIndex == 2 ? 0 : this.isActiveIndex == 0 ? 1 : 2;
    this.searchTypeWords = this.isActiveIndex == 2 ? 'All' : this.isActiveIndex == 0 ? 'FAQ' : 'Announcement';
    this.jumpTopage(`help-center/search?searchContent=${this.searchKeyWord.trim()}&type=${this.searchTypeWords}`);
  }
  //搜索功能
  search() {
    if (!this.searchKeyWord.trim().length) {
      this.helpCenterService.checkSearchContent();
      return;
    }
    this.onReset();
    this.getSearchList();
  }
  //切换导航
  onClickItem(idx: number): void {
    this.isActiveIndex = idx;
    this.onReset();
  }

  //点击搜索文章进入详情页面
  onGoToDetailPage(item: any) {
    const categoryCode: string = item.categoryCode === '公告中心' ? 'announcement' : 'faq';
    item = {
      ...item,
      categoryCode,
    };
    this.helpCenterService.jumpToDetailPage(item);
  }

  // 前往其他页面
  jumpTopage(page: string): void {
    this.router.navigateByUrl(`/${this.appService.languageCode}/${page}`);
  }

  onKeyPressSearch(e: string): void {
    if (e == 'Enter') this.search();
  }

  // 返回上一层页面
  goBack() {
    this.location.back();
  }
}
