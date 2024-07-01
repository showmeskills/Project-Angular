import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-currency-process',
  templateUrl: './currency-process.component.html',
  styleUrls: ['./currency-process.component.scss'],
})
export class CurrencyProcessComponent implements OnInit {
  constructor() {}

  /** image config */
  ticketsConfig = [
    {
      img: 'assets/images/wallet/300.svg',
      title: 'easy_use_player',
      value: 'date_of_t',
    },
    {
      img: 'assets/images/wallet/308.svg',
      title: 'offer_fiat',
      value: 'min_fee',
    },
    {
      img: 'assets/images/wallet/305.svg',
      title: 'support_curr',
      value: 'SP_Fiat_DET',
    },
  ];

  ngOnInit() {}
}
