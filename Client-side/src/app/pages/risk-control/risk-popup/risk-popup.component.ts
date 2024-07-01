import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { RiskFormType } from 'src/app/shared/interfaces/risk-control.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { RISKPAGEMAP } from '../risk-control.config';

@Component({
  selector: 'app-risk-popup',
  templateUrl: './risk-popup.component.html',
  styleUrls: ['./risk-popup.component.scss'],
})
export class RiskPopupComponent implements OnInit {
  constructor(
    private appService: AppService,
    private router: Router,
    private dialogRef: MatDialogRef<StandardPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { type: RiskFormType },
    private localeService: LocaleService
  ) {}

  formData: { title: string; router: string } = {
    title: '',
    router: '',
  };

  ngOnInit() {
    this.formData = RISKPAGEMAP[this.data.type];

    console.log('this is formData', this.formData);
  }

  onConfirm() {
    this.router.navigate([this.appService.languageCode, 'risk-control', this.formData.router]);
    this.dialogRef.close();
  }
}
