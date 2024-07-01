import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  constructor() {}
  orderStepSubject: BehaviorSubject<number> = new BehaviorSubject(1);
  uniCode: string = ''; //重置密码需要；
}
