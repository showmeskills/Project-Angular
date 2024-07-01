import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-support-help',
  templateUrl: './support-help.component.html',
  styleUrls: ['./support-help.component.scss'],
})
export class SupportHelpComponent implements OnInit {
  constructor(private localeSerivce: LocaleService) {}

  contentArr: any = [
    this.localeSerivce.getValue('respon_pd'),
    this.localeSerivce.getValue('respon_pe'),
    this.localeSerivce.getValue('respon_pf'),
    this.localeSerivce.getValue('respon_pg'),
    this.localeSerivce.getValue('respon_ph'),
    this.localeSerivce.getValue('respon_pi'),
    this.localeSerivce.getValue('respon_pj'),
    this.localeSerivce.getValue('respon_pk'),
  ];

  footerText: string = this.localeSerivce.getValue('respon_pb');

  footerTextTwo: string = this.localeSerivce.getValue('respon_pc');

  ngOnInit(): void {}
}
