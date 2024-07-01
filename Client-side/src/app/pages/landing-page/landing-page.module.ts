import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { LandingPageComponent } from './landing-page.component';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [CommonModule, LandingPageRoutingModule, PipesModule],
})
export class LandingPageModule {}
