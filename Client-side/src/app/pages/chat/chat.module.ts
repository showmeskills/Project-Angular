import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { LazyImageComponent } from 'src/app/shared/components/lazy-image/lazy-image.component';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ExpansionModule } from 'src/app/shared/directive/expansion/expansion.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ChatComponent } from './chat.component';
import { DurationPipe } from './duration.pipe';
import { MessageItemComponent } from './message-item/message-item.component';

@NgModule({
  imports: [
    CommonModule,
    ScrollbarModule,
    ExpansionModule,
    PipesModule,
    CustomizeFormModule,
    LoadingModule,
    LazyImageComponent,
  ],
  declarations: [ChatComponent, MessageItemComponent, DurationPipe],
  exports: [ChatComponent],
})
export class ChatModule {}
