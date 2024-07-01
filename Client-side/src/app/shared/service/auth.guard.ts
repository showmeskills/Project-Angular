import { Injectable } from '@angular/core';
import { UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LocalStorageService } from './localstorage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private localStroageService: LocalStorageService,
    private appService: AppService,
  ) {}

  canActivateChild(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.localStroageService.loginToken) return true;
    this.appService.jumpToLogin(false, false, true);
    return false;
  }

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.canActivateChild();
  }
}
