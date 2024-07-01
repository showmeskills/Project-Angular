import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { CustomizeTextModule } from 'src/app/shared/components/customize-text/customize-text.module';
import { DatepickerModule } from 'src/app/shared/components/datepicker/datepicker.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ExpansionModule } from 'src/app/shared/directive/expansion/expansion.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CloseAccountComponent } from './configure/close-account/close-account.component';
import { ConfigureComponent } from './configure/configure.component';
import { DepositLimitComponent } from './configure/deposit-limit/deposit-limit.component';
import { RemindComponent } from './configure/remind/remind.component';
import { SelfProhibitComponent } from './configure/self-prohibit/self-prohibit.component';
import { SuspendComponent } from './configure/suspend/suspend.component';
import { UserActivitiesComponent } from './configure/user-activities/user-activities.component';
import { DialogDepositComponent } from './new-deposit-limit/dialog-deposit/dialog-deposit.component';
import { NewDepositLimitComponent } from './new-deposit-limit/new-deposit-limit.component';
import { OtherPagesBarnnerComponent } from './other-pages/components/other-pages-barnner/other-pages-barnner.component';
import { OtherPagesFooterComponent } from './other-pages/components/other-pages-footer/other-pages-footer.component';
import { ContactComponent } from './other-pages/contact/contact.component';
import { ControlActivityComponent } from './other-pages/control/control-activity/control-activity.component';
import { ControlBlockComponent } from './other-pages/control/control-block/control-block.component';
import { ControlCalculatorComponent } from './other-pages/control/control-calculator/control-calculator.component';
import { ControlFaqComponent } from './other-pages/control/control-faq/control-faq.component';
import { ControlLimitComponent } from './other-pages/control/control-limit/control-limit.component';
import { ControlProhabitSelfComponent } from './other-pages/control/control-prohabit-self/control-prohabit-self.component';
import { ControlStopComponent } from './other-pages/control/control-stop/control-stop.component';
import { ControlComponent } from './other-pages/control/control.component';
import { HomeComponent } from './other-pages/home/home.component';
import { ResponsibleConceptComponent } from './other-pages/responsible/responsible-concept/responsible-concept.component';
import { ResponsibleFaqComponent } from './other-pages/responsible/responsible-faq/responsible-faq.component';
import { ResponsibleMisunderstandComponent } from './other-pages/responsible/responsible-misunderstand/responsible-misunderstand.component';
import { ResponsibleOperationComponent } from './other-pages/responsible/responsible-operation/responsible-operation.component';
import { ResponsibleComponent } from './other-pages/responsible/responsible.component';
import { SupportGroupComponent } from './other-pages/support/support-group/support-group.component';
import { SupportHelpComponent } from './other-pages/support/support-help/support-help.component';
import { SupportProtectComponent } from './other-pages/support/support-protect/support-protect.component';
import { SupportComponent } from './other-pages/support/support.component';
import { ResponsibleGamblingComponent } from './responsible-gambling.component';
import { ResponsibleGamblingRoute } from './responsible-gambling.routing';
@NgModule({
  declarations: [
    ResponsibleGamblingComponent,
    ConfigureComponent,
    UserActivitiesComponent,
    DepositLimitComponent,
    CloseAccountComponent,
    RemindComponent,
    SelfProhibitComponent,
    SuspendComponent,
    ResponsibleComponent,
    ControlComponent,
    SupportComponent,
    ContactComponent,
    HomeComponent,
    OtherPagesBarnnerComponent,
    ResponsibleConceptComponent,
    ResponsibleFaqComponent,
    ResponsibleOperationComponent,
    ResponsibleMisunderstandComponent,
    ControlLimitComponent,
    ControlFaqComponent,
    ControlCalculatorComponent,
    ControlActivityComponent,
    ControlStopComponent,
    ControlProhabitSelfComponent,
    ControlBlockComponent,
    SupportGroupComponent,
    SupportProtectComponent,
    SupportHelpComponent,
    OtherPagesFooterComponent,
    NewDepositLimitComponent,
    DialogDepositComponent,
  ],
  imports: [
    CommonModule,
    ResponsibleGamblingRoute,
    CustomizeFormModule,
    ExpansionModule,
    ToolTipModule,
    PipesModule,
    CustomizeTextModule,
    DatepickerModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
  ],
})
export class ResponsibleGambling {}
