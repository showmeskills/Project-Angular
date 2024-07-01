import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';

export interface CustomizedTimeDialogResInterface {
  // startDate: moment.Moment;
  // endDate: moment.Moment;
  startTime: number;
  endTime: number;
}

@Component({
  selector: 'app-customized-time-dialog',
  templateUrl: './customized-time-dialog.component.html',
  styleUrls: ['./customized-time-dialog.component.scss'],
})
export class CustomizedTimeDialogComponent implements OnInit {
  startDate!: moment.Moment;
  endDate!: moment.Moment;

  constructor(
    public dialogRef: MatDialogRef<CustomizedTimeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { startDate: any; endDate: any; useUTC0: boolean },
  ) {
    this.startDate = moment(data.startDate);
    this.endDate = moment(data.endDate);
  }

  get maxDate() {
    //限定最多三个月
    if (this.startDate) return moment(this.startDate).add(89, 'days');
    return undefined;
  }

  ngOnInit() {}

  //关闭弹窗
  close(done: boolean): void {
    if (done) {
      const _moment = (x: moment.Moment) => (this.data.useUTC0 ? x.utcOffset(0) : x);
      const res: CustomizedTimeDialogResInterface = {
        startTime: _moment(this.startDate).startOf('day').valueOf(),
        endTime: _moment(this.endDate).add(1, 'd').startOf('day').valueOf(),
      };
      this.dialogRef.close(res);
    } else {
      this.dialogRef.close();
    }
  }

  check() {
    //TODO: 后期可增加校验时间是否有效的判断

    this.close(true);
  }
}
