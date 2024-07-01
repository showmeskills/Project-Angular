import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { GameListItem } from 'src/app/shared/interfaces/game.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-game-like-collection',
  templateUrl: './game-like-collection.component.html',
  styleUrls: ['./game-like-collection.component.scss'],
})
export class GameLikeCollectionComponent implements OnInit {
  constructor(
    private router: Router,
    private layout: LayoutService,
    private miniGameService: MiniGameService,
    private appService: AppService
  ) {}

  isH5!: boolean;

  games: GameListItem[] = [];
  loading!: boolean;
  nextLoading!: boolean;

  //分页器
  paginator: PaginatorState = {
    page: 1,
    pageSize: 24, // 每页24个
    total: 0,
  };

  ngOnInit() {
    this.getFavoriteList(true);
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  getFavoriteList(init: boolean) {
    init ? (this.loading = true) : (this.nextLoading = true);
    this.miniGameService.getFavoriteList(this.paginator.page, this.paginator.pageSize).subscribe(data => {
      if (data) {
        init ? (this.loading = false) : (this.nextLoading = false);
        this.paginator.total = data.total;
        if (data.gameList) {
          if (init) {
            this.games = data.gameList;
          } else {
            this.games.push(...data.gameList);
          }
        }
      }
    });
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
