import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaintainComponent } from './maintain.component';
import { MaintainRoutes } from './maintain.routing';

@NgModule({
  imports: [CommonModule, MaintainRoutes],
  declarations: [MaintainComponent],
})
export class MaintainModule {}
