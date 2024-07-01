import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { CategoryParams, CategoryItem, subjectParams } from 'src/app/shared/interfaces/theme.interface';

@Injectable({
  providedIn: 'root',
})
export class ThemeApi extends BaseApi {
  private _url = `${environment.apiUrl}/im`;

  /**
   *  '类别及主题联动查询', 'POST', '/api/v1/im/catesubj_query'

        '类别新增', 'POST', '/api/v1/im/category_add'

        '类别查询', 'POST', '/api/v1/im/category_query',

        '类别编辑', 'POST', '/api/v1/im/category_update'

        '主题新增', 'POST', '/api/v1/im/subject_add'

        '主题查询', 'POST', '/api/v1/im/subject_query'

        '主题编辑', 'POST', '/api/v1/im/subject_update',

        /api/v1/im/category_del     对应 子服务/im/api/category/del

        /api/v1/im/subject_del   对应子服务 /im/api/subject/del
   */
  postCatesubjQuery(tenantId: string): Observable<any> {
    return this.post<any>(
      `${this._url}/catesubj_query`,
      {},
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  getCategoryQuery(tenantId: string): Observable<any> {
    return this.post<any>(
      `${this._url}/category_query`,
      {},
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  addCategory(tenantId: string, params: CategoryParams): Observable<any> {
    return this.post<any>(`${this._url}/category_add`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  updateCategory(tenantId: string, params: CategoryItem): Observable<any> {
    return this.post<any>(`${this._url}/category_update`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  getSubjectQuery(tenantId: string): Observable<any> {
    return this.post<any>(
      `${this._url}/subject_query`,
      {},
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  addSubjectQuery(tenantId: string, params: subjectParams): Observable<any> {
    return this.post<any>(`${this._url}/subject_add`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  updateSubjectQuery(tenantId: string, params: subjectParams): Observable<any> {
    return this.post<any>(`${this._url}/subject_update`, params, {
      headers: this.getHeaders({ tenantId }),
    });
  }

  delCategory(tenantId: string, id: number): Observable<any> {
    return this.post<any>(
      `${this._url}/category_del`,
      { id },
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }

  delSubjectQuery(tenantId: string, id: number): Observable<any> {
    return this.post<any>(
      `${this._url}/subject_del`,
      { id },
      {
        headers: this.getHeaders({ tenantId }),
      }
    );
  }
}
