import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-radio-select',
  templateUrl: './theme-select.component.html',
  styleUrls: ['./theme-select.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, SelectGroupComponent, SelectDirective],
})
export class ThemeSelectComponent implements OnInit {
  @Input() list: any = {};
  @Input('select')
  get select() {
    return this._select;
  }

  set select(v) {
    this._select = v;
  }

  private _select = [];

  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {}

  onConfirm() {
    this.modal.close((typeof this.select === 'string' ? this.select : this.select[0]) ?? undefined);
  }
}
