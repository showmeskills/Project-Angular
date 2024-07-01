import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notice-txt',
  templateUrl: './notice-txt.component.html',
  styleUrls: ['./notice-txt.component.scss'],
})
export class NoticeTxtComponent implements OnInit {
  constructor() {}

  isShow1: boolean = false;
  isShow2: boolean = false;

  ngOnInit() {}
  open2() {
    this.isShow2 = !this.isShow2;
  }
  open1() {
    this.isShow1 = !this.isShow1;
  }
}
