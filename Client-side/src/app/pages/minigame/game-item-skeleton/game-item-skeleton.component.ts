import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[app-game-item-skeleton]',
  templateUrl: './game-item-skeleton.component.html',
  styleUrls: ['./game-item-skeleton.component.scss'],
})
export class GameItemSkeletonComponent implements OnInit {
  constructor() {}

  @Input() maxNum: number = 8;
  @Input() gridClassName: string = 'grid-8-3-gap-11-6';
  @Input() height: string = '133.3333%';

  items = [];

  ngOnInit() {
    this.items = Array.from({ length: this.maxNum });
  }
}
