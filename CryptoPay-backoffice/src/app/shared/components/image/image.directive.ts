/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction, Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzConfigKey } from './config';

import { NzImageGroupComponent } from './image-group.component';
import { NzImageService } from './image.service';
import { BooleanInput } from '@angular/cdk/coercion';
import { InputBoolean } from '@ng-util/util';
import { NzConfigService, WithConfig } from './config.service';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'image';

export type ImageStatusType = 'error' | 'loading' | 'normal';

@Directive({
  selector: 'img[nz-image]',
  exportAs: 'nzImage',
  host: {
    '(click)': 'onPreview()',
  },
  standalone: true,
})
export class NzImageDirective implements OnInit, OnChanges, OnDestroy {
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;

  static ngAcceptInputType_nzDisablePreview: BooleanInput;

  @Input('src') _nzSrc = '';
  @Input() nzSrcset = '';
  @Input() @InputBoolean() @WithConfig() nzDisablePreview = false;
  @Input() @WithConfig() nzFallback: string | null = null;
  @Input() @WithConfig() nzPlaceholder: string | null = null;

  dir?: Direction;
  backLoadImage!: HTMLImageElement;
  status: ImageStatusType = 'normal';
  private backLoadDestroy$: Subject<void> = new Subject();
  private destroy$: Subject<void> = new Subject();

  get previewable(): boolean {
    return !this.nzDisablePreview && this.status !== 'error';
  }

  get nzSrc() {
    return this.iconSrcDirective?.src || this._nzSrc;
  }

  constructor(
    @Inject(DOCUMENT) private document: any,
    public nzConfigService: NzConfigService,
    private elementRef: ElementRef,
    private nzImageService: NzImageService,
    protected cdr: ChangeDetectorRef,
    @Optional() private parentGroup: NzImageGroupComponent,
    @Optional() private directionality: Directionality,
    @Optional() private iconSrcDirective: IconSrcDirective
  ) {}

  ngOnInit(): void {
    this.backLoad();
    if (this.parentGroup) {
      this.parentGroup.addImage(this);
    }
    if (this.directionality) {
      this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction: Direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });
      this.dir = this.directionality.value;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPreview(): void {
    if (!this.previewable) {
      return;
    }

    if (this.parentGroup) {
      // preview inside image group
      const previewAbleImages = this.parentGroup.images.filter((e) => e.previewable);
      const previewImages = previewAbleImages.map((e) => ({ src: e.nzSrc, srcset: e.nzSrcset }));
      const previewIndex = previewAbleImages.findIndex((el) => this === el);
      const previewRef = this.nzImageService.preview(previewImages, { nzDirection: this.dir });
      previewRef.switchTo(previewIndex);
    } else {
      // preview not inside image group
      const previewImages = [{ src: this.nzSrc, srcset: this.nzSrcset }];
      this.nzImageService.preview(previewImages, { nzDirection: this.dir });
    }
  }

  getElement(): ElementRef<HTMLImageElement> {
    return this.elementRef;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { _nzSrc } = changes;
    if (_nzSrc) {
      this.getElement().nativeElement.src = _nzSrc.currentValue;
      this.backLoad();
    }
  }

  /**
   * use internal Image object handle fallback & placeholder
   *
   * @private
   */
  private backLoad(): void {
    this.backLoadImage = this.document.createElement('img');
    this.backLoadImage.src = this.nzSrc;
    this.backLoadImage.srcset = this.nzSrcset;
    this.status = 'loading';

    // unsubscribe last backLoad
    this.backLoadDestroy$.next();
    this.backLoadDestroy$.complete();
    this.backLoadDestroy$ = new Subject();
    if (this.backLoadImage.complete) {
      this.status = 'normal';
      this.getElement().nativeElement.src = this.nzSrc;
      this.getElement().nativeElement.srcset = this.nzSrcset;
    } else {
      if (this.nzPlaceholder) {
        this.getElement().nativeElement.src = this.nzPlaceholder;
        this.getElement().nativeElement.srcset = '';
      } else {
        this.getElement().nativeElement.src = this.nzSrc;
        this.getElement().nativeElement.srcset = this.nzSrcset;
      }

      // The `nz-image` directive can be destroyed before the `load` or `error` event is dispatched,
      // so there's no sense to keep capturing `this`.
      fromEvent(this.backLoadImage, 'load')
        .pipe(takeUntil(this.backLoadDestroy$), takeUntil(this.destroy$))
        .subscribe(() => {
          this.status = 'normal';
          this.getElement().nativeElement.src = this.nzSrc;
          this.getElement().nativeElement.srcset = this.nzSrcset;
        });

      fromEvent(this.backLoadImage, 'error')
        .pipe(takeUntil(this.backLoadDestroy$), takeUntil(this.destroy$))
        .subscribe(() => {
          this.status = 'error';
          if (this.nzFallback) {
            this.getElement().nativeElement.src = this.nzFallback;
            this.getElement().nativeElement.srcset = '';
          }
        });
    }
  }
}
