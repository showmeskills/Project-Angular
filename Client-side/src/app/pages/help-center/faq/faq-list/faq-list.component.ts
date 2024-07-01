import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HelpCenterApis } from 'src/app/shared/apis/help-center.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { HelpCenterService } from '../../help-center.service';

@UntilDestroy()
@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.scss'],
})
export class FaqListComponent implements OnInit {
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
  /** h5 弹窗title */
  h5DialogTitle: string = this.localeService.getValue('rel_articles');

  isH5!: boolean;
  menuList: any[] = []; // 一级菜单
  subMenuList: any[] = []; // 二级菜单
  isListPage: boolean = true; // 显示列表页面 或 详情页面
  currentTitle: string | undefined = ''; //设置默认title
  isShowFirstList: boolean = true; // 默认显示第一个列表
  currentSubTitle: string = ''; //2级菜单title
  isActiveIndex: number = -1; // 1级当前未激活下标
  isLoading: boolean = false;
  childrenList: any[] = []; //根据子id返回文章列表
  beforeHalfList: any[] = []; // 获取前一半
  afterHalfList: any[] = []; // 获取后一半
  article: any = {
    //详情页文章数据
    title: '',
    content: '',
    releaseTime: '',
    relationArticleList: [],
  };

  qestionsListBefore: any[] = []; // 热门问题前三个
  qestionsListAfter: any[] = []; // 热门问题后三个
  categoryId!: string;
  h5FaqTitle!: string;

  /** 详情页面加载动画 */
  detailLoading: boolean = false;

  /** 问题列表加动画 */
  quesionListLoading: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    combineLatest([
      this.helpCenterService.faqList$.pipe(filter(x => x.length !== 0)),
      this.activatedRoute.paramMap,
      this.activatedRoute.queryParamMap.pipe(filter(x => x !== null)),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([faqList, paramsId, params]) => {
        this.menuList = faqList;
        const categoryId = paramsId.get('id');
        if (categoryId) {
          this.categoryId = categoryId;
          faqList.map((list: any, idx: number) => {
            //匹配1级列表id
            if (list.id == categoryId) {
              // 打开 1 级列表
              this.selectedMenuItem(idx, list, false);
            } else {
              // 没有就查询子类id
              if (list.children.length) {
                list.children.forEach((child: any, idx: number) => {
                  if (child.id == categoryId) {
                    list.active = true;
                    this.onSelectSubMenu(idx, child, false);
                  }
                });
              }
            }
          });
        }
        const articleCode = params.get('articleCode');
        if (articleCode) {
          this.isListPage = false;
          this.toDetailPage({ id: articleCode, categoryId });
        }
      });
  }

  /**
   * 选择1级菜单
   *
   * @param idx 下标
   * @param item 1级菜单数据
   * @param isClick 判断是否是点击然后刷新路由, 不是点击就是订阅路由id值更新
   */
  selectedMenuItem(idx: number, item: any, isClick: boolean = true): void {
    if (isClick) {
      this.router.navigateByUrl(`/${this.appService.languageCode}/help-center/faq/${item.id}`);
      return;
    }
    this.isListPage = true;
    this.subMenuList = this.menuList[idx].children; //切换显示二级标题
    this.isActiveIndex = idx; // 激活当前1级菜单选项
    //只打开1个级菜单，并且关闭子级激活菜单样式
    this.menuList.forEach((list, i) => {
      if (i !== idx) {
        list.active = false;
      }
      list.children.forEach((child: any) => (child.active = false));
    });
    // 1级目录没有2级目录的时候直接2级列表页面;
    if (!this.subMenuList.length) {
      this.currentSubTitle = item.title; // 设置二级菜单标题
      this.h5FaqTitle = item.title;
      this.isShowFirstList = false; // 关闭1级list
      this.getArticleListById(item);
    } else {
      this.currentTitle = item.title; // 1级的标题
      this.h5FaqTitle = item.title;
      this.isShowFirstList = true; //显示1级内容
      this.menuList[idx].active = true; //打开二级菜单
      this.getQuestionList(item.id);
    }
  }
  // 加载问题列表
  getQuestionList(id: string): void {
    this.quesionListLoading = true;
    this.helpCenterApi.getFaqArticleListById({ ClientType: 'Web', CategoryId: id }).subscribe(qestionsList => {
      this.quesionListLoading = false;
      const len = Math.ceil(qestionsList.length / 2);
      this.qestionsListBefore = qestionsList.slice(0, len);
      this.qestionsListAfter = qestionsList.slice(len, qestionsList.length);
    });
  }

  //选择2级菜单
  /**
   * @param idx
   * @params idx 是二级列表下表
   * @param isClick
   * @param item 2级菜单数据
   * @isClick 判断是否是点击然后刷新路由, 不是点击就是订阅路由id值更新
   */
  onSelectSubMenu(idx: number, item: any, isClick: boolean = true): void {
    if (isClick) {
      this.router.navigateByUrl(`/${this.appService.languageCode}/help-center/faq/${item.id}`);
      return;
    }
    //1级目录带有二级子目录
    this.isListPage = true;
    this.isShowFirstList = false; // 关闭1级list
    this.currentSubTitle = item.title; // 获取二级菜单标题
    this.h5FaqTitle = item.title;
    this.isActiveIndex = -1; // 清除1级
    //激活子级菜单移除其它子级菜单的激活样式
    this.menuList.forEach(list => {
      if (list.id !== item.parentId) {
        list.active = false;
      }
      list.children.forEach((child: any, subIdx: any) => {
        idx == subIdx ? (item.active = true) : (child.active = false);
      });
    });
    this.getArticleListById(item); //切换子级菜单刷新列表页
  }

  //通过id获取文章
  getArticleListById(item: any) {
    this.afterHalfList = [];
    this.beforeHalfList = [];
    this.childrenList = [];
    this.isLoading = true;
    this.helpCenterApi.getFaqArticleListById({ ClientType: 'Web', CategoryId: item.id }).subscribe(data => {
      const len = Math.ceil(data.length / 2);
      this.beforeHalfList = data.slice(0, len);
      this.afterHalfList = data.slice(len, data.length);
      this.childrenList = data;
      this.isLoading = false;
    });
  }
  //显示detail page
  toDetailPage(item: any) {
    this.detailLoading = true;
    //清空详情组件内容
    this.article = {
      title: '',
      content: '',
      releaseTime: '',
      relationArticleList: [],
    };
    this.helpCenterApi.getFaqDetail({ id: item.id }).subscribe(faqDetail => {
      this.detailLoading = false;
      this.article.title = faqDetail.title;
      this.article.content = faqDetail.content;
      this.article.releaseTime = faqDetail.releaseTime;
      this.article.relationArticleList = faqDetail.relationArticleList;
    });
  }
  // h5 go to 2级列表页面
  h5GoToListPage(item: any): void {
    this.router.navigate([this.appService.languageCode, 'help-center', 'faq', item.id]); // 更新当前路由
  }

  //返回上一页
  debounceBack: boolean = false;
  goBack(): void {
    this.location.back();
    this.debounceBack = true;
    setTimeout(() => {
      if (this.router.url.match('articleCode')) {
        this.isListPage = false;
      } else {
        this.isListPage = true;
      }
      this.debounceBack = false;
    }, 500);
  }

  // h5 go to 详情页面
  jumpToDetail(item: any) {
    this.helpCenterService.jumpToDetailPage(item);
  }
}
