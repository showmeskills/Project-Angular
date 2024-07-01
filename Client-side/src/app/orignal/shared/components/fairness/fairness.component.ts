import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HiloService } from 'src/app/orignal/pages/hilo/hilo.service';
import { BaccaratApi } from '../../apis/baccarat.api';
import { BlackjackApi } from '../../apis/blackjack.api';
import { CircleApi } from '../../apis/circle.api';
import { CoinflipApi } from '../../apis/coinflip.api';
import { CryptosApi } from '../../apis/cryptos.api';
import { DiceApi } from '../../apis/dice.api';
import { HiloApi } from '../../apis/hilo.api';
import { LimboApi } from '../../apis/limbo.api';
import { MinesApi } from '../../apis/mines.api';
import { PlinkoApi } from '../../apis/plinko.api';
import { SlideApi } from '../../apis/slide.api';
import { SpaceDiceApi } from '../../apis/space-dice.api';
import { StairsApi } from '../../apis/stairs.api';
import { TowerApi } from '../../apis/tower.api';
import { WheelApi } from '../../apis/wheel.api';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'lottery-fairness',
  templateUrl: './fairness.component.html',
  styleUrls: ['./fairness.component.scss'],
})
export class FairnessComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FairnessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private el: ElementRef,
    private diceApi: DiceApi,
    private minesApi: MinesApi,
    private hiloApi: HiloApi,
    private plinkoApi: PlinkoApi,
    private stairsApi: StairsApi,
    private circleApi: CircleApi,
    private wheelApi: WheelApi,
    private baccaratApi: BaccaratApi,
    private limboApi: LimboApi,
    private cryptosApi: CryptosApi,
    private towerApi: TowerApi,
    private spaceDiceApi: SpaceDiceApi,
    private blackjackApi: BlackjackApi,
    private coinflipApi: CoinflipApi,
    private slideApi: SlideApi,
    private router: Router,
    private localService: LocaleService,
    private hiloService: HiloService
  ) {}

  // 复制成功提示框
  isToastShow!: boolean;
  // 提示框定时器
  tipTimer: any;

  // 彩种列表
  lotteryList: any = [
    { SourceCode: 'DICE', Name: 'Dice', type: 'dice' },
    { SourceCode: 'CRASH', Name: 'Crash', type: 'crash' },
    { SourceCode: 'MINES', Name: 'Mines', type: 'mines' },
    { SourceCode: 'HILO', Name: 'Hilo', type: 'hilo' },
    { SourceCode: 'PLINKO', Name: 'Plinko', type: 'plinko' },
    { SourceCode: 'STAIRS', Name: 'Stairs', type: 'stairs' },
    { SourceCode: 'CIRCLE', Name: 'Circle', type: 'circle' },
    { SourceCode: 'WHEEL', Name: 'Wheel', type: 'wheel' },
    { SourceCode: 'LIMBO', Name: 'Limbo', type: 'limbo' },
    { SourceCode: 'CRYPTOS', Name: 'Cryptos', type: 'cryptos' },
    { SourceCode: 'TOWER', Name: 'Tower', type: 'tower' },
    { SourceCode: 'BACCARAT', Name: 'Baccarat', type: 'baccarat' },
    { SourceCode: 'SPACEDICE', Name: 'SpaceDice', type: 'spaceDice' },
    { SourceCode: 'BLACKJACK', Name: 'Blackjack', type: 'blackjack' },
    { SourceCode: 'COINFLIP', Name: 'Coinflip', type: 'coinflip' },
    { SourceCode: 'SLIDE', Name: 'Slide', type: 'slide' },
    { SourceCode: 'TEEMO', Name: 'Teemo', type: 'teemo' },
    { SourceCode: 'CSGO', Name: 'Csgo', type: 'csgo' },
  ];
  // 当前选中彩种sourceCode
  selectedLottery: any;
  // 当前彩种历史记录列表
  historyList: any = [];
  // 当前选中历史记录
  selectedHistory: any;

  // 获取当前历史记录对应的Api名称
  API: any;
  // 当前选中彩种是否为乐透（调用投注结果展示组件需要传该参数）
  isLotto!: boolean;
  // 当前路径名称（调用投注结果展示组件需要传该参数）
  currentPath: any = '';

  // 是否是即开彩
  isSpeed = false;
  //
  // nextSeed: string = '';

  valData: any = {};
  // valDataEMPT: any = {
  //   valNumberPublicKey: '',
  //   valNumberSecretKey: '',
  //   numberPublicKey: '',
  //   isCrash: false,
  //   resultTql: false,
  // };

  loading: boolean = true;

  // 计算结果
  result: any;
  // 开始计算按钮加载状态
  loader: boolean = false;
  // 循环时根据index获取对应大写的数字
  numbers = [
    this.localService.getValue('one'),
    this.localService.getValue('two'),
    this.localService.getValue('three'),
    this.localService.getValue('four'),
    this.localService.getValue('five'),
  ];

  // hilo卡牌
  cardData: any;
  // CRYPTOS 数字颜色
  coinColor: any = {
    '0': 'BTC',
    '1': 'ETH',
    '2': 'SOL',
    '3': 'BNB',
    '4': 'USDT',
    '5': 'DOG',
    '6': 'LTC',
    '7': 'XRP',
  };
  ngOnInit() {
    this.cardData = this.hiloService.CARD_DATA;
    this.selectedLottery = this.lotteryList.find((e: any) => e.type == this.data.type)?.SourceCode;
    // 默认值赋值
    this.valData.numberPublicKey = this.data?.numberPublicKey;
    this.valData.numberId = this.data?.numberId;
    this.getDiceHistory();
    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.valData);
    });
  }

  /**
   * 复制
   *
   * @param name
   */
  copyLink(name: string): void {
    const input = this.el.nativeElement.querySelector('#' + name);
    // console.log(input)
    // // 选中赋值过的input
    input.value = this.valData[name];
    input.select();
    document.execCommand('Copy');
    // this.lotteryService.showTipSubject.next(this.localeService.getValue(`lobby.record.details.5`));
    this.isToastShow = true;
    if (this.tipTimer) clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => {
      this.isToastShow = false;
    }, 2000);
  }

  numChange() {
    this.valData.valNumberPublicKey = this.returnKey('numberPublicKey');
    this.valData.valNumberSecretKey = this.returnKey('numberSecretKey');
    this.valData.resultTql = false;
  }
  /**
   * 选择彩种切换后获取对应的近50期历史记录
   */
  async getDiceHistory() {
    this.loading = true;
    // this.valData = { ...this.valDataEMPT };
    let res;
    // if (['CRASH'].includes(this.selectedLottery)) {
    //   res = await this.diceApi.getCrashRecord({
    //     current: 1,
    //     size: 50,
    //     sourceCode: this.selectedLottery,
    //   });
    // } else {
    if (this.selectedLottery == 'CIRCLE') {
      res = await this.circleApi.getRecord({
        state: 1,
        current: 1,
        size: 50,
        sourceCode: this.selectedLottery,
      });
    } else {
      res = await this.diceApi.getRecord({
        state: 1,
        current: 1,
        size: 50,
        sourceCode: this.selectedLottery,
      });
    }
    // }

    this.loading = false;
    this.historyList = res.data.records;
    if (res.data.records.length > 0) {
      this.selectedHistory = this.historyList && this.historyList[0].numberPublicKey;
      this.valData.valNumberPublicKey = this.returnKey('numberPublicKey');
      this.valData.valNumberSecretKey = this.returnKey('numberSecretKey');
      this.valData.resultTql = false;
    }
    if (this.selectedLottery == 'CRASH') {
      this.valData.isCrash = true;
    }
  }

  /**
   * 关闭弹窗
   */
  close() {
    this.dialogRef.close(this.valData);
  }

  /** 更换下次投注客户端种子 */
  async changeSeed() {
    this.loading = true;
    // let api: any;
    // switch (this.selectedLottery) {
    //   case 'DICE':
    //     api = this.diceApi;
    //     break;
    //   case 'MINES':
    //     api = this.minesApi;
    //     break;
    //   case 'HILO':
    //     api = this.hiloApi;
    //     break;
    //   case 'PLINKO':
    //     api = this.plinkoApi;
    //     break;
    //   case 'STAIRS':
    //     api = this.stairsApi;
    //     break;
    //   case 'CIRCLE':
    //     api = this.circleApi;
    //     break;
    //   case 'WHEEL':
    //     api = this.wheelApi;
    //     break;
    //   case 'LIMBO':
    //     api = this.limboApi;
    //     break;
    //   case 'CRYPTOS':
    //     api = this.cryptosApi;
    //     break;
    //   case 'TOWER':
    //     api = this.towerApi;
    //     break;
    //   case 'BACCARAT':
    //     api = this.baccaratApi;
    //     break;
    //   case 'SPACEDICE':
    //     api = this.spaceDiceApi;
    //     break;
    //   case 'BLACKJACK':
    //     api = this.blackjackApi;
    //     break;
    //   case 'COINFLIP':
    //     api = this.coinflipApi;
    //     break;
    //   case 'SLIDE':
    //     api = this.slideApi;
    //     break;
    //   default:
    //     break;
    // }
    const res = await this.diceApi.getNumberId(this.selectedLottery.toLowerCase());
    if (res) {
      this.data = res.data;
      this.valData.numberPublicKey = res.data.numberPublicKey;
    }
    this.loading = false;
  }

  /**
   * 返回当前选中历史开奖记录id返回对应的numberSecretKey：客户端种子 、numberPublicKey：服务端种子
   *
   * @param key
   */
  returnKey(key: string) {
    const data = this.historyList.find((cur: any) => {
      return cur.numberPublicKey == this.selectedHistory;
    });
    return data && data[key];
  }

  /**
   * 根据服务端和客户端种子进行结果计算
   */
  async compute() {
    console.log(this.valData.numberPublicKey);
    if (!this.selectedHistory) {
      return;
    }
    this.loader = true;
    this.loading = true;
    // let api: any;
    // switch (this.selectedLottery) {
    //   case 'HILO':
    //     api = this.hiloApi;
    //     break;
    //   case 'PLINKO':
    //     api = this.plinkoApi;
    //     break;
    //   case 'STAIRS':
    //     api = this.stairsApi;
    //     break;
    //   case 'CIRCLE':
    //     api = this.circleApi;
    //     break;
    //   case 'WHEEL':
    //     api = this.wheelApi;
    //     break;
    //   case 'LIMBO':
    //     api = this.limboApi;
    //     break;
    //   case 'CRYPTOS':
    //     api = this.cryptosApi;
    //     break;
    //   case 'TOWER':
    //     api = this.towerApi;
    //     break;
    //   case 'BACCARAT':
    //     api = this.baccaratApi;
    //     break;
    //   case 'SPACEDICE':
    //     api = this.spaceDiceApi;
    //     break;
    //   case 'MINES':
    //     api = this.minesApi;
    //     break;
    //   case 'BLACKJACK':
    //     api = this.blackjackApi;
    //     break;
    //   case 'COINFLIP':
    //     api = this.coinflipApi;
    //     break;
    //   case 'SLIDE':
    //     api = this.slideApi;
    //     break;
    //   default:
    //     api = this.diceApi;
    //     break;
    // }
    const res = await this.diceApi.checkData(
      {
        numberPublicKey: this.valData.valNumberPublicKey,
        numberSecretKey: this.valData.valNumberSecretKey,
      },
      this.selectedLottery.toLowerCase()
    );
    this.loading = false;
    if (res) {
      this.valData.resultTql = true;
      this.loader = false;
      if (res.data.multiplierList && this.selectedLottery != 'WHEEL') {
        res.data.multiplierList.sort((a: any, b: any) => a.index - b.index);
      }

      if (this.selectedLottery == 'STAIRS') {
        res.data.values.forEach((e: any, i: number) => {
          if (i == 2) {
            e = e.map((index: number) => {
              return index + 1;
            });
          }
          if (i == 7) {
            e = e.map((index: number) => {
              return index + 3;
            });
          }
        });
        res.data.values = JSON.stringify(res.data.values);
      }
      if (this.selectedLottery == 'TOWER') {
        res.data.values = JSON.stringify(res.data.values);
      }
      if (this.selectedLottery == 'BACCARAT' || this.selectedLottery == 'BLACKJACK') {
        res.data.values = res.data.values
          .split(',')
          .map((e: number) => e % 52)
          .join(',');
        res.data.bankerValue = res.data.bankerValue
          .split(',')
          .map((e: number) => e % 52)
          .join(',');
        if (this.selectedLottery == 'BLACKJACK') {
          res.data.playerValue = res.data.playerValue.map((j: any) => {
            return j
              .split(',')
              .map((e: number) => e % 52)
              .join(',');
          });
        } else {
          res.data.playerValue = res.data.playerValue
            .split(',')
            .map((e: number) => e % 52)
            .join(',');
        }
      }
      this.result = res.data;

      console.log(this.result);
    }
  }

  setnumberPub() {
    if (!this.valData.numberPublicKey) {
      this.valData.numberPublicKey = this.data.numberPublicKey;
    }
  }
  checkTo(event: any) {
    event.target.value = event.target.value.replace(/[^\w\.\/]/gi, '');
  }
}
