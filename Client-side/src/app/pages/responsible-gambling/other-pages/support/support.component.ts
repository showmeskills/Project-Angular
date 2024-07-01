import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavList } from 'src/app/shared/interfaces/responsible-gambling.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {
  constructor(private layout: LayoutService, private localeService: LocaleService) {}
  isH5!: boolean;
  navList: NavList[] = [
    {
      name: this.localeService.getValue('respon_x'),
      url: 'group',
      pageTitle: this.localeService.getValue('respon_x'),
      pageSmallTitle: this.localeService.getValue('respon_z'),
    },
    {
      name: this.localeService.getValue('respon_aa'),
      url: 'protect',
      pageTitle: this.localeService.getValue('respon_aa'),
      pageSmallTitle: this.localeService.getValue('respon_ab'),
    },
    {
      name: this.localeService.getValue('respon_ac'),
      url: 'help',
      pageTitle: this.localeService.getValue('respon_ac'),
      pageSmallTitle: this.localeService.getValue('respon_ad'),
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
