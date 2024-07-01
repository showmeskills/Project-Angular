import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { Ganeral2faVerifyModule } from 'src/app/shared/components/general2faverify/general2faverify.module';
import { ThirdAuthModule } from 'src/app/shared/components/third-auth/third-auth.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { LoginComponent } from './login.component';
import { AccountRoutes } from './login.routing';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    LifeObserveModule,
    AccountRoutes,
    PipesModule,
    CustomizeFormModule,
    ThirdAuthModule,
    Ganeral2faVerifyModule,
  ],
  declarations: [LoginComponent],
})
export class LoginModule {}
