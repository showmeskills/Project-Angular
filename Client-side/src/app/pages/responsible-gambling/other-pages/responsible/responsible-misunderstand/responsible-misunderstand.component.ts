import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@UntilDestroy()
@Component({
  selector: 'app-responsible-misunderstand',
  templateUrl: './responsible-misunderstand.component.html',
  styleUrls: ['./responsible-misunderstand.component.scss'],
})
export class ResponsibleMisunderstandComponent implements OnInit {
  constructor(private localeSerivce: LocaleService, private layout: LayoutService) {}
  isH5!: boolean;

  textOne: string = this.localeSerivce.getValue('respon_ta');

  textTwo: string = this.localeSerivce.getValue('respon_tb');

  textThree: string = this.localeSerivce.getValue('contract_us');

  contextArr: any[] = [
    {
      text: this.localeSerivce.getValue('respon_gd'),
      info: this.localeSerivce.getValue('respon_ge'),
    },
    {
      text: this.localeSerivce.getValue('respon_gf'),
      info: this.localeSerivce.getValue('respon_gg'),
    },
    {
      text: this.localeSerivce.getValue('respon_gh'),
      info: this.localeSerivce.getValue('respon_gi'),
    },
    {
      text: this.localeSerivce.getValue('respon_gj'),
      info: this.localeSerivce.getValue('respon_gk'),
    },
  ];

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }
}
