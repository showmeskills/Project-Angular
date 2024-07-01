import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@UntilDestroy()
@Component({
  selector: 'app-control-block',
  templateUrl: './control-block.component.html',
  styleUrls: ['./control-block.component.scss'],
})
export class ControlBlockComponent implements OnInit {
  constructor(private layout: LayoutService, private localeService: LocaleService) {}

  isH5!: boolean;

  textFooter: string = this.localeService.getValue('respon_qw');

  textFooterTwo: string = this.localeService.getValue('respon_qx');

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }
}
