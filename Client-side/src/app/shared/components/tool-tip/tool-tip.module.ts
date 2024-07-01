import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IntersectionObserverModule } from 'src/app/shared/directive/intersection-observer/intersection-observer.module';
import { ToolTipComponent } from './tool-tip.component';
@NgModule({
  imports: [CommonModule, OverlayModule, IntersectionObserverModule],
  declarations: [ToolTipComponent],
  exports: [ToolTipComponent],
})
export class ToolTipModule {}
