import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root',
})
export class BetService {
  constructor(private appService: AppService) {}

  // 限额列表
  limitList$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  // money: string = '0.00000000';
  money$: BehaviorSubject<string> = new BehaviorSubject<string>('0.00000000');
  // 自动投注 一轮的 总输赢
  winLoseAmount: number = 0;
  // crash 投注状态
  crashBetstate$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  // crash 飞行倍数
  crashCope$: BehaviorSubject<string> = new BehaviorSubject<string>('1.00');
  // crash 投注信息 切换自动与手动时需要清空 mines 也需要监控预选，判断是否能自动投注
  tempBet$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // mines 投注状态
  minesBetstate$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // 手动与自动状态
  atuoActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // mines初始化禁止切换手动与自动
  isChangeActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // hilo 卡片数据
  hiloCardData$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  /**金额输入时，触发*/
  inputMoney$: BehaviorSubject<string> = new BehaviorSubject<string>('0.00000000');

  /**筹码大小选择*/
  chip$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  /** 最大最小1/2 2X 点击后 桌子上筹码计算*/
  changChipType$: Subject<number> = new Subject();
}
