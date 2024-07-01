import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { CustomizedTimeDialogComponent, CustomizedTimeDialogResInterface } from './customized-time-dialog.component';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class CustomizedTimeService {
  private isH5!: boolean;

  constructor(private popup: PopupService, private layout: LayoutService) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  show(startDate: number, endDate: number, useUTC0: boolean = false): Observable<number[]> {
    return this.popup
      .open(CustomizedTimeDialogComponent, {
        inAnimation: this.isH5 ? 'fadeInUp' : undefined,
        outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
        position: this.isH5 ? { bottom: '0px' } : undefined,
        speed: 'faster',
        autoFocus: false,
        data: { startDate, endDate, useUTC0 },
      })
      .afterClosed()
      .pipe(
        map((v: CustomizedTimeDialogResInterface) => {
          if (v?.startTime && v?.endTime) {
            return [v.startTime, v.endTime];
          } else {
            //用户放弃或者无效值
            return [0, 0];
          }
        })
      );
  }
}
