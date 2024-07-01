import { Injectable } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Injectable({
  providedIn: 'root',
})
export class ExchangeUtils {
  constructor(private localeService: LocaleService) {}
  public NOTICE_INFOR_CONFIG: any = [
    [
      {
        title: '1. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '2. ' + this.localeService.getValue('condit01') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '3. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '4. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '5. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
    ],
    [
      {
        title: '6. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '7. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '8. ' + this.localeService.getValue('condit02') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '9. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
      {
        title: '10. ' + this.localeService.getValue('condit00') + '?',
        details: this.localeService.getValue('condit_p00'),
        isExpanded: false,
      },
    ],
  ];
}
