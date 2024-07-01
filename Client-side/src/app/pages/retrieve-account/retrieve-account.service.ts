import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RetrieveAccountService {
  /**@digitalRecordList$ 订阅数字货币申诉 signalr 是否刷新*/
  digitalRecordList$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**@digitalRecordList$ 订阅法币申诉 signalr 是否刷新*/
  currencyRecordList$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}
}
