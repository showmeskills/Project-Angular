import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from '../../service/layout.service';
import { BindPopupComponent } from '../bind-popup/bind-popup.component';

@UntilDestroy()
@Component({
  selector: 'app-early-recharge-popup',
  templateUrl: './early-recharge-popup.component.html',
  styleUrls: ['./early-recharge-popup.component.scss'],
})
export class EarlyRechargePopupComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<BindPopupComponent>,
    private appService: AppService,
    private layout: LayoutService,
    private router: Router
  ) {}

  isH5!: boolean;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  get langCode() {
    return this.appService.languageCode;
  }

  goToFaitDeposit() {
    this.router.navigate([this.appService.languageCode, 'deposit', 'fiat']);
    this.dialogRef.close();
  }
}
