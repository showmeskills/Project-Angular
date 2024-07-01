import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-app-download-tips',
  templateUrl: './app-download-tips.component.html',
  styleUrls: ['./app-download-tips.component.scss'],
})
export class AppDownloadTipsComponent implements OnInit {
  isH5!: boolean;

  /**当前时间 */
  now: number = Date.now();

  /**关闭后静默时长 */
  duration: number = 7 * 24 * 60 * 60 * 1000;

  get active(): boolean {
    const local = this.localStorageService.appDownloadTips;
    if (!local || isNaN(Number(local))) return true;
    return this.now - Number(local) >= this.duration;
  }

  get isApp(): boolean {
    return environment.isApp;
  }

  constructor(
    private layout: LayoutService,
    private appService: AppService,
    private localStorageService: LocalStorageService,
    private dataCollectionService: DataCollectionService
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => this.isH5chang(e));
  }

  //目前逻辑：没有点击过关闭，在h5模式就会一直显示；
  //         如果点击过关闭，清空本地存储之前都不会再出现。
  isH5chang(e: boolean) {
    if (this.isApp) return;
    this.isH5 = e;
    if (this.active) this.distributeChange(e);
  }

  //关闭
  closedTips() {
    this.localStorageService.appDownloadTips = Date.now();
    this.distributeChange(false);
  }

  //发送通知全局，顶部需要增加或减去距离。(PS: 52 是tips的高度)
  distributeChange(e: boolean) {
    const o = this.appService.globalSizeChange$.value?.top || 0;
    const top = e ? o + 52 : o - 52;
    this.appService.globalSizeChange$.next({ top: top < 0 ? 0 : top });
  }

  //点击下载
  download() {
    this.dataCollectionService.addPoint({ eventId: 30021 });
    window.open(this.appService.getAppUrl(), 'gogaming-app-download');
  }

  ngOnInit() {}
}
