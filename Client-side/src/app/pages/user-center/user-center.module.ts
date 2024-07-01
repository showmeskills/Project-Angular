import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { OverviewComponent } from './overview/overview.component';
import { UserCenterComponent } from './user-center.component';
import { UserCenterRoutes } from './user-center.routing';
@NgModule({
  imports: [
    CommonModule,
    UserCenterRoutes,
    FormsModule,
    MatTabsModule,
    NgApexchartsModule,
    PipesModule,
    EmptyModule,
    LoadingModule,
    CustomizeFormModule,
  ],
  declarations: [UserCenterComponent, OverviewComponent],
  providers: [CurrencyValuePipe],
})
export class UserCenterModule {}
