import { Component, OnInit } from '@angular/core';
import { BetFreeJackpotService } from '../bet-free-jackpot.service';

@Component({
  selector: 'app-bet-free-jackpot-home',
  templateUrl: './bet-free-jackpot-home.component.html',
  styleUrls: ['./bet-free-jackpot-home.component.scss'],
})
export class BetFreeJackpotHomeComponent implements OnInit {
  constructor(private betFreeJackpotService: BetFreeJackpotService) {}

  get betFreeData() {
    return this.betFreeJackpotService.betFreeData;
  }

  get infoList() {
    return this.betFreeJackpotService.infoList;
  }

  ngOnInit() {}
}
