import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { FullscreenModule } from 'src/app/shared/components/fullscreen/fullscreen.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { FullPlayRoutingModule } from './full-play-routing.module';
import { FullPlayComponent } from './full-play.component';

@NgModule({
  imports: [
    CommonModule,
    FullPlayRoutingModule,
    PipesModule,
    OverlayModule,
    ClickOutsideModule,
    LoadingModule,
    CustomizeFormModule,
    ToolTipModule,
    FullscreenModule,
  ],
  declarations: [FullPlayComponent],
})
export class FullPlayModule {}
