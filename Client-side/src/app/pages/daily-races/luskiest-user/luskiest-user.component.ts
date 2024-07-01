import { Component, DestroyRef, OnDestroy, OnInit, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, take } from 'rxjs';
import { GameOrderApi } from 'src/app/shared/apis/gameorder.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { DailyRacesService } from '../daily-races.service';

@Component({
  selector: 'app-luskiest-user',
  templateUrl: './luskiest-user.component.html',
  styleUrls: ['../big-winner/big-winner.component.scss', '../daily-races.component.scss'],
})
export class LuskiestUserComponent implements OnInit, OnDestroy {
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
  renderLuckiesUsertData = computed(() => this.dailyRacesService.luckiestUserData());

  ngOnInit() {
    this.onLoadData();
  }

  ngOnDestroy(): void {
    this.dailyRacesService.luckiestUserData.update(item => ({
      ...item,
      data: [],
    }));
  }

  /** 初始化 数据 */
  onLoadData() {
    this.dailyRacesService.luckiestUserData.update(item => ({
      ...item,
      loading: true,
    }));
    this.dailyRacesService.gameInnerInfo$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        switchMap(params => {
          return this.gameOrderApi.getLuckiestUser(params!);
        }),
        map(v => {
          return v.map(x => ({
            ...x,
            odds: this.dailyRacesService.onProcessOdd(x.odds as number),
          }));
        })
      )
      .subscribe(data => {
        this.dailyRacesService.luckiestUserData.update(item => ({
          ...item,
          loading: false,
          data: data.slice(0, 3),
        }));
        this.dailyRacesService.firstUser = data.slice(0, 1);
      });
  }
}
