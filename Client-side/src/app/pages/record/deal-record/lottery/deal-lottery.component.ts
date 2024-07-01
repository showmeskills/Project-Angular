import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LotteryDealRecord, LotteryDealRecordDetail } from 'src/app/shared/interfaces/gameorder.interface';
import { DealRecordService } from '../deal-record.service';

@Component({
  selector: 'app-deal-lottery',
  templateUrl: './deal-lottery.component.html',
  styleUrls: ['./deal-lottery.component.scss'],
})
export class DealLotteryComponent implements OnInit {
  constructor(public dealRecordService: DealRecordService) {}

  @Input() dealDetailData!: LotteryDealRecordDetail;
  @Input() dataItem!: LotteryDealRecord;
  @Input() isH5!: boolean;
  @Input() show!: 'item' | 'detail';

  @Output() clickItem: EventEmitter<any> = new EventEmitter();

  ngOnInit() {}

  // //拼接显示游戏内容 彩票分类 + 彩票名称 + 期号 + 玩法 + 交易内容
  // getContentString(item: LotteryDealRecord) {
  //   return (item.gameDetail.lotterCategory || '') +
  //     (item.gameDetail.gameName ? (' ' + item.gameDetail.gameName) : '') +
  //     (item.gameDetail.roundNo ? (' ' + item.gameDetail.roundNo) : '') +
  //     (item.gameDetail.playWay ? (' ' + item.gameDetail.playWay) : '') +
  //     (item.gameDetail.betContent ? (' ' + item.gameDetail.betContent) : '');
  // }
}
