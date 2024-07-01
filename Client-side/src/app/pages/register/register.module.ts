import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { SelectLangDialogComponent } from 'src/app/shared/components/dialogs/select-lang-dialog/select-lang-dialog.component';
import { Ganeral2faVerifyModule } from 'src/app/shared/components/general2faverify/general2faverify.module';
import { ThirdAuthModule } from 'src/app/shared/components/third-auth/third-auth.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { RegisterComponent } from './register.component';
import { RegisterRoutes } from './register.routing';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    LifeObserveModule,
    RegisterRoutes,
    PipesModule,
    CustomizeFormModule,
    ThirdAuthModule,
    Ganeral2faVerifyModule,
  ],
  declarations: [RegisterComponent, SelectLangDialogComponent],
})
export class RegisterModule {}
