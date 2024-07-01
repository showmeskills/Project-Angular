import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatModalRef, MAT_MODAL_DATA } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { NgIf, NgFor } from '@angular/common';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { ThemeApi } from 'src/app/shared/api/theme.api';
import { TopicLabelComponent } from 'src/app/pages/session/components/topic-label/topic-label.component';
import { TopicLabelBase } from 'src/app/shared/interfaces/session';

@Component({
  selector: 'app-type-edit',
  templateUrl: './type-edit.component.html',
  styleUrls: ['./type-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ModalTitleComponent,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    InputNumberDirective,
    AngularSvgIconModule,
    NgbPopover,
    ModalFooterComponent,
    LangPipe,
    LangTabComponent,
    TopicLabelComponent,
  ],
})
export class TypeEditComponent implements OnInit {
  constructor(
    @Inject(MAT_MODAL_DATA) public data: any,
    public modal: MatModalRef<TypeEditComponent>,
    public appService: AppService,
    public api: ThemeApi
  ) {}

  selectLang = ['zh-cn', 'en-us'];
  list: TopicLabelBase[] = [
    { nameCn: '类型', nameEn: 'Category', label: '1' },
    { nameCn: '类型', nameEn: 'Category', label: '2' },
    { nameCn: '类型', nameEn: 'Category', label: '3' },
    { nameCn: '类型', nameEn: 'Category', label: '4' },
    { nameCn: '类型', nameEn: 'Category', label: '5' },
    { nameCn: '类型', nameEn: 'Category', label: '6' },
    { nameCn: '类型', nameEn: 'Category', label: '7' },
    { nameCn: '类型', nameEn: 'Category', label: '8' },
    { nameCn: '类型', nameEn: 'Category', label: '9' },
    { nameCn: '类型', nameEn: 'Category', label: '10' },
  ];

  @Input() tenantId = '';
  nameCn = '';
  nameEn = '';
  label = '';
  isEdit: boolean = false;
  ngOnInit(): void {
    if (this.isEdit) {
      this.nameCn = this.data.nameCn;
      this.nameEn = this.data.nameEn;
      this.label = this.data.label;
    }
  }

  onAddLabelSubmit() {
    if (!this.nameCn || !this.nameEn || !this.label) {
      return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });
    }
    if (this.isEdit) {
      this.api
        .updateCategory(this.tenantId, {
          label: this.label,
          nameCn: this.nameCn,
          nameEn: this.nameEn,
          id: this.data.id,
        })
        .subscribe((res) => {
          if (res.code === '0') this.modal.close(true);
          this.appService.toastOpera(res.code === '0');
        });
    } else {
      this.api
        .addCategory(this.tenantId, {
          label: this.label,
          nameCn: this.nameCn,
          nameEn: this.nameEn,
        })
        .subscribe((res) => {
          if (+res.code !== 0) return this.appService.showToastSubject.next({ msg: res?.message || 'fail' });
          this.modal.close(true);
        });
    }
  }

  onDelLabel() {}

  onClickColor(label) {
    this.label = label;
  }
}
