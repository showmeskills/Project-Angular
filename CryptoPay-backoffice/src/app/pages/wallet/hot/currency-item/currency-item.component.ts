import { Component, Input, OnInit } from '@angular/core';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf } from '@angular/common';

@Component({
  selector: 'currency-item',
  templateUrl: './currency-item.component.html',
  styleUrls: ['./currency-item.component.scss'],
  standalone: true,
  imports: [NgIf, CurrencyIconDirective, CurrencyValuePipe],
})
export class CurrencyItemComponent implements OnInit {
  constructor() {}

  @Input() src: string;
  @Input() title: string;
  @Input() name: string;
  @Input() value: string;

  ngOnInit(): void {}
}
