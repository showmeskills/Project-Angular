/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { AnimationEvent } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { filter, fromEvent, merge, share } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { fadeFastInSlowOut, fadeMotion } from './core/fade';
import { NzConfigService } from 'src/app/shared/components/image/config.service';
import { isNotNil } from 'src/app/shared/models/tools.model';

import { FADE_CLASS_NAME_MAP, NZ_CONFIG_MODULE_NAME } from './image-config';
import { NzImage, NzImagePreviewOptions } from './image-preview-options';
import { NzImagePreviewRef } from './image-preview-ref';
import { getClientSize, getFitContentPosition, getOffset } from './utils';
import { NzDestroyService } from './core/destroy';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';

export interface NzImageContainerOperation {
  icon: string;
  type: string;

  onClick(): void;
}

const initialPosition = {
  x: 0,
  y: 0,
};

@Component({
  selector: 'nz-image-preview',
  exportAs: 'nzImagePreview',
  animations: [fadeMotion, fadeFastInSlowOut],
  template: `
    <div class="ant-image-preview">
      <div tabindex="0" aria-hidden="true" style="width: 0; height: 0; overflow: hidden; outline: none;"></div>
      <div class="ant-image-preview-content">
        <div class="ant-image-preview-body">
          <ul class="ant-image-preview-operations">
            <li
              class="ant-image-preview-operations-operation"
              [class.ant-image-preview-operations-operation-disabled]="zoomOutDisabled && option.type === 'zoomOut'"
              (click)="option.onClick()"
              *ngFor="let option of operations"
            >
              <svg-icon
                class="ant-image-preview-operations-icon"
                [src]="'./assets/images/svg/' + option.icon + '.svg'"
              ></svg-icon>
            </li>
          </ul>

          <div
            class="ant-image-preview-img-wrapper"
            #imagePreviewWrapper
            cdkDrag
            [style.transform]="previewImageWrapperTransform"
            [cdkDragFreeDragPosition]="position"
            (cdkDragReleased)="onDragReleased()"
          >
            <ng-container *ngFor="let image of images; index as imageIndex">
              <img
                cdkDragHandle
                class="ant-image-preview-img"
                #imgRef
                *ngIf="index === imageIndex"
                [attr.src]="image.src"
                [attr.srcset]="image.srcset"
                [attr.alt]="image.alt"
                [style.width]="image.width"
                [style.height]="image.height"
                [style.transform]="previewImageTransform"
              />
            </ng-container>
          </div>

          <ng-container *ngIf="images.length > 1">
            <div
              class="ant-image-preview-switch-left"
              [class.ant-image-preview-switch-left-disabled]="index <= 0"
              (click)="onSwitchLeft($event)"
            >
              <svg-icon [src]="'./assets/images/svg/left-bold.svg'"></svg-icon>
            </div>
            <div
              class="ant-image-preview-switch-right"
              [class.ant-image-preview-switch-right-disabled]="index >= images.length - 1"
              (click)="onSwitchRight($event)"
            >
              <svg-icon [src]="'./assets/images/svg/right-bold.svg'"></svg-icon>
            </div>
          </ng-container>

          <!-- zoom value show -->
          <div *ngIf="showZoomValue" @fadeFastInSlowOut class="ant-image-preview-zoom-percentage">
            {{ zoomPercentage }}%
          </div>
        </div>
      </div>
      <div tabindex="0" aria-hidden="true" style="width: 0; height: 0; overflow: hidden; outline: none;"></div>
    </div>
  `,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ant-image-preview-wrap',
    '[class.ant-image-preview-moving]': 'isDragging',
    '[style.zIndex]': 'config.nzZIndex',
    '[@.disabled]': 'config.nzNoAnimation',
    '[@fadeMotion]': 'animationState',
    '(@fadeMotion.start)': 'onAnimationStart($event)',
    '(@fadeMotion.done)': 'onAnimationDone($event)',
    tabindex: '-1',
    role: 'document',
  },
  providers: [NzDestroyService],
  standalone: true,
  imports: [NgFor, AngularSvgIconModule, CdkDrag, NgIf, CdkDragHandle],
})
export class NzImagePreviewComponent implements OnInit {
  images: NzImage[] = [];
  index = 0;
  isDragging = false;
  showZoomValue = false;
  showZoomValueTimer = 0;
  visible = true;
  animationState: 'void' | 'enter' | 'leave' = 'enter';
  animationStateChanged = new EventEmitter<AnimationEvent>();

