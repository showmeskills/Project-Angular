import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { KeyWordHeightLight } from 'src/app/shared/pipes/keyword-heightlight.pipe';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { AnnouncementListComponent } from './announcement/announcement-list/announcement-list.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SupportListComponent } from './components/support-list/support-list.component';
import { FaqListComponent } from './faq/faq-list/faq-list.component';
import { FaqComponent } from './faq/faq.component';
import { H5DialogComponent } from './h5-dialog/h5-dialog.component';
import { HelpCenterHomeComponent } from './help-center-home/help-center-home.component';
import { HelpCenterSearchComponent } from './help-center-search/help-center-search.component';
import { HelpCenterComponent } from './help-center.component';
import { HelpCenterRoutes } from './help-center.routing';
import { SupportThemeLayoutComponent } from './components/support-theme-layout/support-theme-layout.component';
import { SupportThemeDetailLayoutComponent } from './components/support-theme-detail-layout/support-theme-detail-layout.component';

@NgModule({
  declarations: [
    HelpCenterHomeComponent,
    AnnouncementComponent,
    AnnouncementListComponent,
    FaqComponent,
    FaqListComponent,
    HelpCenterSearchComponent,
    KeyWordHeightLight,
    H5DialogComponent,
    HelpCenterComponent,
    SearchBarComponent,
    SupportListComponent,
    SupportThemeLayoutComponent,
    SupportThemeDetailLayoutComponent,
  ],
  imports: [
    CommonModule,
    HelpCenterRoutes,
    PaginatorModule,
    FormsModule,
    EmptyModule,
    LoadingModule,
    CustomizeFormModule,
    PipesModule,
  ],
})
export class HelpCenterModule {}
