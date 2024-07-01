import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  QuizListParams,
  QuizListItem,
  ContestListParams,
  ContestListItem,
} from 'src/app/shared/interfaces/newActivity.interface';
@Injectable({
  providedIn: 'root',
})
export class NewActivityApi extends BaseApi {
  private activity_url = `${environment.apiUrl}/resource/activity`;
  /**
   * 竞赛列表查询
   */
  getCompetitionList(parms: ContestListParams): Observable<ContestListItem> {
    return this.get<any>(`${this.activity_url}/getbackrankpage`, parms);
  }

  /**
   * 竞猜列表查询
   */
  getActivities(parms: QuizListParams): Observable<QuizListItem> {
    return this.get<any>(`${this.activity_url}/getactivities`, parms);
  }
}
