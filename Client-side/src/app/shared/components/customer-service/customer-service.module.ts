import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LiveChatWidgetModule } from '@livechat/widget-angular';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { CustomerServiceComponent } from './customer-service.component';
import { LiveChatComponent } from './liveChat/liveChat.component';

@NgModule({
  imports: [CommonModule, LiveChatWidgetModule, DragDropModule, CustomizeFormModule, PipesModule],
  declarations: [CustomerServiceComponent, LiveChatComponent],
  exports: [CustomerServiceComponent],
})
export class CustomerServiceModule {}
