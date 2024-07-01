import { RouterModule, Routes } from '@angular/router';
import { GameLevel2Component } from './game-level2/game-level2.component';
import { GameLevel3Component } from './game-level3/game-level3.component';
import { GameLikeCollectionComponent } from './game-like-collection/game-like-collection.component';
import { GameProviderComponent } from './game-provider/game-provider.component';
import { GameRecentPlayedComponent } from './game-recent-played/game-recent-played.component';
import { MinigameComponent } from './minigame.component';

const routes: Routes = [
  { path: '', redirectTo: 'home/index', pathMatch: 'full' },
  { path: 'home/:sub', component: MinigameComponent, data: { keep: true } },

  // 二级页面-标签分类
  { path: 'category', redirectTo: 'home/index', pathMatch: 'full' },
  { path: 'category/:label', component: GameLevel2Component },

  // 二级页面-厂商
  { path: 'provider', redirectTo: 'provider/index', pathMatch: 'full' },
  { path: 'provider/:providerId', component: GameProviderComponent },

  //二级页面-收藏
  { path: 'favourites', component: GameLikeCollectionComponent },

  //二级页面-近期玩过
  { path: 'recentPlayed', component: GameRecentPlayedComponent },

  // 三级页面
  { path: 'games/:providerId/:gameId', component: GameLevel3Component },
];

export const MinigameRoutes = RouterModule.forChild(routes);
