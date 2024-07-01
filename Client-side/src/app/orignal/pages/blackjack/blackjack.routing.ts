import { RouterModule, Routes } from '@angular/router';
import { BlackjackComponent } from './blackjack.component';

const routes: Routes = [
  {
    path: '',
    component: BlackjackComponent,
    pathMatch: 'full',
  },
];

export const BlackjackRoutes = RouterModule.forChild(routes);
