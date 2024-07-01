import { Injectable } from '@angular/core';
import { Howl } from 'howler';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  // 滑动条音效
  sliderAudio: any;
  // 点击投注音效
  betAudio: any;
  // 选择选项音效
  selectAudio: any;
  // 投注成功
  winAudio: any;
  // 投注失败
  loseAudio: any;
  // crash爆炸
  boomAudio: any;
  // 金额旁操作按钮声音
  balanceAudio: any;
  // 开出钻石音效
  diamondAudio: any;
  // 开出炸弹音效
  bombAudio: any;
  // mines胜利音效
  minesSuccessAudio: any;
  // 合并音效
  sound: any;
  type: string = '';
  // hilo翻牌
  hiloCardAudio: any;
  hiloWinAudio: any;
  hiloLoseAudio: any;
  hiloCardWinAudio: any;

  plinkoBottomAudio: any;
  plinkoCollisionAudio: any;
  // 欢呼
  stairsWinAudio: any;
  // 轮盘转动
  circleRotationAudio: any;
  // 倒计时
  circleCountAudio: any;
  // 结束
  circleResultAudio: any;

  // wheel背景
  wheelBGAudio: any;

  /** limbo背景 */
  limboBGAudio: any;
  /** limbo汽车 */
  limboCarAudio: any;

  /** cryptos普通翻牌 */
  cryptosFlopAudio: any;
  /** cryptos对子翻牌 */
  cryptosFlopTAudio: any;
  /** cryptos赢钱 */
  cryptosWinAudio: any;

  // tower背景
  towerBGAudio: any;
  // tower翻到恶魔
  towerLoseAudio: any;

  // baccarat音效
  baccaratStartAudio: any;
  baccaratChipsAudio: any;
  baccaratReceiveAudio: any;
  baccaratWinAudio: any;
  //spacedice音效
  spacediceWinAudio: any;
  spacedicetLossAudio: any;
  spacediceBGAudio: any;

  //coinflip音效
  coinflipWinAudio: any;
  coinfliptLossAudio: any;
  coinflipBGAudio: any;
  coinflipSoundAudio: any;
  // slide音效
  slideStartAudio: any;
  //csgo音效
  csgoBGAudio: any;
  constructor(private cacheService: CacheService) {}

  /**
   * 初始化
   *
   * @param type
   */
  init(type: string): void {
    switch (type) {
      case 'dice':
        this.sliderAudio = new Howl({
          src: ['assets/orignal/audio/SOUND.mp3'],
        });

        this.betAudio = new Howl({
          src: ['assets/orignal/audio/DICE.mp3'],
        });

        this.selectAudio = new Howl({
          src: ['assets/orignal/audio/CLICK.mp3'],
        });

        break;
      case 'crash':
        this.betAudio = new Howl({
          src: ['assets/orignal/audio/CRASH.mp3'],
        });
        this.boomAudio = new Howl({
          src: ['assets/orignal/audio/CRASHBOOM.mp3'],
        });
        break;
      case 'mines':
        this.selectAudio = new Howl({
          src: ['assets/orignal/audio/CLICK.mp3'],
        });
        this.diamondAudio = new Howl({
          src: ['assets/orignal/audio/MINESDIAMOND.mp3'],
        });
        this.bombAudio = new Howl({
          src: ['assets/orignal/audio/MINESBOMB.mp3'],
        });
        this.minesSuccessAudio = new Howl({
          src: ['assets/orignal/audio/MINESWIN.mp3'],
        });
        this.stairsWinAudio = new Howl({
          src: ['assets/orignal/audio/stairs_win.mp3'],
        });
        break;
      case 'hilo':
        this.selectAudio = new Howl({
          src: ['assets/orignal/audio/HILOCLIKE.mp3'],
        });
        this.hiloCardAudio = new Howl({
          src: ['assets/orignal/audio/HILOCARD.mp3'],
        });
        this.hiloWinAudio = new Howl({
          src: ['assets/orignal/audio/MINESWIN.mp3'],
        });
        this.hiloLoseAudio = new Howl({
          src: ['assets/orignal/audio/HILOLOSE.mp3'],
        });
        this.hiloCardWinAudio = new Howl({
          src: ['assets/orignal/audio/MINESDIAMOND.mp3'],
        });

        break;
      case 'plinko':
        this.plinkoBottomAudio = new Howl({
          src: ['assets/orignal/audio/movebottom.mp3'],
        });
        this.plinkoCollisionAudio = new Howl({
          src: ['assets/orignal/audio/collision.mp3'],
        });
        break;
      case 'circle':
        this.circleRotationAudio = new Howl({
          src: ['assets/orignal/audio/CIRCLE_ROTATION.mp3'],
        });
        this.circleCountAudio = new Howl({
          src: ['assets/orignal/audio/CIRCLE_COUNT.mp3'],
        });
        this.circleResultAudio = new Howl({
          src: ['assets/orignal/audio/CIRCLE_RESULT.mp3'],
        });
        break;
      case 'wheel':
        this.wheelBGAudio = new Howl({
          src: ['assets/orignal/audio/wheel_bg.mp3'],
          loop: true,
          volume: 0.5,
        });
        break;
      case 'limbo':
        this.limboBGAudio = new Howl({
          src: ['assets/orignal/audio/limbo_bg.mp3'],
          loop: true,
          volume: 0.3,
        });
        this.limboCarAudio = new Howl({
          src: ['assets/orignal/audio/limbo_car.mp3'],
        });
        break;
      case 'cryptos':
        this.cryptosFlopAudio = new Howl({
          src: ['assets/orignal/audio/flop.mp3'],
        });
        this.cryptosFlopTAudio = new Howl({
          src: ['assets/orignal/audio/flop1.mp3'],
        });
        this.cryptosWinAudio = new Howl({
          src: ['assets/orignal/audio/cryptos_win.mp3'],
        });
        break;
      case 'tower':
        this.selectAudio = new Howl({
          src: ['assets/orignal/audio/CLICK.mp3'],
        });
        this.diamondAudio = new Howl({
          src: ['assets/orignal/audio/MINESDIAMOND.mp3'],
        });
        this.towerLoseAudio = new Howl({
          src: ['assets/orignal/audio/tower_lose.mp3'],
        });
        this.minesSuccessAudio = new Howl({
          src: ['assets/orignal/audio/MINESWIN.mp3'],
        });
        this.towerBGAudio = new Howl({
          src: ['assets/orignal/audio/tower_bg.mp3'],
          loop: true,
          volume: 0.8,
        });
        break;
      case 'baccarat':
        this.baccaratStartAudio = new Howl({
          src: ['assets/orignal/audio/baccarat-start.mp3'],
        });
        this.baccaratChipsAudio = new Howl({
          src: ['assets/orignal/audio/baccarat-chips.mp3'],
        });
        this.baccaratReceiveAudio = new Howl({
          src: ['assets/orignal/audio/baccarat-receive.mp3'],
        });
        this.baccaratWinAudio = new Howl({
          src: ['assets/orignal/audio/baccarat-win.mp3'],
        });
        break;
      case 'spaceDice':
        this.spacediceWinAudio = new Howl({
          src: ['assets/orignal/audio/space_win.mp3'],
        });
        this.spacedicetLossAudio = new Howl({
          src: ['assets/orignal/audio/space_loss.mp3'],
        });
        this.spacediceBGAudio = new Howl({
          src: ['assets/orignal/audio/space_bg.mp3'],
          loop: true,
          volume: 0.8,
        });
        this.selectAudio = new Howl({
          src: ['assets/orignal/audio/CLICK.mp3'],
        });
        break;
      case 'coinflip':
        this.coinflipWinAudio = new Howl({
          src: ['assets/orignal/audio/coinflip_guess_f.mp3'],
        });
        this.coinfliptLossAudio = new Howl({
          src: ['assets/orignal/audio/coinflip_guess_t.mp3'],
        });
        this.coinflipBGAudio = new Howl({
          src: ['assets/orignal/audio/coinflip_bg.mp3'],
          loop: true,
          volume: 0.8,
        });
        this.coinflipSoundAudio = new Howl({
          src: ['assets/orignal/audio/coinflip_sound.mp3'],
        });
        this.minesSuccessAudio = new Howl({
          src: ['assets/orignal/audio/MINESWIN.mp3'],
        });
        break;
      case 'slide':
        this.slideStartAudio = new Howl({
          src: ['assets/orignal/audio/slide-start.mp3'],
        });
        break;
      case 'csgo':
        this.slideStartAudio = new Howl({
          src: ['assets/orignal/audio/slide-start.mp3'],
        });
        this.csgoBGAudio = new Howl({
          src: ['assets/orignal/audio/csgo_bg.mp3'],
          loop: true,
          volume: 0.15,
        });
        break;
      default:
        break;
    }

    // 共用部分
    this.winAudio = new Howl({
      src: ['assets/orignal/audio/WIN.mp3'],
    });
    this.loseAudio = new Howl({
      src: ['assets/orignal/audio/LOSE.mp3'],
    });
    this.balanceAudio = new Howl({
      src: ['assets/orignal/audio/CLICKM.mp3'],
    });
  }
  slideStartAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.slideStartAudio?.play();
  }
  sliderAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.selectAudio?.play();
  }

  selectAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.selectAudio?.play();
  }

  betAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.betAudio?.play();
  }

  winAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.winAudio?.play();
  }

  loseAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.loseAudio?.play();
  }

  boomAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.boomAudio?.play();
  }

  balanceAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.balanceAudio?.play();
  }

  bombAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.bombAudio?.play();
  }

  diamondAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.diamondAudio?.play();
  }

  minesSuccessAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.minesSuccessAudio?.play();
  }
  hiloCardAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.hiloCardAudio?.play();
  }
  hiloWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.hiloWinAudio?.play();
  }
  hiloLoseAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.hiloLoseAudio?.play();
  }
  hiloCardWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.hiloCardWinAudio?.play();
  }
  plinkoBottomAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.plinkoBottomAudio?.play();
  }
  plinkoCollisionAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.plinkoCollisionAudio?.play();
  }
  stairsWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.stairsWinAudio?.play();
  }
  circleRotationAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.circleRotationAudio?.play();
  }
  circleCountAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.circleCountAudio?.play();
  }
  circleResultAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.circleResultAudio?.play();
  }
  wheelBGAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.wheelBGAudio?.play();
  }
  wheelBGAudioStop() {
    this.wheelBGAudio?.stop();
  }

  limboBGAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.limboBGAudio?.play();
  }
  limboBGAudioStop() {
    this.limboBGAudio?.stop();
  }
  limboCarAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.limboCarAudio?.play();
  }
  cryptosFlopAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.cryptosFlopAudio?.play();
  }
  cryptosFlopTAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.cryptosFlopTAudio?.play();
  }
  cryptosWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.cryptosWinAudio?.play();
  }
  towerLoseAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.towerLoseAudio?.play();
  }
  towerBGAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.towerBGAudio?.play();
  }
  towerBGAudioStop() {
    this.towerBGAudio?.stop();
  }

  /**
   *   baccaratStart音效
   */
  baccaratStartAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.baccaratStartAudio?.play();
  }
  baccaratChipsAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.baccaratChipsAudio?.play();
  }
  baccaratReceiveAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.baccaratReceiveAudio?.play();
  }
  baccaratWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.baccaratWinAudio?.play();
  }
  /**
   *   spacedice音效
   */

  spacediceWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.spacediceWinAudio?.play();
  }
  spacediceLoseAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.spacedicetLossAudio?.play();
  }
  spacediceBGAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.spacediceBGAudio?.play();
  }
  spacediceBGAudioStop() {
    this.spacediceBGAudio?.stop();
  }

  /**
   *   coinflip音效
   */

  coinflipWinAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.coinflipWinAudio?.play();
  }
  coinfliptLossAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.coinfliptLossAudio?.play();
  }
  coinflipBGAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.coinflipBGAudio?.play();
  }
  coinflipBGAudioStop() {
    this.coinflipBGAudio?.stop();
  }
  coinflipSoundAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.coinflipSoundAudio?.play();
  }
  csgoBGAudioPlay() {
    if (!this.cacheService.voice) {
      return;
    }
    this.csgoBGAudio?.play();
  }
  csgoBGAudioStop() {
    this.csgoBGAudio?.stop();
  }
}
