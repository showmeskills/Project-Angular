import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ResponsibleGamblingService } from '../../../responsible-gambling.service';

@Component({
  selector: 'app-responsible-concept',
  templateUrl: './responsible-concept.component.html',
  styleUrls: ['./responsible-concept.component.scss'],
})
export class ResponsibleConceptComponent implements OnInit {
  constructor(private responsibleGamblingService: ResponsibleGamblingService, private localeService: LocaleService) {}

  textOne: string = this.localeService.getValue('respon_qb');
  textTwo: string = this.localeService.getValue('respon_qd');
  textThree: string = this.localeService.getValue('respon_qh');
  textFour: string = this.localeService.getValue('respon_qi');
  textFive: string = this.localeService.getValue('respon_qj');

  ngOnInit(): void {}

  commingSoon(e?: any) {
    this.responsibleGamblingService.commingSoon();
  }
}
