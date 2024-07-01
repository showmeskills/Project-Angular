import { RouterModule, Routes } from '@angular/router';
import { DisableEmailComponent } from './disable-email/disable-email.component';
import { DisableSocialComponent } from './disable-social/disable-social.component';
import { EnableEmailComponent } from './enable-email/enable-email.component';
import { GoogleUnboundComponent } from './google-unbound/google-unbound.component';
import { GoogleVerificationComponent } from './google-verification/google-verification.component';
import { PhoneVerificationComponent } from './phone-verification/phone-verification.component';
import { ResetPhoneNumberComponent } from './reset-phone-number/reset-phone-number.component';

const routes: Routes = [
  //绑定手机号码
  { path: 'enable-phone', component: PhoneVerificationComponent },
  //修改手机号
  { path: 'reset-phone', component: ResetPhoneNumberComponent },
  //绑定谷歌验证
  { path: 'enable-google', component: GoogleVerificationComponent },
  //解绑谷歌验证
  { path: 'disable-google', component: GoogleUnboundComponent },
  // //解绑手机号
  // { path: 'disable-phone', component: UnboundPhoneComponent },
  //解绑社交媒体账号
  { path: 'disable-social', component: DisableSocialComponent },
  // 解绑邮箱
  { path: 'disable-email', component: DisableEmailComponent },
  // 绑定邮箱
  { path: 'enable-email', component: EnableEmailComponent },
];

export const VerificationRoutes = RouterModule.forChild(routes);
