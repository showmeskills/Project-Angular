import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LocaleService } from 'src/app/orignal/shared/services/locale.service';
import { ImgCarouselComponent } from 'src/app/shared/components/img-carousel/img-carousel.component';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { DiceApi } from '../../apis/dice.api';
import { BetService } from '../../services/bet.service';

@UntilDestroy()
@Component({
  selector: 'orignal-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent implements OnInit {
  /** 头部切换选项 */
  list = [this.localeService.getValue('rule'), this.localeService.getValue('limit')];
  /** 头部切换选项选中index */
  active = 0;
  languageCode = this.appService.languageCode;
  @ViewChild('swiper') swiper!: ImgCarouselComponent;
  selectedGrade: any = 1;
  theme: string = '';
  gradeList: any = [
    { id: 1, grade: '等级1' },
    { id: 2, grade: '等级2' },
    { id: 3, grade: '等级3' },
    { id: 4, grade: '等级4' },
    { id: 5, grade: '等级5' },
  ];
  limitList: any = [];
  isH5!: boolean;
  svgs: any = [];
  /** swiper选中index */
  tabIndex = 0;
  constructor(
    private dialogRef: MatDialogRef<RulesComponent>,
    private localeService: LocaleService,
    private appService: AppService,
    private layout: LayoutService,
    @Inject(MAT_DIALOG_DATA) public type: any,
    private diceApi: DiceApi,
    private betService: BetService
  ) {
    //主题色获取  hasLanguageCode 图片是否需要区分多语言
    this.appService.themeSwitch$.subscribe(v => {
      this.theme = v;
      console.log(this.type);
      switch (this.type) {
        case 'crash':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('rule_crash_des_1'),
            },
            {
              des: this.localeService.getValue('rule_crash_des_2'),
            },
          ];
          break;
        case 'dice':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('rule_des'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('rules_win_des'),
            },
          ];
          break;
        case 'mines':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('rule_mines_des_1'),
            },
            {
              des: this.localeService.getValue('rule_mines_des_2'),
            },
            {
              des: this.localeService.getValue('rule_mines_des_3'),
            },
            {
              des: this.localeService.getValue('rule_mines_des_4'),
            },
          ];
          break;
        case 'teemo':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('rule_teemo_des_1'),
            },
            {
              des: this.localeService.getValue('rule_teemo_des_2'),
            },
            {
              des: this.localeService.getValue('rule_teemo_des_3'),
            },
            {
              des: this.localeService.getValue('rule_teemo_des_4'),
            },
          ];
          break;
        case 'hilo':
          this.svgs = [
            {
              hasLanguageCode: true,
              // 猜下一张牌的等级会比前一张高还是低。
              des: this.localeService.getValue('hilo_rules2'),
            },
            {
              hasLanguageCode: true,
              // 打开无限张牌，对赔率进行总结。 你可以在任何时候停下来收集你的奖金。
              des: this.localeService.getValue('hilo_rules1'),
            },
          ];
          break;
        case 'plinko':
          this.svgs = [
            {
              hasLanguageCode: true,
              // 猜下一张牌的等级会比前一张高还是低。
              des: this.localeService.getValue('plinko_rules1'),
            },
            {
              hasLanguageCode: true,
              // 打开无限张牌，对赔率进行总结。 你可以在任何时候停下来收集你的奖金。
              des: this.localeService.getValue('plinko_rules2'),
            },
            {
              // 打开无限张牌，对赔率进行总结。 你可以在任何时候停下来收集你的奖金。
              des: this.localeService.getValue('plinko_rules3'),
            },
          ];
          break;
        case 'stairs':
          this.svgs = [
            {
              hasLanguageCode: true,
              // 猜下一张牌的等级会比前一张高还是低。
              des: this.localeService.getValue('stairs_rules1'),
            },
            {
              // 打开无限张牌，对赔率进行总结。 你可以在任何时候停下来收集你的奖金。
              des: this.localeService.getValue('stairs_rules2'),
            },
            {
              // 打开无限张牌，对赔率进行总结。 你可以在任何时候停下来收集你的奖金。
              des: this.localeService.getValue('stairs_rules3'),
            },
          ];
          break;
        case 'circle':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('circle_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('circle_rules2'),
            },
          ];
          break;
        case 'wheel':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('wheel_rules1'),
            },
            {
              des: this.localeService.getValue('wheel_rules2'),
            },
          ];
          break;
        case 'limbo':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('rule_crash_des_1'),
            },
            {
              des: this.localeService.getValue('rule_crash_des_3'),
            },
          ];
          break;
        case 'cryptos':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('cryptos_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('cryptos_rules2'),
            },
          ];
          break;
        case 'tower':
          this.svgs = [
            {
              hasLanguageCode: true,

              des: this.localeService.getValue('tower_rules1'),
            },
            {
              isPng: true,
              des: this.localeService.getValue('tower_rules2'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('tower_rules3'),
            },
          ];
          break;
        case 'baccarat':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('baccarat_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('baccarat_rules2'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('baccarat_rules3'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('baccarat_rules4'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('baccarat_rules5'),
            },
          ];
          break;
        case 'spaceDice':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('spacedice_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('spacedice_rules2'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('spacedice_rules3'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('spacedice_rules4'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('spacedice_rules5'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('spacedice_rules6'),
            },
          ];
          break;
        case 'blackjack':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules2'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules3'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules4'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules5'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules6'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('blackjack_rules7'),
            },
          ];
          break;
        case 'coinflip':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('coinflip_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('coinflip_rules2'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('coinflip_rules3'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('coinflip_rules4'),
            },
          ];
          break;
        case 'slide':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('slide_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('slide_rules2'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('slide_rules3'),
            },
          ];
          break;
        case 'csgo':
          this.svgs = [
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('slide_rules1'),
            },
            {
              hasLanguageCode: true,
              des: this.localeService.getValue('slide_rules2'),
            },
            {
              des: this.localeService.getValue('slide_rules3'),
            },
          ];
          break;
        default:
          break;
      }
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
      if (this.type == 'crash' && e) {
        // crash单独H5图片
        this.svgs = [
          {
            hasLanguageCode: true,
            des: this.localeService.getValue('rule_crash_des_1'),
            isH5: true,
          },
          {
            des: this.localeService.getValue('rule_crash_des_2'),
            isH5: true,
          },
        ];
      }
    });
  }

  returnSrc(i: number, hasLanguageCode: boolean, isH5?: boolean, isPng?: boolean) {
    console.log(this.languageCode);
    return `/assets/orignal/images/${this.type}/rule/bet${i}${
      hasLanguageCode ? '-' + (['tr', 'pt-br'].includes(this.languageCode) ? 'en-us' : this.languageCode) : ''
    }-${this.theme}${isH5 ? '-h5' : ''}${isPng ? '.png' : '.svg'}`;
  }

  ngOnInit() {
    console.log(this.appService.languageCode);
    this.betService.limitList$.pipe(untilDestroyed(this)).subscribe(v => {
      this.limitList = v.map((cur: any) => {
        const data = this.appService.currencies$.value.find((t: any) => t.currency === cur.currency);
        return { ...data, ...cur };
      });
    });
  }

  /** 关闭弹窗 */
  close() {
    this.dialogRef.close();
  }

  /**
   * 切换头部tab
   *
   * @param i
   */
  changeTab(i: number) {
    this.active = i;
  }

  gradeChange(e: any) {}

  // swiper滑动事件
  slideChange = (index: number) => {
    this.tabIndex = index;
  };
}
