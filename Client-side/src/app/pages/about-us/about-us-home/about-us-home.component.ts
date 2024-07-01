import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-about-us-home',
  templateUrl: './about-us-home.component.html',
  styleUrls: ['./about-us-home.component.scss'],
})
export class AboutUsHomeComponent implements OnInit {
  footerList: any[] = [
    {
      text: this.localeService.getValue('list_a'),
      url: 'assets/images/about-us/media.svg',
      web: this.localeService.getValue('list_a_email'),
    },
    {
      text: this.localeService.getValue('list_b'),
      url: 'assets/images/about-us/business.png',
      web: this.localeService.getValue('list_b_email'),
    },
    {
      text: this.localeService.getValue('list_c'),
      url: 'assets/images/about-us/pay.svg',
      web: this.localeService.getValue('list_c_email'),
    },
    {
      text: this.localeService.getValue('list_d'),
      url: 'assets/images/about-us/agent.svg',
      web: this.localeService.getValue('list_d_email'),
    },
    {
      text: this.localeService.getValue('list_e'),
      url: 'assets/images/about-us/feedback.svg',
      web: this.localeService.getValue('list_e_email'),
    },
    {
      text: this.localeService.getValue('list_f'),
      url: 'assets/images/about-us/transaction.svg',
      web: this.localeService.getValue('list_f_email'),
    },
  ];
  constructor(private router: Router, private appService: AppService, private localeService: LocaleService) {}

  ngOnInit(): void {}

  jumpToPage(page: string) {
    this.router.navigateByUrl(`/${this.appService.languageCode}/` + page);
  }
}
