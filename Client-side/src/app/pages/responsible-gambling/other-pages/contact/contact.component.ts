import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ResponsibleGamblingService } from './../../responsible-gambling.service';

interface List {
  title: string;
  info: string;
  iconUrl: string;
}

@UntilDestroy()
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private localeService: LocaleService,
    private responsibleGamblingService: ResponsibleGamblingService
  ) {}
  isH5!: boolean;

  title: string = this.localeService.getValue('contract_us');
  smallTitle: string = this.localeService.getValue('respon_ae');
  imgSrc!: string;

  list: List[] = [
    {
      title: this.localeService.getValue('respon_ca'),
      info: this.localeService.getValue('respon_cb'),
      iconUrl: 'assets/images/responsible-gambling/contact/contact-service.svg',
    },
    {
      title: this.localeService.getValue('respon_cd'),
      info: this.localeService.getValue('respon_ce'),
      iconUrl: 'assets/images/responsible-gambling/contact/contact-email.svg',
    },
  ];

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => {
      this.isH5 = v;
      this.isH5
        ? (this.imgSrc = 'assets/images/responsible-gambling/control/h5-banner.jpg')
        : (this.imgSrc = 'assets/images/responsible-gambling/control/banner.jpg');
    });
  }

  commingSoon() {
    this.responsibleGamblingService.commingSoon();
  }
}
