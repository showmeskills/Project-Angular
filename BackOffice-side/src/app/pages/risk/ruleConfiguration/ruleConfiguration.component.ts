import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';
import { filter } from 'rxjs';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ruleConfiguration',
  templateUrl: './ruleConfiguration.component.html',
  styleUrls: ['./ruleConfiguration.component.scss'],
  standalone: true,
  imports: [NgIf, MatTabsModule, NgFor, RouterOutlet, LangPipe],
  providers: [DestroyService],
})
export class RuleConfigurationComponent implements OnInit {
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

  currentTabPath: any = 'configuration'; // 当前选中
  tabs = [
    { name: '风控规则配置', lang: 'risk.config.windControl', path: 'configuration' },
    { name: '信用积分配置', lang: 'risk.config.creditControl', path: 'integral' },
    { name: '信用等级配置', lang: 'risk.config.levelControl', path: 'grade' },
    { name: '风控级别配置', lang: 'risk.config.riskLevelConfiguration', path: 'risk-level' },
  ];

  ngOnInit() {
    const { url } = this.router;
    const initIndex = this.tabs.findIndex((e) => url.includes(e.path));
    this.currentTabPath = this.tabs[initIndex]?.path;
  }

  changeTabIndex(tabPath: any) {
    this.currentTabPath = tabPath;
    const { routeConfig } = this.route.snapshot;
    this.router.navigate([`/risk/${routeConfig?.path || ''}/${tabPath}`]);
  }
}
