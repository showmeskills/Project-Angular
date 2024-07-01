import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-member-select',
  templateUrl: './member-select.component.html',
  styleUrls: ['./member-select.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, SelectGroupComponent, SelectDirective, LangPipe],
})
export class MemberSelectComponent implements OnInit {
  constructor(public modal: NgbActiveModal) {}

  @Output() private transferData = new EventEmitter();
  @Input() list: any = {};
  @Input('select')
  get select() {
    return this._select;
  }

  set select(v) {
    this._select = v;
  }

  private _select = [];

  paginator: PaginatorState = new PaginatorState(); // 分页

  ngOnInit(): void {}

  close(): void {
    this.modal.close();
  }

  save(): void {
    this.transferData.emit(this.select);
    this.modal.close();
  }
}
