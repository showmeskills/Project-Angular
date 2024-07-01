import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@UntilDestroy()
@Component({
  selector: 'app-control-faq',
  templateUrl: './control-faq.component.html',
  styleUrls: ['./control-faq.component.scss'],
})
export class ControlFaqComponent implements OnInit {
  constructor(private layout: LayoutService, private localeSerivce: LocaleService) {}

  isH5!: boolean;

  contentArr: any = [
    this.localeSerivce.getValue('res_ab'),
    this.localeSerivce.getValue('res_ac'),
    this.localeSerivce.getValue('res_ad'),
    this.localeSerivce.getValue('res_ae'),
    this.localeSerivce.getValue('res_af'),
    this.localeSerivce.getValue('res_ag'),
    this.localeSerivce.getValue('res_ah'),
    this.localeSerivce.getValue('res_ai'),
  ];
  textOne: string = this.localeSerivce.getValue('res_aj');

  footerText: string = this.localeSerivce.getValue('res_ak');

  footerTextTwo: string = this.localeSerivce.getValue('contract_us');

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }
}
