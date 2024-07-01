import { RouterModule, Routes } from '@angular/router';
import { CloseAccountComponent } from './configure/close-account/close-account.component';
import { ConfigureComponent } from './configure/configure.component';
import { DepositLimitComponent } from './configure/deposit-limit/deposit-limit.component';
import { RemindComponent } from './configure/remind/remind.component';
import { SelfProhibitComponent } from './configure/self-prohibit/self-prohibit.component';
import { SuspendComponent } from './configure/suspend/suspend.component';
import { UserActivitiesComponent } from './configure/user-activities/user-activities.component';
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

const routes: Routes = [
  {
    path: '',
    component: ResponsibleGamblingComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      {
        path: 'responsible',
        component: ResponsibleComponent,
        children: [
          { path: '', redirectTo: 'concept', pathMatch: 'full' },
          { path: 'concept', component: ResponsibleConceptComponent },
          { path: 'faq', component: ResponsibleFaqComponent },
          { path: 'operation', component: ResponsibleOperationComponent },
          { path: 'misunderstand', component: ResponsibleMisunderstandComponent },
        ],
      },
      {
        path: 'support',
        component: SupportComponent,
        children: [
          { path: '', redirectTo: 'group', pathMatch: 'full' },
          { path: 'group', component: SupportGroupComponent },
          { path: 'protect', component: SupportProtectComponent },
          { path: 'help', component: SupportHelpComponent },
        ],
      },
      {
        path: 'control',
        component: ControlComponent,
        children: [
          { path: '', redirectTo: 'limit', pathMatch: 'full' },
          { path: 'limit', component: ControlLimitComponent },
          { path: 'contral-faq', component: ControlFaqComponent },
          { path: 'calculator', component: ControlCalculatorComponent },
          { path: 'activity', component: ControlActivityComponent },
          { path: 'stop', component: ControlStopComponent },
          { path: 'prohibit-self', component: ControlProhabitSelfComponent },
          { path: 'block', component: ControlBlockComponent },
        ],
      },
      { path: 'contact', component: ContactComponent },
    ],
  },
  {
    path: 'configure',
    component: ConfigureComponent,
    children: [
      { path: '', redirectTo: 'activities', pathMatch: 'full' },
      { path: 'activities', component: UserActivitiesComponent },
      { path: 'deposit-limit', component: DepositLimitComponent },
      { path: 'suspend', component: SuspendComponent },
      { path: 'self-prohibit', component: SelfProhibitComponent },
      { path: 'close-account', component: CloseAccountComponent },
      { path: 'remind', component: RemindComponent },
    ],
  },
  // {
  //   path: 'deposit-limit',
  //   component: NewDepositLimitComponent,
  // },
];

export const ResponsibleGamblingRoute = RouterModule.forChild(routes);
