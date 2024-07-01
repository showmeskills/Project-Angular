import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { NewUserActivity } from 'src/app/shared/interfaces/activity.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { ActivityService } from '../activity.service';

@Component({
  selector: 'app-new-user-prize',
  templateUrl: './new-user-prize.component.html',
  styleUrls: ['./new-user-prize.component.scss'],
})
export class NewUserPrizeComponent implements OnInit {
  constructor(
    private activityService: ActivityService,
    private activityApi: ActivityApi,
    private toast: ToastService,
    private localeService: LocaleService,
    @Optional() private dialogRef: MatDialogRef<NewUserPrizeComponent>
  ) {}

  selectedPrize?: NewUserActivity;
  loading!: boolean;
  regBonusList: NewUserActivity[] = [];

  ngOnInit() {
    this.regBonusList = this.activityService.regBonusList;
    const defaultItem = this.regBonusList.find(x => x.isDefault);
    this.selectedPrize = defaultItem ?? this.regBonusList[0];
  }

  /**提交红利申请 */
  submit() {
    if (!this.selectedPrize) return;
    this.loading = true;
    this.activityApi
      .newuseractivityapply(this.selectedPrize.prizeCode, this.selectedPrize.tmpCode, this.selectedPrize.tmpType)
      .subscribe(res => {
        this.loading = false;
        if (res?.data) {
          this.toast.show({ type: 'success', message: this.localeService.getValue('op_s') });
        } else {
          if (res?.message) {
            this.toast.show({ type: 'fail', message: res.message });
          }
        }
        this.dialogRef?.close();
      });
  }
}
