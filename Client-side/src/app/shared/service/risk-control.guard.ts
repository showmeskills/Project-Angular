import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { RiskFormMap } from '../interfaces/risk-control.interface';
import { LocalStorageService } from './localstorage.service';

@Injectable({ providedIn: 'root' })
export class RiskControlGuard  {
  constructor(private localStroageService: LocalStorageService, private appService: AppService) {}
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const urlArr = state.url.split('/');
    const lastChild = urlArr[urlArr.length - 1];
    const currentRoute = lastChild.includes('?') ? lastChild.split('?')[0] : lastChild;
    const status = lastChild.includes('?') ? lastChild.split('?')[1] : '';

    if (status.includes('rejected') || this.checkRouteMatchForm(currentRoute)) {
      return true;
    }
    this.appService.jumpToHome();
    return false;
  }

  checkRouteMatchForm(currentRoute: string): boolean {
    const savedFrom = JSON.parse(this.localStroageService.riskForm);

    switch (currentRoute) {
      case 'edd':
        return savedFrom?.includes(RiskFormMap.RISKASSESSMENT);
      case 'proof-of-income':
        return savedFrom?.includes(RiskFormMap.WEALTHSOURCE);
      case 'upload-files':
        return savedFrom?.includes(RiskFormMap.FULLAUDIT);
      default:
        return false;
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivateChild(route, state);
  }
}
