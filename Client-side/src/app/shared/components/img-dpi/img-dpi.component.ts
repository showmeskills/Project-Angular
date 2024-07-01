import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-img-dpi,[app-img-dpi]',
  templateUrl: './img-dpi.component.html',
  styleUrls: ['./img-dpi.component.scss'],
})
export class ImgDpiComponent implements OnInit {
  constructor() {}

  @Input() ldpiSrc: string = '';
  @Input() hdpiSrc: string = '';

  ready: boolean = false;

  get imgSrc() {
    if (this.ldpiSrc && this.hdpiSrc) {
      return this.ready ? this.hdpiSrc : this.ldpiSrc;
    }
    return this.hdpiSrc || this.ldpiSrc;
  }

  ngOnInit() {}
}
