import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-control-limit',
  templateUrl: './control-limit.component.html',
  styleUrls: ['./control-limit.component.scss'],
})
export class ControlLimitComponent implements OnInit {
  constructor(private localeServive: LocaleService) {}

  contextArr: any = [
    {
      url: 'assets/images/responsible-gambling/control/limit/coin.svg',
      title: this.localeServive.getValue('resp_a'),
      context: [
        this.localeServive.getValue('resp_b'),
        this.localeServive.getValue('resp_c'),
        this.localeServive.getValue('resp_d'),
      ],
      btnText: this.localeServive.getValue('resp_e'),
    },
    {
      url: 'assets/images/responsible-gambling/control/limit/alarm.svg',
      title: this.localeServive.getValue('res_a'),
      context: [this.localeServive.getValue('res_b'), this.localeServive.getValue('res_c')],
      btnText: this.localeServive.getValue('res_d'),
    },
  ];

  ngOnInit(): void {}
}
