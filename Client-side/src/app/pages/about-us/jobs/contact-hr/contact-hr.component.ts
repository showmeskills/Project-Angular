import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-contact-hr',
  templateUrl: './contact-hr.component.html',
  styleUrls: ['./contact-hr.component.scss'],
})
export class ContactHrComponent implements OnInit {
  isH5!: boolean;
  constructor(
    private toast: ToastService,
    private generalService: GeneralService,
    private layout: LayoutService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }
}
