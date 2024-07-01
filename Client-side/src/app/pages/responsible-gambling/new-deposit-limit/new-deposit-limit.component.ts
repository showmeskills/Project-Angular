import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ResponsibleApi } from 'src/app/shared/apis/responsible.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { ModifyDepositLimit } from 'src/app/shared/interfaces/responsible.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DialogDepositComponent } from './dialog-deposit/dialog-deposit.component';

const CANCELTYPE: string[] = ['Daily', 'Weekly', 'Monthly'];

@UntilDestroy()
@Component({
  selector: 'app-new-deposit-limit',
  templateUrl: './new-deposit-limit.component.html',
  styleUrls: ['./new-deposit-limit.component.scss'],
  host: { class: 'container' },
})
export class NewDepositLimitComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private popup: PopupService,
    private ResponsibleApi: ResponsibleApi,
    private toast: ToastService,
    private localService: LocaleService,
    private appService: AppService,
    private router: Router,
  ) {}

  isH5!: boolean;
  editMode: boolean = false;

  limitData: {
    label: string;
    value: null | number;
    dailyVal: null | number;
    preset: null | number;
    presetTime: null | string;
    tip24: boolean; // 限制低到限制高，是立即生效，反之就24小时
  }[] = [
    { label: 'Daily Limit', value: null, dailyVal: null, preset: null, presetTime: null, tip24: false },
    { label: 'Weekly Limit', value: null, dailyVal: null, preset: null, presetTime: null, tip24: false },
    { label: 'Monthly Limit', value: null, dailyVal: null, preset: null, presetTime: null, tip24: false },
  ];
  submitLoading: boolean = false;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(x => (this.isH5 = x));
    this.ResponsibleApi.getDepositLimit().subscribe(data => {
      if (data) {
        this.setDaiyLimit(data);
      }
    });
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((x: AccountInforData | null) => {
      const userInfo = x ?? ({} as any);
      // 判断国家开启自我约束功能
      // 有KYC的用户就用手机国家区号来判断不用IP
      if (userInfo?.areaCode) {
        if (userInfo?.areaCode != '+599') {
          this.router.navigateByUrl(`${this.appService.languageCode}`);
        }
      } else {
        if (this.appService.countryCode != 'CW') {
          this.router.navigateByUrl(`${this.appService.languageCode}`);
        }
      }
    });
  }

  setDaiyLimit(data: ModifyDepositLimit) {
    const dailyLimit = this.limitData[0];
    const weeklyLimit = this.limitData[1];
    const monthlyLimit = this.limitData[2];
    // 有预设 优先显示预设
    dailyLimit.value = data.dailyLimit;
    monthlyLimit.value = data.monthlyLimit;
    weeklyLimit.value = data.weeklyLimit;

    dailyLimit.dailyVal = data.dailyLimit;
    monthlyLimit.dailyVal = data.monthlyLimit;
    weeklyLimit.dailyVal = data.weeklyLimit;

    dailyLimit.preset = data.dailyLimitPreset;
    monthlyLimit.preset = data.monthlyLimitPreset;
    weeklyLimit.preset = data.weeklyLimitPreset;

    dailyLimit.presetTime = data.dailyLimitPresetEffectiveTime;
    monthlyLimit.presetTime = data.monthlyLimitPresetEffectiveTime;
    weeklyLimit.presetTime = data.weeklyLimitPresetEffectiveTime;
  }
  onOptions() {
    this.popup.open(DialogDepositComponent, {
      speed: 'faster',
      data: {
        closeIcon: true,
      },
    });
  }

  onAdd(index: number) {
    let val = Number(this.limitData[index].value);

    if (val == null) {
      val = 0;
    }
    val = val + 50;
    this.limitData[index].value = val;
    if (this.limitData[index].dailyVal) {
      const dailyVal = this.limitData[index].dailyVal ?? 0;
      this.limitData[index].tip24 = val > dailyVal;
    }
  }

  onDel(index: number) {
    let val: number | null = Number(this.limitData[index].value);
    if (val == null) {
      return;
    }
    if (val - 50 < 0) {
      val = null;
      this.limitData[index].value = val;
      return;
    }
    val = val - 50;
    this.limitData[index].value = val;

    if (this.limitData[index].dailyVal) {
      const dailyVal = this.limitData[index].dailyVal ?? 0;
      this.limitData[index].tip24 = val > dailyVal;
    }
  }

  delLimit(index: number) {
    this.limitData[index].value = null;
  }

  onCancelRequest(index: number) {
    this.ResponsibleApi.cancelDepositLimitPreset(CANCELTYPE[index]).subscribe(data => {
      if (data) {
        if (data) {
          this.toast.show({ message: this.localService.getValue('op_s'), type: 'success' });
          this.setDaiyLimit(data);
        } else {
          this.toast.show({ message: this.localService.getValue('op_f'), type: 'fail' });
        }
      }
    });
  }
  onBlur(e: number | null, index: number) {
    if (!e) return;
    this.limitData[index].value = Number(Number(e).toFixed(0));
  }
  submit() {
    this.submitLoading = true;
    const dailyLimit = this.limitData[0];
    const weeklyLimit = this.limitData[1];
    const monthlyLimit = this.limitData[2];
    this.ResponsibleApi.postModifyDepositLimit(dailyLimit.value, weeklyLimit.value, monthlyLimit.value)
      .pipe(finalize(() => {}))
      .subscribe(res => {
        this.submitLoading = false;
        this.limitData.forEach(e => {
          e.tip24 = false;
        });
        const { success, data } = res;
        if (success) {
          this.toast.show({ message: this.localService.getValue('op_s'), type: 'success' });
          this.setDaiyLimit(data);
        } else {
          this.toast.show({ message: res.message, type: 'fail' });
        }
      });
  }
}
