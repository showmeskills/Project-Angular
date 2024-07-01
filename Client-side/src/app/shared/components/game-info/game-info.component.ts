import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { DailyRacesService } from 'src/app/pages/daily-races/daily-races.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { GameListItem, NewGameList } from 'src/app/shared/interfaces/game.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
@UntilDestroy()
@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnInit, OnChanges {
  constructor(
    public layout: LayoutService,
    public appService: AppService,
    private router: Router,
    private miniGameService: MiniGameService,
    public dailyRacesService: DailyRacesService
  ) {}
  @Input() gameInfo?: GameListItem;

  showTab: boolean = false;

  isH5!: boolean;

  logined!: boolean;

  loadingGameList: boolean = true;

  gameList?: NewGameList;

  defaultImg: string = '';

  /** 是否展示 游戏排行大赢家 */
  bigWinner: boolean = false;

  /** 是否展示 游戏排行幸运玩家 */
  luckestWinner: boolean = false;

  ngOnInit() {
    this.defaultImg = this.miniGameService.defaultImg;
    // 订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
      this.showTab = e ? false : this.logined ? false : true;
    });
  }

  /**
   * mat tab 切换
   *
   * @param $event
   */
  onSelectedChange($event: number) {
    this.dailyRacesService.gameInnerIndex = $event;
  }

  /** 出发订阅函数 初始化 请求参数 */
  gammeInnerEmit() {
    const splitProviderCatId = this.gameInfo?.providerCatId?.split('-') || ['', ''];
    this.dailyRacesService.gameInnerInfo$.next({
      gameId: this.gameInfo?.gameId || '',
      catId: splitProviderCatId[1],
      provider: splitProviderCatId[0],
    });
  }

  ngOnChanges() {
    if (this.gameInfo) {
      this.gammeInnerEmit();
      //加载“为你推荐”这个标签的游戏
      this.loadingGameList = true;
      const multipleLabels = this.gameInfo?.gameLabels?.map(item => item?.code);
      this.miniGameService
        .getGameListByMultipleLabel(multipleLabels, false, 25)
        .pipe(untilDestroyed(this))
        .subscribe(data => {
          this.loadingGameList = false;
          const gameLists = data?.gameLists?.filter(game => game?.id !== this.gameInfo?.id);
          this.gameList = {
            ...data,
            gameLists,
          };
        });
    }
  }

  // 点击游戏
  clickGameItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }
}
