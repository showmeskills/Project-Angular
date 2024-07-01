import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportDetailService } from 'src/app/pages/finance/report/report.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FilterHeaderComponent } from './report/filter-header/filter-header.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers: [ReportDetailService],
  standalone: true,
  imports: [NgFor, FilterHeaderComponent, RouterOutlet, LangPipe],
})
export class ReportComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public currencyService: CurrencyService,
    private reportService: ReportDetailService
  ) {}

  activeTabW = 0;
  activeTabLeft = 0;
  activeTabIndex = 0;
  setTabTimer = 0;
  currentTab = new BehaviorSubject<HTMLDivElement | null>(null);
  @ViewChildren('targetTab') nav!: QueryList<ElementRef<HTMLDivElement>>;

  merchantList: any[] = [];

  tabs = [
    { name: '体育', path: 'sport' },
    { name: '游戏城', path: 'casino' },
    { name: '真人娱乐城', path: 'real' },
    { name: '彩票', path: 'lottery' },
    { name: '棋牌', path: 'chess' },
  ];

  _destroy$ = new Subject<void>();

  ngOnInit(): void {
    /** URL 这里会优先执行一次进行初始化 */
    this.route.url.pipe(takeUntil(this._destroy$)).subscribe(() => {
      const index = this.getTabIndex();
      this.activeTabIndex = index;

      clearTimeout(this.setTabTimer);
      this.setTabTimer = window.setTimeout(() => {
        this.setTab(this.nav?.get(index)?.nativeElement!);
      }, 300);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.currentTab.subscribe((res) => res && (this.activeTabLeft = res.offsetLeft + 15));

    const { url } = this.router;

    const initIndex = this.tabs.findIndex((e) => url.includes(e.path));
    const initDom = this.nav.get(initIndex)?.nativeElement;

    if (!initDom) return;
    this.onNav(initDom, initIndex, this.tabs[initIndex]?.path);
  }

  setTab(tabItem: HTMLDivElement): void {
    if (!tabItem) return;

    const first = tabItem.querySelector('a');

    if (first) {
      this.currentTab.next(tabItem);
      this.activeTabW = first.offsetWidth;
    }
  }

  onNav(dom: HTMLDivElement, i: number, path: string): void {
    this.activeTabIndex = i;
    this.setTab(dom);
    this.reportService.resetFilterData(); // 重置筛选数据

    const { queryParams, routeConfig } = this.route.snapshot;
    this.router.navigate([`/finance/${routeConfig?.path || ''}/${path}`], {
      queryParams,
    });
  }

  getTabIndex(path?: string) {
    const { url } = this.router;
    return this.tabs.findIndex((e) => url.includes(path || e.path));
  }
}
