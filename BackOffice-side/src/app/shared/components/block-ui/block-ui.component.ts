import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  standalone: true,
})
export class BlockUiComponent implements OnInit {
  @Input() message = '加载中';
  @Input() bgColor = 'transparent';
  constructor() {}

  ngOnInit() {}
}
