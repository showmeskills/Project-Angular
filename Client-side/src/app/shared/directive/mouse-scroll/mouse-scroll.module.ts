import { NgModule } from '@angular/core';
import { MouseScrollDirective } from './mouse-scroll.directive';

@NgModule({
  declarations: [MouseScrollDirective],
  exports: [MouseScrollDirective],
})
export class MouseScrollModule {}
