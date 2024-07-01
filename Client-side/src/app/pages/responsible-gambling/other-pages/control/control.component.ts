import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavList } from 'src/app/shared/interfaces/responsible-gambling.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@UntilDestroy()
@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent implements OnInit {
  constructor(private layout: LayoutService, private localeService: LocaleService) {}
  isH5!: boolean;
  navList: NavList[] = [
    {
      name: this.localeService.getValue('respon_j'),
      url: 'limit',
      pageTitle: this.localeService.getValue('respon_j'),
      pageSmallTitle: this.localeService.getValue('respon_k'),
    },
    {
      name: this.localeService.getValue('respon_l'),
      url: 'contral-faq',
      pageTitle: this.localeService.getValue('respon_l'),
      pageSmallTitle: this.localeService.getValue('respon_m'),
    },
    {
      name: this.localeService.getValue('respon_n'),
      url: 'calculator',
      pageTitle: this.localeService.getValue('respon_n'),
      pageSmallTitle: this.localeService.getValue('respon_o'),
    },
    {
      name: this.localeService.getValue('respon_p'),
      url: 'activity',
      pageTitle: this.localeService.getValue('respon_p'),
      pageSmallTitle: this.localeService.getValue('respon_q'),
    },
    {
      name: this.localeService.getValue('respon_r'),
      url: 'stop',
      pageTitle: this.localeService.getValue('respon_r'),
      pageSmallTitle: this.localeService.getValue('respon_s'),
    },
    {
      name: this.localeService.getValue('respon_t'),
      url: 'prohibit-self',
      pageTitle: this.localeService.getValue('respon_t'),
      pageSmallTitle: this.localeService.getValue('respon_u'),
    },
    {
      name: this.localeService.getValue('respon_v'),
      url: 'block',
      pageTitle: this.localeService.getValue('respon_v'),
      pageSmallTitle: this.localeService.getValue('respon_w'),
    },
  ];
  imgSrc!: string;
  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => {
      this.isH5 = v;
      this.isH5
        ? (this.imgSrc = 'assets/images/responsible-gambling/control/h5-banner.jpg')
        : (this.imgSrc = 'assets/images/responsible-gambling/control/banner.jpg');
    });
  }
}
