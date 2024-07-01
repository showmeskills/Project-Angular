import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dataExportRoutesTab } from 'src/app/pages/system/data-export-com/data-export-routing';
import { ActivatedRoute, Route, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { cloneDeep } from 'lodash';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { filter } from 'rxjs';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'data-export-com',
  standalone: true,
  imports: [CommonModule, LangPipe, MatTabsModule, RouterOutlet],
  templateUrl: './data-export-com.component.html',
  styleUrls: ['./data-export-com.component.scss'],
  providers: [DestroyService],
})
export class DataExportComComponent implements OnInit {
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

  tabs = cloneDeep(dataExportRoutesTab);
  curTabPath = this.tabs[0].path;

  ngOnInit(): void {
    const { url } = this.router;
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
    this.router.navigate([`/system/${routeConfig?.path || ''}/${route.path}`]);
  }
}
