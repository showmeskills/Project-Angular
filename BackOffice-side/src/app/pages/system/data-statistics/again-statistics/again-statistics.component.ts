import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { StatApi } from 'src/app/shared/api/stat.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { cloneDeep } from 'lodash';
import { finalize, lastValueFrom } from 'rxjs';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-again-statistics',
  templateUrl: './again-statistics.component.html',
  styleUrls: ['./again-statistics.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, AngularSvgIconModule, LangPipe],
})
export class StatisticsAgainStatisticsComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: StatApi,
    public lang: LangService
  ) {}

  isLoading = false;

  list: Array<any> = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading(true);
    this.loadData$()
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res) ? res : [];
      });
  }

  loadData$() {
    return this.api.getReStats();
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 导出
   */
  async onExport() {
    let list: any[] = [];

    try {
      this.loading(true);
      const res = await lastValueFrom(this.loadData$());
      this.loading(false);
      list = Array.isArray(res) ? res : []; // success === false会自动抛出
    } finally {
      this.loading(false);
    }

    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list: any[]) {
    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const th_1 = await this.lang.getOne('system.memberBonus.th_16'); // 统计时间
    const th_2 = await this.lang.getOne('system.againStatistics.th_1'); // 统计类别
    const th_3 = await this.lang.getOne('system.againStatistics.th_2'); // 状态

    JSONToExcelDownload(
      list.map((e) => ({
        [th_1]: e.statDate || '-',
        [th_2]: e.category || '-',
        [th_3]: e.status || '-',
      })),

      'again-statistics-list ' + Date.now()
    );
  }
}
