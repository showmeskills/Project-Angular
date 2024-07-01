import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SelectGroupComponent } from '../select-group/select-group.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-radio-select',
  templateUrl: './radio-select.component.html',
  styleUrls: ['./radio-select.component.scss'],
  standalone: true,
  imports: [AngularSvgIconModule, SelectGroupComponent, LangPipe],
})
export class RadioSelectComponent implements OnInit {
  @Input() title = '';
  @Input() tabTemplate: TemplateRef<any> | null = null; // tabTemplate模板
  @Input() list: any = {};
  @Input() value = 'code';
  @Input() label = 'code';

  @Input('select')
  get select() {
    return this._select;
  }

  set select(v: any[]) {
    this._select = v;
  }

  private _select: any[] = [];

  constructor(public modal: MatModalRef<any>) {}

  ngOnInit(): void {}

  onConfirm() {
    this.modal.close((typeof this.select === 'string' ? this.select : this.select[0]) ?? undefined);
  }
}
