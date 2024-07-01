import { SPACE } from '@angular/cdk/keycodes';
import { Directive, Output, EventEmitter, Self } from '@angular/core';
import { MatSelect } from '@angular/material/select';

@Directive({
  selector: '[no-space]',
  standalone: true,
})
export class MatSelectNoSpaceDirective {
  @Output() spacekeydown: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Self() private select: MatSelect) {
    this.select._handleKeydown = (event: KeyboardEvent) => {
      if (event.keyCode == SPACE) {
        const active = this.select.panelOpen ? this.select.options.filter((x) => x.active)[0] || null : null;
        this.spacekeydown.emit(active ? active.value : null);
      } else {
        if (!this.select.disabled) {
          this.select.panelOpen
            ? (this.select as any)._handleOpenKeydown(event)
            : (this.select as any)._handleClosedKeydown(event);
        }
      }
    };
  }
}
