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
  selector: 'app-game-recent-played',
  templateUrl: './game-recent-played.component.html',
  styleUrls: ['./game-recent-played.component.scss'],
})
export class GameRecentPlayedComponent implements OnInit {
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
    this.getRecentLyPlayedList(true);
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  getRecentLyPlayedList(init: boolean) {
    init ? (this.loading = true) : (this.nextLoading = true);
    this.miniGameService.getRecentLyPlayedGame(this.paginator.page, this.paginator.pageSize).subscribe(data => {
      if (data) {
        init ? (this.loading = false) : (this.nextLoading = false);
        this.paginator.total = data.total;
        if (data.list) {
          if (init) {
            this.games = data.list;
          } else {
            this.games.push(...data.list);
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