  previewImageTransform = '';
  previewImageWrapperTransform = '';
  operations: NzImageContainerOperation[] = [
    {
      icon: 'close-normal',
      onClick: () => {
        this.onClose();
      },
      type: 'close',
    },
    {
      icon: 'scale-y',
      onClick: () => {
        this.onScaleY();
      },
      type: 'scaleY',
    },
    {
      icon: 'scale-x',
      onClick: () => {
        this.onScaleX();
      },
      type: 'scaleX',
    },
    {
      icon: 'zoom-in',
      onClick: () => {
        this.onZoomIn();
      },
      type: 'zoomIn',
    },
    {
      icon: 'zoom-out',
      onClick: () => {
        this.onZoomOut();
      },
      type: 'zoomOut',
    },
    {
      icon: 'zoom-origin',
      onClick: () => {
        this.onZoomOrigin();
      },
      type: 'zoomOrigin',
    },
    {
      icon: 'right-rotate',
      onClick: () => {
        this.onRotateRight();
      },
      type: 'rotateRight',
    },
    {
      icon: 'left-rotate',
      onClick: () => {
        this.onRotateLeft();
      },
      type: 'rotateLeft',
    },
  ];

  zoomOutDisabled = false;
  position = { ...initialPosition };
  previewRef!: NzImagePreviewRef;
  containerClick = new EventEmitter<void>();
  closeClick = new EventEmitter<void>();

  @ViewChild('imgRef') imageRef!: ElementRef<HTMLImageElement>;
  @ViewChild('imagePreviewWrapper', { static: true }) imagePreviewWrapper!: ElementRef<HTMLElement>;

  private zoom: number;
  private zoomBase = 0.5;
  private zoomWheelBase = 0.1;
  private isScaleX: boolean;
  private isScaleY: boolean;
  private rotate: number;

  get animationDisabled(): boolean {
    return this.config.nzNoAnimation ?? false;
  }

