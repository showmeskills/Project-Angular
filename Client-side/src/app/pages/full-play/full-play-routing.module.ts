import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullPlayComponent } from './full-play.component';

const routes: Routes = [
  { path: '', redirectTo: '../404', pathMatch: 'full' },
  { path: ':providerId/:gameId', component: FullPlayComponent },
  { path: ':providerId', component: FullPlayComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullPlayRoutingModule {}
