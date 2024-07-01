import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChessDealRecord, ChessDealRecordDetail } from 'src/app/shared/interfaces/gameorder.interface';
import { DealRecordService } from '../deal-record.service';

@Component({
  selector: 'app-deal-poker',
  templateUrl: './deal-poker.component.html',
  styleUrls: ['./deal-poker.component.scss'],
})
export class DealPokerComponent implements OnInit {
  constructor(public dealRecordService: DealRecordService) {}

  @Input() dealDetailData!: ChessDealRecordDetail;
  @Input() dataItem!: ChessDealRecord;
  @Input() isH5!: boolean;
  @Input() show!: 'item' | 'detail';

  @Output() clickItem: EventEmitter<any> = new EventEmitter();

  ngOnInit() {}

  // //拼接显示游戏内容 游戏名称 目前 gameDetail 就是游戏名称，后端说的
  // getContentString(item: ChessDealRecord) {
  //   return item.gameDetail || '';
  // }
}
