import { Component, DestroyRef, OnDestroy, OnInit, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, take } from 'rxjs';
import { DailyRacesService } from 'src/app/pages/daily-races/daily-races.service';
import { GameOrderApi } from 'src/app/shared/apis/gameorder.api';
import { LayoutService } from 'src/app/shared/service/layout.service';

@Component({
  selector: 'app-big-winner',
  templateUrl: './big-winner.component.html',
  styleUrls: ['./big-winner.component.scss', '../daily-races.component.scss'],
})
export class BigWinnerComponent implements OnInit, OnDestroy {
  constructor(
    private layoutService: LayoutService,
    public dailyRacesService: DailyRacesService,
    private gameOrderApi: GameOrderApi,
    private destroyRef: DestroyRef
  ) {}

  isH5 = toSignal(this.layoutService.isH5$);

  /** loading 长度 */
  skeletonLength = new Array(3).fill(0);

  /** 渲染大赢家 */
  renderBigWinnerData = computed(() => this.dailyRacesService.bigWinnerData());

  ngOnInit() {
    this.onLoadData();
  }

  ngOnDestroy(): void {
    this.dailyRacesService.bigWinnerData.update(item => ({
      ...item,
      data: [],
    }));
  }

  /** 初始化 数据 */
  onLoadData() {
    this.dailyRacesService.bigWinnerData.update(item => ({
      ...item,
      loading: true,
    }));

    this.dailyRacesService.gameInnerInfo$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        switchMap(params => {
          return this.gameOrderApi.getBigWinner(params!);
        }),
        map(v => {
          return v.map(x => ({
            ...x,
            odds: this.dailyRacesService.onProcessOdd(x.odds as number),
          }));
        })
      )
      .subscribe(data => {
        this.dailyRacesService.bigWinnerData.update(item => ({
          ...item,
          loading: false,
          data: data.slice(0, 3),
        }));
      });
  }
}
