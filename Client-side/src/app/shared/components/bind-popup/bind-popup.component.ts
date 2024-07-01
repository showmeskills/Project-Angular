import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from '../../service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-bind-popup',
  templateUrl: './bind-popup.component.html',
  styleUrls: ['./bind-popup.component.scss'],
})
export class BindPopupComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<BindPopupComponent>,
    private appService: AppService,
    private layout: LayoutService
  ) {}

  isH5!: boolean;

  get langCode() {
    return this.appService.languageCode;
  }

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  cancel() {
    this.dialogRef.close();
  }
}
