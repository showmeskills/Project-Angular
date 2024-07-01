import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  isH5!: boolean;

  constructor(public appService: AppService, private layout: LayoutService, private localeService: LocaleService) {}

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  btns: any[] = [
    {
      title: this.localeService.getValue('sen_ce'),
      desc: this.localeService.getValue('sen_cf'),
      icon: 'btn-1',
      value: 'Localization',
    },
    {
      title: this.localeService.getValue('sen_cg'),
      desc: this.localeService.getValue('sen_ch'),
      icon: 'btn-2',
      value: 'ProductSuggest',
    },
    {
      title: this.localeService.getValue('sen_ci'),
      desc: this.localeService.getValue('sen_cj'),
      icon: 'btn-3',
      value: 'Security',
    },
    {
      title: this.localeService.getValue('sen_ck'),
      desc: this.localeService.getValue('sen_cl'),
      icon: 'btn-4',
      value: 'Design',
    },
  ];
}
