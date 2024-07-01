import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-member-select',
  templateUrl: './member-select.component.html',
  styleUrls: ['./member-select.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, SelectGroupComponent],
})
export class MemberSelectComponent implements OnInit {
  @Input() public list!: Array<any>;
  @Input() public selectedList!: Array<any>;
  @Output() private transferData = new EventEmitter();

  selected: Array<any> = [];

  constructor(public modal: MatModalRef<any>) {}

  ngOnInit(): void {
    const ls: Array<any> = [];
    this.selectedList.forEach((item) => {
      ls.push(item.id);
    });
    this.selected = ls;
  }

  close(): void {
    this.modal.close();
  }

  next(): void {
    this.modal.close();

    const ls = this.list.filter((item) => this.selected.indexOf(item.id) > -1);
    const result: Array<{ id: number; userName: string; roles: Array<any> }> = [];

    ls.forEach((item) => {
      const roles = this.resultRoles(item.id);
      result.push({ id: item.id, userName: item.userName, roles: roles });
    });

    this.transferData.emit(result);
  }

  resultRoles(id) {
    let data;

    this.selectedList.forEach((item) => {
      if (item.id == id) {
        data = item.roles;
      }
    });

    return data;
  }
}
