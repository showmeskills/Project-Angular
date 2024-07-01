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
import { ThemeApi } from 'src/app/shared/api/theme.api';
import { ThemeService } from 'src/app/pages/session/theme/theme.service';
import { CategoryItem } from 'src/app/shared/interfaces/theme.interface';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-theme-edit',
  templateUrl: './theme-edit.component.html',
  styleUrls: ['./theme-edit.component.scss'],
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
  ],
})
export class ThemeEditComponent implements OnInit {
  constructor(
    @Inject(MAT_MODAL_DATA) public data: any,
    public modal: MatModalRef<ThemeEditComponent>,
    public appService: AppService,
    public api: ThemeApi,
    public themeService: ThemeService,
    public lang: LangService
  ) {}

  selectLang = ['zh-cn', 'en-us'];
  list: CategoryItem[] = [];
  @Input() tenantId = '';
  nameCn = '';
  nameEn = '';
  isEdit: boolean = false;
  categoryId: string;
  id: string;
  ngOnInit(): void {
    if (this.isEdit) {
      this.nameCn = this.data.nameCn;
      this.nameEn = this.data.nameEn;
      this.categoryId = this.data.categoryId;
      this.id = this.data.id;
    }
    this.themeService.categoryList$.subscribe((res) => {
      this.list = res;
    });
  }

  onAddLabelSubmit() {
    if (!this.nameCn || !this.nameEn || !this.categoryId) {
      return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });
    }
    if (this.isEdit) {
      this.api
        .updateSubjectQuery(this.tenantId, {
          categoryId: this.categoryId,
          label: this.list.find((e) => e.id == this.categoryId)?.label || '',
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
        .addSubjectQuery(this.tenantId, {
          categoryId: this.categoryId,
          label: this.list.find((e) => e.id == this.categoryId)?.label || '',
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
}
