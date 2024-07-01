import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { OrignalService } from 'src/app/orignal/orignal.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { BetService } from '../../services/bet.service';
import { CacheService } from '../../services/cache.service';
import { IconService } from '../../services/icon.service';
import { LocaleService } from '../../services/locale.service';
import { FairnessComponent } from '../fairness/fairness.component';
import { HotkeyComponent } from '../hotkey/hotkey.component';
import { RulesComponent } from '../rules/rules.component';
@UntilDestroy()
@Component({
  selector: 'orignal-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss'],
})
export class BarComponent implements OnInit {
  /** 声音是否开启 */
  isSoundOpen!: boolean;
  /** 是否 */
  @Input() isTrend: boolean = true;
  /** 是否 */
  @Input() isOverlapp: boolean = true;
  /** 是否有快速投注 */
  @Input() isFast: boolean = true;
  /** 是否开启快速投注 */
  @Input() isFastBet!: boolean;
  @Output() isFastBetChange = new EventEmitter();
  /** 是否开启热键 */
  @Input() isHotkey!: boolean;
  @Output() isHotkeyChange = new EventEmitter();
  /** 公平性弹窗参数 */
  @Input() fairnessData: any;
  @Output() fairnessDataChange = new EventEmitter();

  /** 点击公平事件 */
  isFairness: boolean = false;
  /** 点击规则事件 */
  isRules: boolean = false;
  /** 点击统计事件 */
  isPanel: boolean = false;
  /** 是否开启动画 */
  @Input() isAnimation!: boolean;
  @Output() isAnimationChange = new EventEmitter();

  /** 游戏类型参数 */
  @Input() type: any;
  /** 手动与自动状态 */
  active: boolean = false;
  constructor(
    private orignalService: OrignalService,
    private cacheService: CacheService,
    private dialog: MatDialog,
    private layout: LayoutService,
    private toast: ToastService,
    private localeService: LocaleService,
    private location: Location,
    private iconService: IconService,
    private appService: AppService,
    private nativeAppService: NativeAppService,
    private betService: BetService,
  ) {}

  /** 是否为H5模式 */
  isH5!: boolean;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // console.log(this.isFast);
    // 获取缓存的声音开启状态并赋值
    this.isSoundOpen = this.cacheService.voice;
    // 获取缓存的快速投注开启状态并赋值
    this.isFastBet = this.cacheService.fastBet;
    this.isFastBetChange.emit(this.isFastBet);
    // 获取缓存的热键开启状态并赋值
    this.isHotkey = this.cacheService.hotkey;
    this.isHotkeyChange.emit(this.isHotkey);
    // 获取缓存的动画开关开启状态并赋值
    this.isAnimation = this.cacheService.animation;

    this.betService.atuoActive$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe((active: boolean) => {
      this.active = active;
      if (this.type == 'tower') {
        this.isFastBet = this.active;
        this.cacheService.fastBet = this.active;
        this.isFastBetChange.emit(this.isFastBet);
      }
    });
    this.orignalService.statisticsPanelState$.subscribe((active: boolean) => {
      this.isPanel = active;
    });
  }

  /** 规则限额弹窗 */
  showRules() {
    this.isRules = !this.isRules;
    let panelCss = 'no-border-radius';
    if (document.body.offsetWidth <= 767) {
      panelCss = 'small-padding-dialog-container';
    }
    const dialogRef = this.dialog.open(RulesComponent, {
      panelClass: panelCss,
      data: this.type,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isRules = false;
    });
  }

  /** 热键弹窗 */
  showHotkey() {
    let panelCss = 'no-border-radius';
    if (document.body.offsetWidth <= 767) {
      panelCss = 'small-padding-dialog-container';
    }
    const dialogRef = this.dialog.open(HotkeyComponent, {
      panelClass: panelCss,
      data: this.type,
    });
    dialogRef.afterClosed().subscribe(() => {
      // 获取缓存的热键开启状态并赋值
      console.log(this.cacheService.hotkey);
      this.isHotkey = this.cacheService.hotkey;
      this.isHotkeyChange.emit(this.isHotkey);
    });
  }

  /** 公平性页面弹窗 */
  showFairness() {
    if (!this.orignalService.orignalLoginReady$.value) {
      this.orignalService.jumpToLogin();
      return;
    }

    this.isFairness = !this.isFairness;
    let panelCss = 'no-border-radius';
    if (document.body.offsetWidth <= 767) {
      panelCss = 'small-padding-dialog-container';
    }
    const dialogRef = this.dialog.open(FairnessComponent, {
      panelClass: panelCss,
      data: {
        ...this.fairnessData,
        type: this.type,
      },
    });
    dialogRef.afterClosed().subscribe(value => {
      console.log(value);
      if (this.type != 'crash') {
        this.fairnessData = value;
        this.fairnessDataChange.emit(value);
      }
      this.isFairness = false;
    });
  }

  /**
   * 设置音效开关和快速投注的值
   *
   * @param type
   */
  setIcon(type: number) {
    switch (type) {
      case 0:
        this.isSoundOpen = !this.isSoundOpen;
        this.cacheService.voice = this.isSoundOpen;
        if (!this.isSoundOpen) {
          switch (this.type) {
            case 'wheel':
              this.iconService.wheelBGAudioStop();
              break;
            case 'limbo':
              this.iconService.limboBGAudioStop();
              break;
            case 'tower':
              this.iconService.towerBGAudioStop();
              break;
            case 'spaceDice':
              console.log(11111111);
              this.iconService.spacediceBGAudioStop();
              break;
            case 'coinflip':
              this.iconService.coinflipBGAudioStop();
              break;
            case 'csgo':
              this.iconService.csgoBGAudioStop();
              break;
            default:
              break;
          }
        } else {
          switch (this.type) {
            case 'wheel':
              this.iconService.wheelBGAudioPlay();
              break;
            case 'limbo':
              this.iconService.limboBGAudioPlay();
              break;
            case 'tower':
              this.iconService.towerBGAudioPlay();
              break;
            case 'spaceDice':
              this.iconService.spacediceBGAudioPlay();
              break;
            case 'coinflip':
              this.iconService.coinflipBGAudioPlay();
              break;
            case 'csgo':
              this.iconService.csgoBGAudioPlay();
              break;
            default:
              break;
          }
        }
        break;
      case 1:
        if (!this.active && this.type == 'tower') {
          this.toast.show({ message: this.localeService.getValue('isfast_waiting_original'), type: 'fail', title: '' });
          return;
        }
        this.isFastBet = !this.isFastBet;
        this.cacheService.fastBet = this.isFastBet;
        this.isFastBetChange.emit(this.isFastBet);
        break;
      case 2:
        this.isAnimation = !this.isAnimation;
        this.cacheService.animation = this.isAnimation;
        this.isAnimationChange.emit(this.isAnimation);
        break;

      case 3:
        // this.toast.show({ message: this.localeService.getValue('waiting_original'), type: 'fail', title: '' });
        this.orignalService.statisticsPanelState$.next(!this.orignalService.statisticsPanelState$.value);
        break;
      default:
        break;
    }
  }

  backPage() {
    console.log('----1点击返回-----');
    if (this.appService.isNativeApp) {
      console.log('----2进入isNativeApp判断-----', this.appService.isNativeApp);
      this.nativeAppService.onNativeBack();
    } else {
      this.location.back();
    }
  }
}
