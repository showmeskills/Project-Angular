import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderTitleBarComponent } from './header-title-bar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [HeaderTitleBarComponent],
  exports: [HeaderTitleBarComponent],
})
export class HeaderTitleBarModule {}
