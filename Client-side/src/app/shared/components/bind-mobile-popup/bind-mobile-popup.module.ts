import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { VerifyCodeModule } from '../verify-code/verify-code.module';
import { BindMobilePopupComponent } from './bind-mobile-popup.component';

@NgModule({
  imports: [CommonModule, VerifyCodeModule, CustomizeFormModule, PipesModule],
  declarations: [BindMobilePopupComponent],
  exports: [BindMobilePopupComponent],
})
export class BindMobilePopupModule {}
