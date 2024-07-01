import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { DealRecordComponent } from './deal-record.component';

const routes: Routes = [
  {
    matcher: url => {
      const ident = url[0]?.path;
      if (['sport', 'lottery', 'casino', 'poker'].includes(ident)) {
        //符合条件，导航到 /:ident
        return {
          consumed: url,
          posParams: {
            ident: new UrlSegment(ident, {}),
          },
        };
      }
      //重定向到 /sport
      return {
        consumed: [new UrlSegment('sport', {})],
        posParams: {
          ident: new UrlSegment('sport', {}),
        },
      };
    },
    component: DealRecordComponent,
  },
];

export const DealRecordRoutes = RouterModule.forChild(routes);
