import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavList } from 'src/app/shared/interfaces/responsible-gambling.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-responsible',
  templateUrl: './responsible.component.html',
  styleUrls: ['./responsible.component.scss'],
})
export class ResponsibleComponent implements OnInit {
  constructor(private layout: LayoutService, private localeService: LocaleService) {}
  isH5!: boolean;
  navList: NavList[] = [
    {
      name: this.localeService.getValue('respon_c'),
      url: 'concept',
      pageTitle: this.localeService.getValue('respo_a'),
      pageSmallTitle: this.localeService.getValue('respon_d'),
    },
    {
      name: this.localeService.getValue('respo_b'),
      url: 'faq',
      pageTitle: this.localeService.getValue('respo_b'),
      pageSmallTitle: this.localeService.getValue('respon_e'),
    },
    {
      name: this.localeService.getValue('respon_f'),
      url: 'operation',
      pageTitle: this.localeService.getValue('respon_f'),
      pageSmallTitle: this.localeService.getValue('respon_g'),
    },
    {
      name: this.localeService.getValue('respon_h'),
      url: 'misunderstand',
      pageTitle: this.localeService.getValue('respon_h'),
      pageSmallTitle: this.localeService.getValue('respon_i'),
    },
  ];
  imgSrc!: string;
  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => {
      this.isH5 = v;
      this.isH5
        ? (this.imgSrc = 'assets/images/responsible-gambling/responsible/h5-banner.jpg')
        : (this.imgSrc = 'assets/images/responsible-gambling/responsible/banner.jpg');
    });
  }
}
