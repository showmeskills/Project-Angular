import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@Component({
  selector: 'app-euro2024',
  templateUrl: './euro2024.component.html',
  styleUrls: ['./euro2024.component.scss'],
})
export class Euro2024Component implements OnInit {
  constructor(
    public appService: AppService,
    private dataCollectionService: DataCollectionService,
    private localeService: LocaleService,
  ) {}

  get isZH() {
    return this.appService.languageCode === 'zh-cn';
  }

  groups = [
    {
      idx: 'a',
      tt: '小组 A',
      entt: 'Group A',
      list: [
        { name: '德国', enName: 'Germany' },
        { name: '苏格兰', enName: 'Scotland' },
        { name: '匈牙利', enName: 'Hungary' },
        { name: '瑞士', enName: 'Switzerland' },
      ],
    },
    {
      idx: 'b',
      tt: '小组 B',
      entt: 'Group B',
      list: [
        { name: '西班牙', enName: 'Spain' },
        { name: '克罗地亚', enName: 'Croatia' },
        { name: '意大利', enName: 'Italy' },
        { name: '阿尔巴尼亚', enName: 'Albania' },
      ],
    },
    {
      idx: 'c',
      tt: '小组 C',
      entt: 'Group C',
      list: [
        { name: '斯洛维尼亚', enName: 'Slovenia' },
        { name: '塞尔维亚', enName: 'Serbia' },
        { name: '丹麦', enName: 'Denmark' },
        { name: '英格兰', enName: 'England' },
      ],
    },
    {
      idx: 'd',
      tt: '小组 D',
      entt: 'Group D',
      list: [
        { name: '波兰', enName: 'Poland' },
        { name: '荷兰', enName: 'Netherlands' },
        { name: '奥地利', enName: 'Austria' },
        { name: '法国', enName: 'France' },
      ],
    },
    {
      idx: 'e',
      tt: '小组 E',
      entt: 'Group E',
      list: [
        { name: '比利时', enName: 'Belgium' },
        { name: '斯洛伐克', enName: 'Slovakia' },
        { name: '罗马尼亚', enName: 'Romania' },
        { name: '乌克兰', enName: 'Ukraine' },
      ],
    },
    {
      idx: 'f',
      tt: '小组 F',
      entt: 'Group F',
      list: [
        { name: '土耳其', enName: 'Turkiye' },
        { name: '葡萄牙', enName: 'Portugal' },
        { name: '乔治亚', enName: 'Georgia' },
        { name: '捷克', enName: 'Czechia' },
      ],
    },
  ];
  matchSchedule = {};

  mainTab: string = 'a';

  get obLink() {
    return '/' + this.appService.languageCode + '/play/OBSport-1';
  }

  clickBet() {
    this.dataCollectionService.addPoint({ eventId: 30026 });
  }

  ngOnInit() {
    this.matchSchedule = JSON.parse(this.appService.tenantConfig.config.euro2024_match_schedule || '{}');
  }
}
