import { Injectable } from '@angular/core';
import { Howl } from 'howler';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class WheelMusicService {
  constructor(private localeStorage: LocalStorageService) {}

  private wheelAudio!: Howl;

  /** 初始化 */
  init(): void {
    if (!this.wheelAudio) {
      this.wheelAudio = new Howl({
        src: ['assets/images/activity/wheel/wheel.mp3'],
        loop: true,
        html5: true,
        preload: true,
      });
    }
  }

  /** 转盘音效 */
  playWheelAudio(): void {
    if (!this.localeStorage.wheelMusic) {
      this.wheelAudio.play();
    } else {
      this.wheelAudio.stop();
    }
  }

  /**关闭 */
  closeWheelAudio(): void {
    this.wheelAudio.stop();
  }
}
