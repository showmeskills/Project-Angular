import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class MemberService {
  updateMember: Subject<void> = new Subject<any>(); // 更新会员详情和操作记录
  userDetailsInfo: BehaviorSubject<any> = new BehaviorSubject<any>({}); //会员详情
  processKeep: BehaviorSubject<any> = new BehaviorSubject<any>(''); // 会员成长系统 保级进度
}
