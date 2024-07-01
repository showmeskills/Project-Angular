import { NgModule } from '@angular/core';
import { AuthDirective } from './auth.directive';

@NgModule({
  declarations: [AuthDirective],
  exports: [AuthDirective],
})
export default class AuthDirectiveModule {}
