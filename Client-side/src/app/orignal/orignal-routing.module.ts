import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrignalComponent } from './orignal.component';
const routes: Routes = [
  {
    path: '',
    component: OrignalComponent,
    children: [
      // 默认跳转滚球
      { path: '', redirectTo: 'dice', pathMatch: 'full' },
      {
        path: 'dice',
        data: { name: 'DICE' },
        loadChildren: () => import('./pages/dice/dice.module').then(m => m.DiceModule),
      },
      {
        path: 'crash',
        data: { name: 'CRASH' },
        loadChildren: () => import('./pages/crash/crash.module').then(m => m.CrashModule),
      },
      {
        path: 'hilo',
        data: { name: 'HILO' },
        loadChildren: () => import('./pages/hilo/hilo.module').then(m => m.HiloModule),
      },
      {
        path: 'mines',
        data: { name: 'MINES' },
        loadChildren: () => import('./pages/mines/mines.module').then(m => m.MinesModule),
      },
      {
        path: 'plinko',
        data: { name: 'PLINKO' },
        loadChildren: () => import('./pages/plinko/plinko.module').then(m => m.PlinkoModule),
      },
      {
        path: 'stairs',
        data: { name: 'STAIRS' },
        loadChildren: () => import('./pages/stairs/stairs.module').then(m => m.StairsModule),
      },
      {
        path: 'circle',
        data: { name: 'CIRCLE' },
        loadChildren: () => import('./pages/circle/circle.module').then(m => m.CircleModule),
      },
      {
        path: 'wheel',
        data: { name: 'WHEEL' },
        loadChildren: () => import('./pages/wheel/wheel.module').then(m => m.WheelModule),
      },
      {
        path: 'limbo',
        data: { name: 'LIMBO' },
        loadChildren: () => import('./pages/limbo/limbo.module').then(m => m.LimboModule),
      },
      {
        path: 'cryptos',
        data: { name: 'CRYPTOS' },
        loadChildren: () => import('./pages/cryptos/cryptos.module').then(m => m.CryptosModule),
      },
      {
        path: 'baccarat',
        data: { name: 'BACCARAT' },
        loadChildren: () => import('./pages/baccarat/baccarat.module').then(m => m.BaccaratModule),
      },
      {
        path: 'tower',
        data: { name: 'TOWER' },
        loadChildren: () => import('./pages/tower/tower.module').then(m => m.TowerModule),
      },
      {
        path: 'spacedice',
        data: { name: 'SPACEDICE' },
        loadChildren: () => import('./pages/space-dice/space-dice.module').then(m => m.SpaceDiceModule),
      },
      {
        path: 'blackjack',
        data: { name: 'BLACKJACK' },
        loadChildren: () => import('./pages/blackjack/blackjack.module').then(m => m.BlackjackModule),
      },
      {
        path: 'coinflip',
        data: { name: 'COINFLIP' },
        loadChildren: () => import('./pages/coinflip/coinflip.module').then(m => m.CoinflipModule),
      },
      {
        path: 'slide',
        data: { name: 'SLIDE' },
        loadChildren: () => import('./pages/slide/slide.module').then(m => m.SlideModule),
      },
      {
        path: 'teemo',
        data: { name: 'TEEMO' },
        loadChildren: () => import('./pages/teemo/teemo.module').then(m => m.TeemoModule),
      },
      {
        path: 'csgo',
        data: { name: 'CSGO' },
        loadChildren: () => import('./pages/csgo/csgo.module').then(m => m.CsgoModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule],
})
export class OrignalRoutingModule {}
