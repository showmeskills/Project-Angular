import { Component, Input, OnInit } from '@angular/core';
import { SupplierReportGameModule } from 'src/app/shared/interfaces/supplier';
import { GameCategory, GameCategoryEnum } from 'src/app/shared/interfaces/game';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'stat-provider-item',
  templateUrl: './stat-provider-item.component.html',
  styleUrls: ['./stat-provider-item.component.scss'],
  standalone: true,
  imports: [CurrencyValuePipe, LangPipe],
})
export class StatProviderItemComponent implements OnInit {
  constructor() {}

  @Input() item: SupplierReportGameModule = {
    gameCategory: GameCategoryEnum[GameCategoryEnum.SportsBook] as GameCategory, // 游戏类型
    gameProvider: '', // 游戏厂商
    gameProviderName: '', // 游戏厂商名称
    todayTransactionAmount: 0, // 今日交易本金 USDT
    todayPayoutAmount: 0, // 今日输赢 USDT
    todayActiveCount: 0, // 活跃用户数
  };

  ngOnInit(): void {}
}
