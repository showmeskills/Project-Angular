import { Injectable } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ResponsibleGamblingService {
  constructor(private toast: ToastService, private localeService: LocaleService) {}

  commingSoon() {
    // 换成敬请期待
    this.toast.show({
      message: `${this.localeService.getValue('comming')}, ${this.localeService.getValue('waiting')}`,
      title: this.localeService.getValue('hint'),
      type: 'fail',
    });
  }
}
