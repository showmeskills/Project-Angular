import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { GameList, InfoHorizontalList } from 'src/app/shared/interfaces/game.interface';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-home-sub',
  templateUrl: './home-sub.component.html',
  styleUrls: ['./home-sub.component.scss'],
})
export class HomeSubComponent implements OnInit, OnChanges {
  constructor(
    private router: Router,
    private miniGameService: MiniGameService,
    public appService: AppService,
  ) {}
  domain = window.location.origin;
  @Input() showFor!: string;
  @Input() tabs: InfoHorizontalList[] = [];
  @Input() subName?: string;
  @Input() subIcon?: string;

  loading!: boolean;

  gameList: GameList[] = [];
  loadingGameList: boolean = false;

  get currentData() {
    if (this.tabs.length > 0) {
      return this.tabs?.find(x => x.labelCode?.toString() === this.showFor);
    }
    if (this.gameList.length > 0) {
      return this.gameList.find(x => x.labelCode === this.showFor);
    }
    return undefined;
  }

  get currentGameList() {
    return this.currentData?.gameLists || undefined;
  }

  get gameCout(): number {
    return this.currentData?.gameLists?.length || 0;
  }

  get currentTab() {
    return this.tabs?.find(x => x.labelCode?.toString() === this.showFor);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showFor && this.showFor !== 'index') {
      // 没有传入的游戏数据，重新获取
      if (this.tabs.length < 1) {
        this.loadingGameList = true;
        this.miniGameService
          .getGameByLabel([this.showFor], false, 50, true, 1)
          .pipe(untilDestroyed(this))
          .subscribe(data => {
            this.loadingGameList = false;
            this.gameList = data;
          });
      }
    }
  }

  clickItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }

  toAll() {
    this.router.navigateByUrl(`${this.appService.languageCode}/casino/category/${this.showFor}`);
  }
}
