import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgIf } from '@angular/common';
import { SubHeaderDirective } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.directive';

@Component({
  selector: 'nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.scss'],
  standalone: true,
  imports: [SubHeaderDirective, NgIf, LangPipe],
})
export class NavHeaderComponent implements OnInit, OnDestroy {
  constructor(
    private api: AgentApi,
    private subHeader: SubHeaderService,
    public proxyService: ProxyService,
    public router: Router,
    public appService: AppService
  ) {}

  @Input() showRemove = false;

  private _destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.proxyService.value$
      .pipe(
        takeUntil(this._destroyed$) // 当前组件已经被销毁不需要取消订阅
      )
      .subscribe(() => this.loadData());
  }

  loadData() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .dashBoard_head_info({
        team: this.proxyService.curTeamId,
        tenantId: this.subHeader.merchantCurrentId,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.proxyService.navCount = res?.data || {};
      });
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
