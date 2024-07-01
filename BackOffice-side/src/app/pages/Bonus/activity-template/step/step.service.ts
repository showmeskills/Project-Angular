import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityStepService {
  constructor() {}

  public backList = new Subject<void>();
  public hasEditFlag = false; // 是否可编辑标志
}
