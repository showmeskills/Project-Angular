import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-old-platform',
  templateUrl: './old-platform.component.html',
  styleUrls: ['./old-platform.component.scss'],
})
export class OldPlatformComponent implements OnInit {
  constructor() {}

  /**@isShowBtn */
  isShowBtn: boolean = true;

  ngOnInit(): void {}
}
