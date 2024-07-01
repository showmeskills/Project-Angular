import { Component, Input, OnInit } from '@angular/core';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'stat-data-item',
  templateUrl: './stat-data-item.component.html',
  styleUrls: ['./stat-data-item.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, LangPipe],
})
export class StatDataItemComponent implements OnInit {
  constructor() {}

  @Input() titleLang: string;
  @Input() icon: string;
  @Input() value: number;

  ngOnInit(): void {}
}
