import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Route, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { filter } from 'rxjs';
import { cloneDeep } from 'lodash';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { batchRoutesTab } from 'src/app/pages/risk/batch/batch-routing';

@Component({
  selector: 'batch',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LangPipe, MatTabsModule],
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.scss'],
  providers: [DestroyService],
})
export class BatchComponent implements OnInit {
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

  tabs = cloneDeep(batchRoutesTab);
  curTabPath = this.tabs[0].path;

  ngOnInit(): void {
    const url = this.router.url.split('?')[0];
    const initIndex = this.tabs.findIndex((e) => url.includes(e.path!));
    this.curTabPath = this.tabs[initIndex || 0]?.path;
  }

  /**
   * 切换tab
   * @param route
   */
  changeTab(route: Route) {
    this.curTabPath = route.path;
    const { routeConfig } = this.route.snapshot;
    this.router.navigate([`/risk/${routeConfig?.path || ''}/${route.path}`]);
  }
}
