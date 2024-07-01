import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { NgApexchartsModule } from 'ng-apexcharts';
import { QrCodeModule } from 'ng-qrcode';
import { ResultDialogModule } from 'src/app/pages/user-asset/wallet-transfer/result-dialog/result-dialog.component.module';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { DatepickerModule } from 'src/app/shared/components/datepicker/datepicker.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ImgCarouselModule } from 'src/app/shared/components/img-carousel/img-carousel.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AffiliateCommissionReturnComponent } from './affiliate-program/affiliate-commission-return/affiliate-commission-return.component';
import { AffiliateCustomerOperationComponent } from './affiliate-program/affiliate-customer-operation/affiliate-customer-operation.component';
import { AffiliateDataComparsionComponent } from './affiliate-program/affiliate-data-comparsion/affiliate-data-comparsion.component';
import { AffiliateMemberManagementComponent } from './affiliate-program/affiliate-member-management/affiliate-member-management.component';
import { AffiliateProgramComponent } from './affiliate-program/affiliate-program.component';
import { GameRecordComponent } from './affiliate-program/game-record/game-record.component';
import { AddNewRecommendComponent } from './components/add-new-recommend/add-new-recommend.component';
import { ApplicationCheckComponent } from './components/application-page/application-check/application-check.component';
import { ApplicationFormComponent } from './components/application-page/application-form/application-form.component';
import { ApplicationPageComponent } from './components/application-page/application-page.component';
import { DataOverviewComponent } from './components/data-overview/data-overview.component';
import { FriendFooterComponent } from './components/friend-footer/friend-footer.component';
import { FriendHeaderComponent } from './components/friend-header/friend-header.component';
import { FriendsListComponent } from './components/friends-list/friends-list.component';
import { HistoryPopupComponent } from './components/history-popup/history-popup.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { RecommendOperation } from './components/recommend-operation/recommend-operation.component';
import { RecommendedReturnComponent } from './components/recommended-return/recommended-return.component';
import { RolePageComponent } from './components/role-page/role-page.component';
import { SharedDialogComponent } from './components/shared-dialog/shared-dialog.component';
import { TableComponentComponent } from './components/table-component/table-component.component';
import { ThemeComponentComponent } from './components/theme-component/theme-component.component';
import { WebRankPopUpComponent } from './components/web-rank-pop-up/web-rank-pop-up.component';
import { FriendComponent } from './friend.component';
import { FriendRoutes } from './friend.routing';
import { CommissionReturnComponent } from './recommend/commission-return/commission-return.component';
import { RecommendComponent } from './recommend/recommend.component';
import { SuperPartnerComponent } from './super-partner/super-partner.component';

@NgModule({
  declarations: [
    RecommendComponent,
    AffiliateProgramComponent,
    SuperPartnerComponent,
    SharedDialogComponent,
    RecommendOperation,
    FriendFooterComponent,
    DataOverviewComponent,
    CommissionReturnComponent,
    RecommendedReturnComponent,
    FriendComponent,
    WebRankPopUpComponent,
    FriendsListComponent,
    AddNewRecommendComponent,
    // FriendLineChartComponent,
    FriendHeaderComponent,
    AffiliateCommissionReturnComponent,
    AffiliateDataComparsionComponent,
    HistoryPopupComponent,
    AffiliateMemberManagementComponent,
    AffiliateCustomerOperationComponent,
    RolePageComponent,
    ApplicationPageComponent,
    PaginatorComponent,
    ApplicationCheckComponent,
    TableComponentComponent,
    ThemeComponentComponent,
    GameRecordComponent,
    ApplicationFormComponent,
  ],
  imports: [
    CommonModule,
    FriendRoutes,
    FormsModule,
    MatCheckboxModule,
    NgApexchartsModule,
    ScrollbarModule,
    MatRadioModule,
    CustomizeFormModule,
    EmptyModule,
    LoadingModule,
    PipesModule,
    QrCodeModule,
    ResultDialogModule,
    PipesModule,
    DatepickerModule,
    ToolTipModule,
    ImgCarouselModule,
  ],
  providers: [CurrencyValuePipe],
})
export class FriendModule {}
