import { Component, Input, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-auth-item',
  templateUrl: './auth-item.component.html',
  styleUrls: ['./auth-item.component.scss'],
  standalone: true,
  imports: [NgFor, AngularSvgIconModule],
})
export class AuthItemComponent implements OnInit {
  @Input() title = '';
  @Input() list: Array<any> = [];

  constructor() {}

  ngOnInit(): void {}
}
