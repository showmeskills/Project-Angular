import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NzImageService } from 'src/app/shared/components/image';
import { AppService } from 'src/app/app.service';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { SafePipe } from 'src/app/_metronic/core/pipes/safe.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'img-viewer',
  templateUrl: './img-viewer.component.html',
  styleUrls: ['./img-viewer.component.scss'],
  // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
  outputs: ['listChange'],
  providers: [NzImageService],
  standalone: true,
  imports: [NgIf, AngularSvgIconModule, SafePipe, HostPipe],
})
export class ImgViewerComponent implements OnInit {
  constructor(
    private sanitizer: DomSanitizer,
    private imageService: NzImageService,
    private appService: AppService
  ) {}

  curIndex = 0;

  /** 显示移除 */
  @Input() showClear = true;

  @Input()
  get list() {
    return this._list;
  }

  set list(v: string[]) {
    this._list = Array.isArray(v) ? v.filter((e) => !!e) : [];
    this.setFirst();
  }

  private _list: string[] = [];

  @Output() listChange = new EventEmitter<string[]>();

  /** getters */
  get curURL() {
    return this.list[this.curIndex] || '';
  }

  ngOnInit(): void {}

  /** methods */
  openPreview() {
    if (!this.curURL) return;

    this.imageService
      .preview(
        this.list.map((e) => ({ src: this.sanitizer.bypassSecurityTrustUrl(this.appService.joinHost(e)) as string }))
      )
      .switchTo(this.curIndex);
  }

  setFirst() {
    if (this._list[this.curIndex] === this.curURL) return;

    this.curIndex = 0;
  }

  onChange(isPreview: boolean) {
    if (!this.list.length) return;

    if (isPreview) {
      this.curIndex = this.curIndex - 1 < 0 ? this._list.length - 1 : this.curIndex - 1;
    } else {
      this.curIndex = (this.curIndex + 1) % this.list.length;
    }
  }

  onRemove(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    this.list = this.list.filter((e) => e !== this.curURL);
    this.listChange.emit(this.list);
  }

  updateIndex(v: number) {
    this.curIndex = v;
  }
}
