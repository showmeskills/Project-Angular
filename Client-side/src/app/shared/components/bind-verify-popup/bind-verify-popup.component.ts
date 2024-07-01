import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LocaleService } from '../../service/locale.service';
import { BindPopupComponent } from '../bind-popup/bind-popup.component';

interface AuthOption {
  path: string;
  text: string;
  type: string;
  selected: boolean;
  route: string;
}

@Component({
  selector: 'app-bind-verify-popup',
  templateUrl: './bind-verify-popup.component.html',
  styleUrls: ['./bind-verify-popup.component.scss'],
})
export class BindVerifyPopupComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<BindPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private router: Router,
    private appService: AppService,
    private localeService: LocaleService
  ) {}
  options: Array<AuthOption> = [
    {
      path: 'google-auth',
      text: this.localeService.getValue('bind_google'),
      type: 'google',
      selected: true,
      route: 'enable-google',
    },
    {
      path: 'phone-auth',
      text: this.localeService.getValue('phone_verification'),
      type: 'phone',
      selected: false,
      route: 'enable-phone',
    },
  ];

  ngOnInit() {}

  handleSelect(item: AuthOption) {
    this.options.forEach(x => (x.selected = false));
    item.selected = true;
  }

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    const selectedAuth = this.options.find(x => x.selected);
    this.router.navigate([this.appService.languageCode, 'verification', `${selectedAuth?.route}`]);
    this.dialogRef.close(false);
  }
}
