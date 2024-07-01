import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CacheService } from '../../services/cache.service';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'orignal-hotkey',
  templateUrl: './hotkey.component.html',
  styleUrls: ['./hotkey.component.scss'],
})
export class HotkeyComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<HotkeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private el: ElementRef,
    private cacheService: CacheService,
    private localService: LocaleService
  ) {}

  /** 热键按钮列表及对应描述 */
  keyboardList = [
    { name: 'A', value: this.localService.getValue('hotkey_a') },
    { name: 'S', value: this.localService.getValue('hotkey_s') },
    { name: 'D', value: this.localService.getValue('hotkey_d') },
    { name: 'Q', value: this.localService.getValue('hotkey_q') },
    { name: 'W', value: this.localService.getValue('hotkey_w') },
    { name: 'E', value: this.localService.getValue('hotkey_e') },
    { name: 'SPACE', value: this.localService.getValue('hotkey_space') },
  ];

  // 是否开启热键
  isOpen: boolean = false;

  ngOnInit() {
    console.log(this.data);
    // 获取缓存的热键开启状态并赋值
    if (this.data == 'crash' || this.data == 'limbo' || this.data == 'slide' || this.data == 'csgo') {
      this.keyboardList = this.keyboardList.filter((e: any) => {
        if (e.name == 'W') {
          e.value = this.localService.getValue('multiplier_reduction');
        }
        if (e.name == 'Q') {
          e.value = this.localService.getValue('multiplier_up');
        }
        console.log(this.data);

        return e.name != 'E';
      });
    }
    if (this.data == 'mines' || this.data == 'stairs') {
      this.keyboardList = this.keyboardList.map((e: any) => {
        if (e.name == 'W' && this.data == 'mines') {
          e.value = this.localService.getValue('reduce_bomb');
        }
        if (e.name == 'Q') {
          e.value = this.localService.getValue('auto_select');
        }
        if (e.name == 'E' && this.data == 'mines') {
          e.value = this.localService.getValue('increase_bomb');
        }
        if (e.name == 'W' && this.data == 'stairs') {
          e.value = this.localService.getValue('reduce_stone');
        }
        if (e.name == 'E' && this.data == 'stairs') {
          e.value = this.localService.getValue('increase_stone');
        }
        if (e.name == 'SPACE') {
          e.value = this.localService.getValue('bet/cash_out');
        }
        return e;
      });
    }
    if (this.data == 'hilo') {
      this.keyboardList = this.keyboardList.map((e: any) => {
        if (e.name == 'W') {
          e.value = this.localService.getValue('pick_lower');
        }
        if (e.name == 'Q') {
          e.value = this.localService.getValue('pick_higher');
        }
        if (e.name == 'E') {
          e.value = this.localService.getValue('skip');
        }
        if (e.name == 'SPACE') {
          e.value = this.localService.getValue('bet_cashout');
        }
        return e;
      });
    }

    if (this.data == 'plinko') {
      this.keyboardList = this.keyboardList.filter((e: any) => {
        return e.name != 'Q' && e.name != 'W' && e.name != 'E';
      });
    }
    if (this.data == 'circle') {
      this.keyboardList = [
        { name: '1', value: this.localService.getValue('hotkey_selector') + 1 },
        { name: 'A', value: this.localService.getValue('hotkey_a') },
        { name: '2', value: this.localService.getValue('hotkey_selector') + 2 },
        { name: 'S', value: this.localService.getValue('hotkey_s') },
        { name: '3', value: this.localService.getValue('hotkey_selector') + 3 },
        { name: 'D', value: this.localService.getValue('hotkey_d') },
        { name: '4', value: this.localService.getValue('hotkey_selector') + 4 },
        { name: 'SPACE', value: this.localService.getValue('hotkey_space') },
      ];
    }
    if (this.data == 'wheel' || this.data == 'cryptos') {
      this.keyboardList = this.keyboardList.filter((e: any) => {
        return e.name != 'Q' && e.name != 'W' && e.name != 'E';
      });
    }
    if (this.data == 'tower') {
      this.keyboardList = this.keyboardList.map((e: any) => {
        if (e.name == 'W') {
          e.value = this.localService.getValue('reduce_genie');
        }
        if (e.name == 'Q') {
          e.value = this.localService.getValue('auto_select');
        }
        if (e.name == 'E') {
          e.value = this.localService.getValue('increase_genie');
        }
        if (e.name == 'SPACE') {
          e.value = this.localService.getValue('bet/cash_out');
        }
        return e;
      });
    }
    if (this.data == 'spaceDice') {
      this.keyboardList = [
        { name: 'A', value: this.localService.getValue('hotkey_a') },
        { name: 'S', value: this.localService.getValue('hotkey_s') },
        { name: 'D', value: this.localService.getValue('hotkey_d') },
        { name: 'Q', value: this.localService.getValue('change_q') },
        { name: 'W', value: this.localService.getValue('dec_w') },
        { name: 'E', value: this.localService.getValue('inc_e') },
        { name: 'Z ', value: this.localService.getValue('auto_z') },
        { name: 'SPACE', value: this.localService.getValue('hotkey_space') },
      ];
    }
    this.isOpen = this.cacheService.hotkey;
    this.dialogRef.beforeClosed().subscribe(() => {
      this.cacheService.hotkey = this.isOpen;
    });
    if (this.data == 'blackjack') {
      this.keyboardList = [
        { name: 'A', value: this.localService.getValue('hotkey_a') },
        { name: 'S', value: this.localService.getValue('hotkey_s') },
        { name: 'D', value: this.localService.getValue('hotkey_d') },
        { name: 'Q', value: this.localService.getValue('hit') },
        { name: 'W', value: this.localService.getValue('stand') },
        { name: 'E', value: this.localService.getValue('bet/cash_out') },
        { name: 'SPACE', value: this.localService.getValue('hotkey_space') },
        { name: 'R', value: this.localService.getValue('dou') },
      ];
    }
    if (this.data == 'coinflip') {
      this.keyboardList = [
        { name: 'A', value: this.localService.getValue('hotkey_a') },
        { name: 'S', value: this.localService.getValue('hotkey_s') },
        { name: 'D', value: this.localService.getValue('hotkey_d') },
        { name: 'Q', value: this.localService.getValue('hotkey_head') },
        { name: 'W', value: this.localService.getValue('hotkey_tail') },
        { name: 'SPACE', value: this.localService.getValue('hotkey_space') },
      ];
    }
  }

  /**
   * 关闭弹窗
   */
  close() {
    this.dialogRef.close();
  }

  toggleChange(event: any) {
    console.log(event.checked);
    this.isOpen = event.checked;

    this.cacheService.hotkey = event.checked;
  }
}
