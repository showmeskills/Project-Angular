import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { IntersectionObserverModule } from 'src/app/shared/directive/intersection-observer/intersection-observer.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { NotificationCenterComponent } from './notification-center.component';
import { NotificationCenterRoutes } from './notification-center.routing';
@NgModule({
  declarations: [NotificationCenterComponent],
  imports: [
    CommonModule,
    FormsModule,
    NotificationCenterRoutes,
    PipesModule,
    EmptyModule,
    PaginatorModule,
    MatCheckboxModule,
    LoadingModule,
    IntersectionObserverModule,
    OverlayModule,
  ],
})
export class NotificationCenterModule {}
