import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { timer } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state(
        'false',
        style({
          opacity: 0,
          transform: 'translate3D(0, -10px, 0)',
        })
      ),
      state(
        'true',
        style({
          opacity: 1,
          transform: 'translate3D(0, 0, 0)',
        })
      ),
      transition('* => true', [
        style({
          opacity: 0,
          transform: 'translate3D(50px, 0, 0)',
        }),
        animate(
          250,
          style({
            opacity: 1,
            transform: 'translate3D(0, 0, 0)',
          })
        ),
      ]),
      transition('* => false', [
        style({
          opacity: 1,
          transform: 'translate3D(0, 0, 0)',
        }),
        animate(
          250,
          style({
            opacity: 0,
            transform: 'translate3D(0, -10px, 0)',
          })
        ),
      ]),
    ]),
  ],
})
export class ToastComponent {
  id!: string;
  height: number = 0;
  offset: number = 25;
  type?: 'success' | 'fail';
  customClass: string = '';
  duration: number = 5000;
  zIndex: number = 1100;
  title?: string;
  message: string = '';
  showBox?: boolean;
  showClose: boolean = true;

  onClose = () => {};
  onDestroy = () => {};
  onClick?: () => void;

  constructor(private changeRef: ChangeDetectorRef) {}

  viewInit(el: HTMLElement) {
    this.height = el.offsetHeight;
    this.show();
  }

  show(): void {
    this.showBox = true;
    this.changeRef.detectChanges();
    if (this.duration > 0) {
      timer(this.duration)
        .pipe(untilDestroyed(this))
        .subscribe(_ => {
          this.close();
        });
    }
  }

  close(): void {
    this.showBox = false;
    this.onClose();
    this.onDestroy();
  }

  onToastClick() {
    if (typeof this.onClick !== 'function') return;
    this.onClick();
    this.close();
  }
}
