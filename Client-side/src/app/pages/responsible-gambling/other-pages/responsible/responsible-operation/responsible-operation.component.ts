import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ResponsibleGamblingService } from '../../../responsible-gambling.service';

@Component({
  selector: 'app-responsible-operation',
  templateUrl: './responsible-operation.component.html',
  styleUrls: ['./responsible-operation.component.scss'],
})
export class ResponsibleOperationComponent implements OnInit {
  constructor(private localeService: LocaleService, private responsibleGamblingService: ResponsibleGamblingService) {}
  contextArr: any[] = [
    {
      title: this.localeService.getValue('respon_dc'),
      iconImg: 'assets/images/responsible-gambling/operation/footerball.svg',
      text: [
        this.localeService.getValue('respon_dd'),
        this.localeService.getValue('respon_de'),
        this.localeService.getValue('respon_df'),
        this.localeService.getValue('respon_dg'),
        this.localeService.getValue('respon_dh'),
        this.localeService.getValue('respon_di'),
        this.localeService.getValue('respon_dj'),
        this.localeService.getValue('respon_dk'),
        this.localeService.getValue('respon_dl'),
        this.localeService.getValue('respon_dm'),
        this.localeService.getValue('respon_dn'),
      ],
    },
    {
      title: this.localeService.getValue('respon_do'),
      iconImg: 'assets/images/responsible-gambling/operation/porkermoney.svg',
      text: [
        this.localeService.getValue('respon_dp'),
        this.localeService.getValue('respon_dq'),
        this.localeService.getValue('respon_dr'),
        this.localeService.getValue('respon_ds'),
      ],
    },
    {
      title: this.localeService.getValue('respon_dt'),
      iconImg: 'assets/images/responsible-gambling/operation/twenty-one.svg',
      text: [
        this.localeService.getValue('respon_du'),
        this.localeService.getValue('respon_dv'),
        this.localeService.getValue('respon_dw'),
        this.localeService.getValue('respon_dx'),
        this.localeService.getValue('respon_dy'),
        this.localeService.getValue('respon_dz'),
        this.localeService.getValue('respon_ea'),
        this.localeService.getValue('respon_eb'),
        this.localeService.getValue('respon_ec'),
        this.localeService.getValue('respon_ed'),
      ],
    },
    {
      title: this.localeService.getValue('respon_ee'),
      iconImg: 'assets/images/responsible-gambling/operation/wheel.svg',
      text: [
        this.localeService.getValue('respon_ef'),
        this.localeService.getValue('respon_eg'),
        this.localeService.getValue('respon_eh'),
        this.localeService.getValue('respon_ei'),
        this.localeService.getValue('respon_ej'),
        this.localeService.getValue('respon_ek'),
      ],
    },
    {
      title: this.localeService.getValue('respon_en'),
      iconImg: 'assets/images/responsible-gambling/operation/poker.svg',
      text: [
        this.localeService.getValue('respon_eo'),
        this.localeService.getValue('respon_eq'),
        this.localeService.getValue('respon_er'),
        this.localeService.getValue('respon_es'),
        this.localeService.getValue('respon_et'),
      ],
    },
    {
      title: this.localeService.getValue('respon_el'),
      iconImg: 'assets/images/responsible-gambling/operation/baijiale.svg',
      text: [this.localeService.getValue('respon_em')],
    },
  ];

  ngOnInit(): void {}

  commingSoon(e?: any) {
    this.responsibleGamblingService.commingSoon();
  }
}
