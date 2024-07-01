import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from 'src/app/shared/models/tools.model';

@Component({
  selector: 'app-data-statistics',
  templateUrl: './data-statistics.component.html',
  styleUrls: ['./data-statistics.component.scss'],
  standalone: true,
  imports: [NgIf, MatTabsModule, NgFor, RouterOutlet, LangPipe],
  providers: [DestroyService],
})
export class DataStatisticsComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {
    router.events
      .pipe(
        takeUntil(destroy$),
        filter((e: any): e is RouterEvent => e instanceof RouterEvent)
      )
      .subscribe(() => {
        this.ngOnInit();
      });
  }

  currentTabPath: any = 'user-statistics'; // 当前选中
  tabs = [
    { name: '用户统计表', lang: 'system.statistics.userStatistics', path: 'user-statistics' },
    { name: '会员红利表', lang: 'system.statistics.memberBonus', path: 'member-bonus' },
    { name: '游戏注单表', lang: 'system.statistics.gameBet', path: 'game-bet' },
    { name: '用户资金', lang: 'system.statistics.userFunds', path: 'user-funds' },
    { name: '会员首存表', lang: 'system.statistics.memberFirstDeposit', path: 'member-first-deposit' },
    { name: '余额结存', lang: 'system.statistics.userBalance', path: 'user-balance' },
    { name: '待重新统计', lang: 'system.statistics.againStatistics', path: 'again-statistics' },
  ];

  ngOnInit() {
    const { url } = this.router;
    const initIndex = this.tabs.findIndex((e) => url.includes(e.path));
    this.currentTabPath = this.tabs[initIndex]?.path;
  }

  changeTabIndex(tabPath: any) {
    this.currentTabPath = tabPath;
    const { routeConfig } = this.route.snapshot;
    this.router.navigate([`/system/${routeConfig?.path || ''}/${tabPath}`]);
  }
}
