import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CasinoDealRecord, CasinoDealRecordDetail } from 'src/app/shared/interfaces/gameorder.interface';
import { DealRecordService } from '../deal-record.service';

@Component({
  selector: 'app-deal-casino',
  templateUrl: './deal-casino.component.html',
  styleUrls: ['./deal-casino.component.scss'],
})
export class DealCasinoComponent implements OnInit {
  constructor(public dealRecordService: DealRecordService) {}

  @Input() dealDetailData!: CasinoDealRecordDetail;
  @Input() dataItem!: CasinoDealRecord;
  @Input() isH5!: boolean;
  @Input() show!: 'item' | 'detail';

  @Output() clickItem: EventEmitter<any> = new EventEmitter();

  ngOnInit() {}

  //拼接显示游戏内容 游戏类型 + 牌桌名称（没有则不显示）+ 玩法（没有则不显示）
  // getContentString(item: CasinoDealRecord) {
  //   return (item.gameDetail.gameName || '') +
  //     (item.gameDetail.table ? (' ' + item.gameDetail.table) : '') +
  //     (item.gameDetail.playOption ? (' ' + item.gameDetail.playOption) : '');
  // }
}
