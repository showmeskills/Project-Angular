import { NgModule } from '@angular/core';
import { LifeObserveDirective } from './life-observe.directive';

@NgModule({
  declarations: [LifeObserveDirective],
  exports: [LifeObserveDirective],
})
export class LifeObserveModule {}
