import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterModule } from '../layouts/footer/footer.module';
import { GameInfoModule } from '../shared/components/game-info/game-info.module';
import { ScrollbarModule } from '../shared/components/scrollbar/scrollbar.module';
import { LoadingModule } from '../shared/directive/loading/loading.module';
import { OrignalRoutingModule } from './orignal-routing.module';
import { OrignalComponent } from './orignal.component';
import { PipesModule } from './shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    OrignalRoutingModule,
    FormsModule,
    LoadingModule,
    HttpClientModule,
    DragDropModule,
    PipesModule,
    OverlayModule,
    ScrollbarModule,
    FooterModule,
    GameInfoModule,
  ],
  declarations: [OrignalComponent],
})
export class OrignalModule {}
