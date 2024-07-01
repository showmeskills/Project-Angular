import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { ResponsibleApi } from 'src/app/shared/apis/responsible.api';
import { LayoutService } from 'src/app/shared/service/layout.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@UntilDestroy()
@Component({
  selector: 'app-dialog-deposit',
  templateUrl: './dialog-deposit.component.html',
  styleUrls: ['./dialog-deposit.component.scss'],
})
export class DialogDepositComponent implements OnInit {
  isH5!: boolean;
  codeLink: string = '';

  gameList: { name: string; time: string }[] = [
    {
      name: '6 Months',
      time: moment().add(6, 'months').toISOString(),
    },
    {
      name: '1 year',
      time: moment().add(1, 'years').toISOString(),
    },
    {
      name: 'Indefinitely',
      time: moment().add(2, 'years').toISOString(),
    },
  ];
  timeVal: string | null = null;
  selectedValue: boolean = false;
  submitLoading: boolean = false;
  constructor(
    private layout: LayoutService,
    private appService: AppService,
    private dialogRef: MatDialogRef<DialogDepositComponent>,
    private ResponsibleApi: ResponsibleApi,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  onContinue() {
    if (!this.timeVal || !this.selectedValue) return;
    console.log(1);
    this.submitLoading = true;
    this.ResponsibleApi.setSelFexClusion(this.timeVal).subscribe(data => {
      this.submitLoading = false;
      if (data) {
        this.appService.logoutSubject$.next(true);
        this.dialogRef.close();
      }
    });
  }
  /**@canContinue 是否可以继续操作 */
  canContinue() {
    return this.timeVal && this.selectedValue;
  }
  close() {
    this.dialogRef.close();
  }
}
