import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-feedback-top-title',
  templateUrl: './feedback-top-title.component.html',
  styleUrls: ['./feedback-top-title.component.scss'],
})
export class FeedbackTopTitleComponent implements OnInit {
  isH5!: boolean;

  constructor(
    private layout: LayoutService,
    public appService: AppService,
    private location: Location,
    private localeService: LocaleService
  ) {}

  @Input() title: string = '';
  @Input() desc: string = this.localeService.getValue('sen_ih');

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  back() {
    this.location.back();
  }
}
