import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-support-protect',
  templateUrl: './support-protect.component.html',
  styleUrls: ['./support-protect.component.scss'],
})
export class SupportProtectComponent implements OnInit {
  constructor(private localeService: LocaleService) {}

  textOne: string = this.localeService.getValue('respon_qs');

  textTwo: string = this.localeService.getValue('respon_qv');

  textFooter: string = this.localeService.getValue('respon_qw');

  textFooterTwo: string = this.localeService.getValue('respon_qx');

  ngOnInit(): void {}
}
