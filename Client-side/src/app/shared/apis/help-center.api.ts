import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StatusSelect } from '../interfaces/gameorder.interface';
import {
  AnnouncementArticleDetail,
  AnnouncementArticleListById,
  ArticleByTag,
  CategoryInfo,
  FaqArticleList,
  FaqDetail,
  GetAnnouncementArticleDetail,
  GetAnnouncementArticleListById,
  GetArticleByTag,
  GetCategoryInfoParams,
  GetFaqArticleListById,
  Getfaqdetail,
  GetHomeArticle,
  Gethotfaq,
  Getlatestarticle,
  GetSearchList,
  GetTasSelect,
  HomeArticle,
  HotFaq,
  LatestArticle,
  SearchResult,
  StandardByCode,
} from '../interfaces/helpCenter.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class HelpCenterApis extends BaseApi {
  //查询资讯主题分类(常见问题、公告)
  getCategoryInfo(params: GetCategoryInfoParams): Observable<CategoryInfo[]> {
    const url = `${environment.apiUrl}/v1/article/category/getcategoryinfo`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          return x?.data.map((list: CategoryInfo) => {
            const children =
              list.children.length > 0
                ? list.children.map(child => {
                    return {
                      ...child,
                      description: this.localeService.brandNameReplace(child.description),
                      title: this.localeService.brandNameReplace(child.title),
                    };
                  })
                : [];

            return {
              ...list,
              children,
              title: this.localeService.brandNameReplace(list.title),
              description: this.localeService.brandNameReplace(list.description),
            };
          });
        }
        return [];
      })
    );
  }

  //Announcement 公告中心
  getHomeArticle(params: GetHomeArticle): Observable<HomeArticle[]> {
    const url = `${environment.apiUrl}/v1/article/announcement/gethomearticle`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          return x.data.map((list: HomeArticle) => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
        }
        return [];
      })
    );
  }
  //获取最新文章5条
  getLatestArticle(params: Getlatestarticle): Observable<LatestArticle[]> {
    const url = `${environment.apiUrl}/v1/article/announcement/getlatestarticle`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          return x.data.map((list: LatestArticle) => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
        }
        return [];
      })
    );
  }
  //根据主题分类ID获取公告列表 最多返回15条
  getAnnouncementArticleListById(params: GetAnnouncementArticleListById): Observable<AnnouncementArticleListById> {
    const url = `${environment.apiUrl}/v1/article/announcement/getarticlelist`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data;
          const list = data.list.map((list: any) => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
          return {
            ...data,
            list,
          };
        }
        return { list: [], total: 0 };
      })
    );
  }
  //获取资讯详情
  getAnnouncementArticleDetail(params: GetAnnouncementArticleDetail): Observable<AnnouncementArticleDetail> {
    const url = `${environment.apiUrl}/v1/article/announcement/getarticledetail`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data as AnnouncementArticleDetail;
          return {
            ...data,
            title: this.localeService.brandNameReplace(data.title),
            content: this.localeService.brandNameReplace(data.content),
          };
        }

        return {
          categoryId: 0,
          content: '',
          releaseTime: 0,
          title: '',
        };
      })
    );
  }

  //Faq 常见问题
  //获取热门问题(最多6条)
  getHotFaq(params: Gethotfaq): Observable<HotFaq[]> {
    const url = `${environment.apiUrl}/v1/article/faq/gethotfaq`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          return x.data.map((list: HotFaq) => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
        }
        return [];
      })
    );
  }

  //获取资讯详情及相关文章(最多5条)
  getFaqDetail(params: Getfaqdetail): Observable<FaqDetail> {
    const url = `${environment.apiUrl}/v1/article/faq/getarticledetail`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data as FaqDetail;
          const relationArticleList = data.relationArticleList.map(list => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
          return {
            ...data,
            relationArticleList,
            content: this.localeService.brandNameReplace(data.content),
            title: this.localeService.brandNameReplace(data.title),
          };
        }
        return {
          categoryId: 0,
          content: '',
          relationArticleList: [],
          releaseTime: 0,
          title: '',
        };
      })
    );
  }

  //根据主题分类ID获取文章列表(最多20条)
  getFaqArticleListById(params: GetFaqArticleListById): Observable<FaqArticleList[]> {
    const url = `${environment.apiUrl}/v1/article/faq/getarticlelist`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          return x.data.map((list: FaqArticleList) => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
        }
        return [];
      })
    );
  }

  //Search 搜索
  getSearchList(params: GetSearchList): Observable<SearchResult> {
    const url = `${environment.apiUrl}/v1/article/search/getlist`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x?.data as SearchResult;
          const list = data.list.map(list => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
              content: this.localeService.brandNameReplace(list.content),
            };
          });
          return {
            ...data,
            list,
          };
        }
        return {
          list: [],
          total: 0,
        };
      })
    );
  }

  //以下2个接口用于法币充值/法币提取页面FAQ
  //展示标签下拉列表
  getTagSelect(params: GetTasSelect): Observable<ResponseData<StatusSelect[]>> {
    const url = `${environment.apiUrl}/v1/article/faq/gettagselect`;
    return this.get(url, params);
  }

  //根据标签获取相关资讯(最多5条) 目前参数只用到了 法币充值 法币提取 数字货币充值 数字货币提取
  getArticleByTag(params: GetArticleByTag): Observable<ArticleByTag[]> {
    const url = `${environment.apiUrl}/v1/article/faq/getarticlebytag`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          return x.data.map((list: ArticleByTag) => {
            return {
              ...list,
              title: this.localeService.brandNameReplace(list.title),
            };
          });
        }
        return [];
      })
    );
  }
  /**
   * 竞猜活动 ==》取得竞猜说明（常规文章）
   *
   * @param articleCode 前端标识
   * @returns
   */
  getStandardByCode(articleCode: string): Observable<ResponseData<StandardByCode>> {
    const url = `${environment.apiUrl}/v1/article/support/getstandardbycode`;
    return this.get(url, { articleCode });
  }
}
