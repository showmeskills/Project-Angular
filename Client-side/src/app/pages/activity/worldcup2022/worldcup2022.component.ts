import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-worldcup2022',
  templateUrl: './worldcup2022.component.html',
  styleUrls: ['./worldcup2022.component.scss'],
})
export class Worldcup2022Component implements OnInit {
  constructor(
    private appService: AppService,
    private dataCollectionService: DataCollectionService,
    private localeService: LocaleService
  ) {}

  get isZH() {
    return this.appService.languageCode === 'zh-cn';
  }

  mainTab: number = 0;

  index: ('a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h')[] = ['a', 'a'];

  rankData: any;

  final4: any;

  get curRankData() {
    return this.rankData[this.index[1]];
  }

  get obLink() {
    return '/' + this.appService.languageCode + '/play/OBSport-1';
  }

  clickBet() {
    this.dataCollectionService.addPoint({ eventId: 30026 });
  }

  ngOnInit() {
    this.dataCollectionService.addPoint({ eventId: 30025 });
    this.rankData = JSON.parse(this.localeService.getValue('wcup2022_rank'));
    this.final4 = JSON.parse(this.localeService.getValue('wcup2022_final4'));
  }
}
