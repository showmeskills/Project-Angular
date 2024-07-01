import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-history-popup',
  templateUrl: './history-popup.component.html',
  styleUrls: ['./history-popup.component.scss'],
})
export class HistoryPopupComponent implements OnInit {
  isH5!: boolean;
  selectedDate: string = ''; //选择日期
  selectAccountType: string = ''; //选择账户类型
  selectType: string = ''; //选择类型
  dateList: any = [{ name: this.localeService.getValue(`all_line`), value: '' }];
  accountTypeList: any = [{ name: this.localeService.getValue(`all_line`), value: '' }];
  typeList: any = [{ name: this.localeService.getValue(`all_line`), value: 0 }];
  constructor(
    private layout: LayoutService,
    private dialogRef: MatDialogRef<HistoryPopupComponent>,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  // 关闭弹窗
  close() {
    this.dialogRef.close();
  }
}
