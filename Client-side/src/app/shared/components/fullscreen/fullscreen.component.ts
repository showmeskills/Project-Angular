import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent, merge, timer } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-fullscreen',
  templateUrl: './fullscreen.component.html',
  styleUrls: ['./fullscreen.component.scss'],
})
export class FullscreenComponent implements OnInit {
  constructor() {}

  /** 是否为体育 */
  @Input() sportsFullscreenMode: boolean = false;
  @Output() switchCurrency: EventEmitter<boolean> = new EventEmitter();

  /**要全屏的元素 */
  @Input() ref!: HTMLDivElement;

  /**点击关闭按钮 */
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();

  /** 监听全屏和退出 */
  @Output() listenFullScreen: EventEmitter<boolean> = new EventEmitter();

  /**当前是否全屏 */
  state!: boolean;

  /**激活状态（激活后才可点击） */
  active!: boolean;

  /**是否支持全屏 */
  ableFull!: boolean;

  ngOnInit() {
    this.ableFull = !!(
      document.fullscreenEnabled ||
      //@ts-ignore
      document.mozFullScreenEnabled ||
      //@ts-ignore
      document.webkitFullscreenEnabled ||
      //@ts-ignore
      document.msFullscreenEnabled
    );
    merge(
      fromEvent(document, 'fullscreenchange'),
      fromEvent(document, 'webkitfullscreenchange'),
      fromEvent(document, 'mozfullscreenchange'),
      fromEvent(document, 'msfullscreenchange'),
    )
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.state = !!(
          document.fullscreenElement ||
          //@ts-ignore
          document.mozFullScreenElement ||
          //@ts-ignore
          document.msFullScreenElement ||
          //@ts-ignore
          document.webkitFullscreenElement
        );
      });
  }

  click(name: string) {
    if (this.active) {
      switch (name) {
        case 'toggle':
          if (this.state) {
            this.exitFullscreen();
          } else {
            this.requestFullscreen();
          }
          break;
        case 'close':
          if (this.state) this.exitFullscreen();
          this.onClose.emit();
          break;
        default:
          break;
      }
    } else {
      this.active = true;
      timer(2000)
        .pipe()
        .subscribe(_ => {
          this.active = false;
        });
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      //@ts-ignore
    } else if (document.mozCancelFullScreen) {
      //@ts-ignore
      document.mozCancelFullScreen();
      //@ts-ignore
    } else if (document.webkitExitFullscreen) {
      //@ts-ignore
      document.webkitExitFullscreen();
      //@ts-ignore
    } else if (document.msExitFullscreen) {
      //@ts-ignore
      document.msExitFullscreen();
    }
    this.listenFullScreen.emit(false);
  }

  requestFullscreen() {
    const ele = this.ref;
    if (ele.requestFullscreen) {
      ele.requestFullscreen();
      //@ts-ignore
    } else if (ele.mozRequestFullScreen) {
      //@ts-ignore
      ele.mozRequestFullScreen();
      //@ts-ignore
    } else if (ele.webkitRequestFullscreen) {
      //@ts-ignore
      ele.webkitRequestFullscreen();
      //@ts-ignore
    } else if (ele.msRequestFullscreen) {
      //@ts-ignore
      ele.msRequestFullscreen();
    }
    this.listenFullScreen.emit(true);
  }

  clickPopup() {
    if (this.state) {
      this.exitFullscreen();
    }
    this.switchCurrency.emit();
  }
}
