import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, Router, ActivatedRoute, RouterEvent, Route } from '@angular/router';
import { cloneDeep } from 'lodash';
import { takeUntil, filter } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { ReportViewerRoutesTab } from 'src/app/pages/system/report-viewer-com/report-viewer.routing';

@Component({
  selector: 'report-viewer-com',
  templateUrl: './report-viewer-com.component.html',
  styleUrls: ['./report-viewer-com.component.scss'],
  standalone: true,
  imports: [CommonModule, LangPipe, MatTabsModule, RouterOutlet],
  providers: [DestroyService],
})
export class ReportViewerComComponent implements OnInit {
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

  tabs = cloneDeep(ReportViewerRoutesTab);
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
