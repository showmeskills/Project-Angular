import { Component, OnInit } from '@angular/core';
import { ResponsibleGamblingService } from '../../../responsible-gambling.service';

@Component({
  selector: 'app-responsible-faq',
  templateUrl: './responsible-faq.component.html',
  styleUrls: ['./responsible-faq.component.scss'],
})
export class ResponsibleFaqComponent implements OnInit {
  constructor(private responsibleGamblingService: ResponsibleGamblingService) {}

  ngOnInit(): void {}

  commingSoon(e?: any) {
    this.responsibleGamblingService.commingSoon();
  }
}
