import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { MultiLang, MultiLangParams, MultiLangSubmitParams } from 'src/app/shared/interfaces/article';

@Injectable({
  providedIn: 'root',
})
export class ArticleApi extends BaseApi {
  private _url = `${environment.apiUrl}/article/articlemanage`;

  /**
   * 获取商户分类
   */
  getCategory(tenantId: string): Observable<any> {
    return this.get<any>(`${this._url}/getallcategory`, { tenantId });
  }

  /**
   * 资讯分类增加或修改
   */
  updateCategory(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updateorinsertcategory`, params);
  }

  /**
   * 资讯分类列表
   */
  getCategoryList(tenantId: string): Observable<any> {
    return this.get<any>(`${this._url}/getcategorylist`, { tenantId });
  }

  /**
   * 资讯分类删除
   */
  delCategory(categoryId: number): Observable<any> {
    return this.delete<any>(`${this._url}/deletecategory`, {}, { params: { categoryId } });
  }

  /**
   * 资讯分类详情
   */
  getCategoryDetail(categoryId: number): Observable<any> {
    return this.get<any>(`${this._url}/getcategorybyid`, { categoryId });
  }

  /**
   * 资讯分类详情
   */
  categoryPositionChange(params: any): Observable<any> {
    return this.post<any>(`${this._url}/categorypostionchange`, params);
  }

  /**
   * 资讯分类详情
   */
  articleList(params: {
    CategoryCode: string;
    PageIndex: number;
    PageSize: number;
    TenantId: string;
    Status: string;
    Title: string;
  }): Observable<any> {
    return this.get<any>(`${this._url}/getarticlelist`, params);
  }

  /**
   * 资讯分类详情
   */
  getArticleStatus(): Observable<any> {
    return this.get<any>(`${this._url}/getarticlestatus`);
  }

  /**
   * 资讯分类详情
   */
  getAllCategory(tenantId: number): Observable<any> {
    return this.get<any>(`${this._url}/getallcategory`, { tenantId });
  }

  /**
   * 获取所有分类类型
   */
  getCategoryType(): Observable<Array<{ key: string; value: string }>> {
    return this.get<Array<{ key: string; value: string }>>(`${this._url}/getcategorytype`);
  }

  /**
   * 资讯删除
   */
  deleteArticle(articleId: number): Observable<any> {
    return this.delete<any>(`${this._url}/deletearticle`, {}, { params: { articleId } });
  }

  /**
   * 资讯结束
   */
  endArticle(articleId: number): Observable<any> {
    return this.put<any>(`${this._url}/endarticle`, {}, { params: { articleId } });
  }

  /**
   * 资讯发布
   */
  publishArticle(articleId: number): Observable<any> {
    return this.put<any>(`${this._url}/publisharticle`, {}, { params: { articleId } });
  }

  /**
   * 资讯客户端
   */
  getArticleClient(): Observable<any> {
    return this.get<any>(`${this._url}/getarticleclienttype`);
  }

  /**
   * 资讯详情获取
   */
  getArticleDetail(articleId: number): Observable<any> {
    return this.get<any>(`${this._url}/getarticledetailbyid`, { articleId });
  }

  /**
   * 资讯关联获取
   */
  getArticleRelative(tenantId: number): Observable<any> {
    return this.get<any>(`${this._url}/getallarticleandcategory`, { tenantId });
  }

  /**
   * 资讯标签获取
   */
  getArticleTag(): Observable<any> {
    return this.get<any>(`${this._url}/getarticletags`);
  }

  /**
   * 资讯发布立即
   */
  addPublishArticle(params: any): Observable<any> {
    return this.post<any>(`${this._url}/publishupdatedarticle`, params);
  }

  /**
   * 资讯保存
   */
  addSaveArticle(params: any): Observable<any> {
    return this.post<any>(`${this._url}/addorupdatearticle`, params);
  }

  /**
   * GoGaming - 多语系保存
   */
  addOrUpdateCustom(params: MultiLangSubmitParams): Observable<any> {
    return this.post<any>(`${this._url}/addorupdatecustom`, params);
  }

  /**
   * GoGaming - 多语系获取
   */
  getCustomListByKeys(params: MultiLangParams): Observable<MultiLang[]> {
    return this.post<any>(`${this._url}/getcustomlistbykeys`, params);
  }
}
