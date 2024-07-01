import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { Location } from '@angular/common';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: '[app-page-banner]',
  templateUrl: './page-banner.component.html',
  styleUrls: ['./page-banner.component.scss'],
})
export class PageBannerComponent implements OnInit {
  constructor(private layout: LayoutService, public location: Location, private miniGameService: MiniGameService) {}

  isH5!: boolean;

  @Input() title!: string;
  @Input() type: string = '';

  bannerMap: { [key: string]: string } = {
    favorites: 'assets/images/game/banner/scj.png', //我的收藏
    history: 'assets/images/game/banner/history.png', //近期所有玩过
    // '1':'assets/images/game/banner/ycyx.png', //原创游戏
    // '9':'assets/images/game/banner/zrbjl.png', //真人百家乐
    // '13':'assets/images/game/banner/zrylc.png', //真人娱乐场
    // '8':'assets/images/game/banner/lhj.png', //老虎机
    // '4':'assets/images/game/banner/pyyx.png', //捕鱼游戏
    // '11':'assets/images/game/banner/yxjm.png', //游戏节目
    // '12':'assets/images/game/banner/xyx.png', //新游戏
    // '6':'assets/images/game/banner/zmyx.png', //桌面游戏
    provider: 'assets/images/game/banner/yxtgs.png', //游戏提供商
    // '21Point':'assets/images/game/banner/21d.png', //21点
    // 'Roulette':'assets/images/game/banner/lp.png', //轮盘
  };

  get banner() {
    return this.bannerMap[this.type] || 'assets/images/game/banner/yxtgs.png';
  }

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.getGamelabel();
  }

  getGamelabel() {
    this.miniGameService.getGamelabel().subscribe(data => {
      const map: any = {};
      data.forEach(x => {
        map[x.code] = x.image;
      });
      this.bannerMap = { ...this.bannerMap, ...map };
    });
  }
}