  get maskClosable(): boolean {
    const defaultConfig: any = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME) || {};
    return this.config.nzMaskClosable ?? defaultConfig.nzMaskClosable ?? true;
  }

  get zoomPercentage(): number {
    return Number.parseInt(String(Math.floor(this.zoom * 100)));
  }

  constructor(
    private ngZone: NgZone,
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    public nzConfigService: NzConfigService,
    public config: NzImagePreviewOptions,
    private overlayRef: OverlayRef,
    private destroy$: NzDestroyService
  ) {
    this.zoom = this.config.nzZoom ?? 1;
    this.rotate = this.config.nzRotate ?? 0;
    this.updateZoomOutDisabled();
    this.updatePreviewImageTransform();
    this.updatePreviewImageWrapperTransform();
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.host.nativeElement, 'click')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          if (event.target === event.currentTarget && this.maskClosable && this.containerClick.observers.length) {
            this.ngZone.run(() => this.containerClick.emit());
          }
        });

      fromEvent(this.imagePreviewWrapper.nativeElement, 'mousedown')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.isDragging = true;
        });

      this.setupWheelZoom();
    });
  }

  setupWheelZoom(): void {
    const events = ['wheel', 'mousewheel', 'DOMMouseScroll'];

    let wheel$ = merge(...events.map((e) => fromEvent(this.host.nativeElement, e))).pipe(
      takeUntil(this.destroy$),
      tap((event: any) => event.preventDefault()),
      share()
    );

    wheel$
      .pipe(filter((event: WheelEvent) => event.shiftKey && !event.ctrlKey && !event.altKey))
      .subscribe((event: WheelEvent) => (event.deltaY < 0 ? this.prev() : this.next()));
    wheel$
      .pipe(filter((event: WheelEvent) => event.altKey && !event.ctrlKey && !event.shiftKey))
      .subscribe((event: WheelEvent) => this.onZoom(event.deltaY < 0, 1));
    wheel$
      .pipe(filter((event: WheelEvent) => event.ctrlKey && !event.shiftKey && !event.altKey))
      .subscribe((event: WheelEvent) => this.onZoom(event.deltaY < 0, this.zoomBase));
    wheel$
      .pipe(filter((event: WheelEvent) => !event.ctrlKey && !event.shiftKey && !event.altKey))
      .subscribe((event: WheelEvent) => this.onZoom(event.deltaY < 0));
  }

  setImages(images: NzImage[]): void {
    this.images = images;
    this.cdr.markForCheck();
  }

  switchTo(index: number): void {
    this.index = index;
    this.cdr.markForCheck();
  }

  next(): void {
    if (this.index < this.images.length - 1) {
      this.ngZone.run(() => {
        this.reset();
        this.index++;
        this.updatePreviewImageTransform();
        this.updatePreviewImageWrapperTransform();
        this.updateZoomOutDisabled();
        this.cdr.markForCheck();
      });
    }
  }

  prev(): void {
    if (this.index > 0) {
      this.ngZone.run(() => {
        this.reset();
        this.index--;
        this.updatePreviewImageTransform();
        this.updatePreviewImageWrapperTransform();
        this.updateZoomOutDisabled();
        this.cdr.markForCheck();
      });
    }
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }

  onClose(): void {
    this.closeClick.emit();
  }

  onZoom(isIn, zoomValue = 0): void {
    this.ngZone.run(() => {
      zoomValue = zoomValue || this.zoomWheelBase;

      if (isIn) {
        this.zoom += zoomValue;
      } else {
        this.zoom - zoomValue <= 0.01 ? (this.zoom = 0.01) : (this.zoom -= zoomValue);
      }

      this.updatePreviewImageTransform();
      this.updateZoomOutDisabled();
      this.triggerZoomShow();

      if (this.config.nzReboundPosition) {
        this.position = { ...initialPosition };
      }

      this.cdr.detectChanges();
    });
  }

  onZoomIn(): void {
    this.zoom += this.zoomBase;
    this.updatePreviewImageTransform();
    this.updateZoomOutDisabled();
    this.triggerZoomShow();

    if (!this.config.nzReboundPosition) return;
    this.position = { ...initialPosition };
  }

  onZoomOut(): void {
    this.zoom - this.zoomBase <= 0.01 ? (this.zoom = 0.01) : (this.zoom -= this.zoomBase);
    this.updatePreviewImageTransform();
    this.updateZoomOutDisabled();
    this.triggerZoomShow();

    if (!this.config.nzReboundPosition) return;
    this.position = { ...initialPosition };
  }

  onZoomOrigin(): void {
    this.zoom = 1;
    this.updatePreviewImageTransform();
    this.updateZoomOutDisabled();
    this.triggerZoomShow();
    this.position = { ...initialPosition };
  }

  onScaleX(): void {
    this.isScaleX = !this.isScaleX;
    this.updatePreviewImageTransform();
  }

  onScaleY(): void {
    this.isScaleY = !this.isScaleY;
    this.updatePreviewImageTransform();
  }

  onRotateRight(): void {
    this.rotate += 90;
    this.updatePreviewImageTransform();
  }

  onRotateLeft(): void {
    this.rotate -= 90;
    this.updatePreviewImageTransform();
  }

  onSwitchLeft(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.prev();
  }

  onSwitchRight(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.next();
  }

  onAnimationStart(event: AnimationEvent): void {
    if (event.toState === 'enter') {
      this.setEnterAnimationClass();
    } else if (event.toState === 'leave') {
      this.setLeaveAnimationClass();
    }

    this.animationStateChanged.emit(event);
  }

  onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'enter') {
      this.setEnterAnimationClass();
    } else if (event.toState === 'leave') {
      this.setLeaveAnimationClass();
    }
    this.animationStateChanged.emit(event);
  }

  startLeaveAnimation(): void {
    this.animationState = 'leave';
    this.cdr.markForCheck();
  }

  onDragReleased(): void {
    if (!this.config.nzReboundPosition) return;

    this.isDragging = false;
    const width = this.imageRef.nativeElement.offsetWidth * this.zoom;
    const height = this.imageRef.nativeElement.offsetHeight * this.zoom;
    const { left, top } = getOffset(this.imageRef.nativeElement);
    const { width: clientWidth, height: clientHeight } = getClientSize();
    const isRotate = this.rotate % 180 !== 0;
    const fitContentParams = {
      width: isRotate ? height : width,
      height: isRotate ? width : height,
      left,
      top,
      clientWidth,
      clientHeight,
    };
    const fitContentPos = getFitContentPosition(fitContentParams);
    if (isNotNil(fitContentPos.x) || isNotNil(fitContentPos.y)) {
      this.position = { ...this.position, ...fitContentPos };
    }
  }

  private triggerZoomShow() {
    this.showZoomValue = true;
    window.clearTimeout(this.showZoomValueTimer);
    this.showZoomValueTimer = window.setTimeout(() => {
      this.showZoomValue = false;
      this.cdr.detectChanges();
    }, 700);
  }

  private updatePreviewImageTransform(): void {
    const x = this.isScaleX ? -this.zoom : this.zoom;
    const y = this.isScaleY ? -this.zoom : this.zoom;
    this.previewImageTransform = `scale3d(${x}, ${y}, 1) rotate(${this.rotate}deg)`;
  }

  private updatePreviewImageWrapperTransform(): void {
    this.previewImageWrapperTransform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;
  }

  private updateZoomOutDisabled(): void {
    this.zoomOutDisabled = this.zoom <= 0.01;
  }

  private setEnterAnimationClass(): void {
    if (this.animationDisabled) {
      return;
    }
    const backdropElement = this.overlayRef.backdropElement;
    if (backdropElement) {
      backdropElement.classList.add(FADE_CLASS_NAME_MAP.enter);
      backdropElement.classList.add(FADE_CLASS_NAME_MAP.enterActive);
    }
  }

  private setLeaveAnimationClass(): void {
    if (this.animationDisabled) {
      return;
    }
    const backdropElement = this.overlayRef.backdropElement;
    if (backdropElement) {
      backdropElement.classList.add(FADE_CLASS_NAME_MAP.leave);
      backdropElement.classList.add(FADE_CLASS_NAME_MAP.leaveActive);
    }
  }

  private reset(): void {
    this.zoom = 1;
    this.rotate = 0;
    this.isScaleX = false;
    this.isScaleY = false;
    this.position = { ...initialPosition };
  }
}
