import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header-title-bar',
  templateUrl: './header-title-bar.component.html',
  styleUrls: ['./header-title-bar.component.scss'],
})
export class HeaderTitleBarComponent {
  constructor(private location: Location) {}

  @Input() title!: string;
  @Input() clickForRouterBack?: boolean;
  @Input() showIcon: boolean = true;
  @Output() clickTitle: EventEmitter<MouseEvent> = new EventEmitter();

  headTextClick(event: MouseEvent) {
    if (this.clickForRouterBack) {
      this.location.back();
      return;
    }
    this.clickTitle.emit(event);
  }
}
