import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { FormValidator } from 'src/app/shared/form-validator';
import { zip } from 'rxjs';
import { LegalAreaApi } from 'src/app/shared/api/legalarea.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-last-page-edit',
  templateUrl: './last-page-edit.component.html',
  styleUrls: ['./last-page-edit.component.scss'],
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, FormRowComponent, UploadComponent, NgFor, LangPipe],
})
export class LastPageEditComponent implements OnInit {
  formGroup!: FormGroup;
  validator!: FormValidator;

  tepStatus?: any;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private router: Router,
    public legalAreaApi: LegalAreaApi
  ) {}

  @Input() type = '';
  @Input() data: any = {};

  tabList: any = [
    { name: '图片上传', value: 1, lang: 'payment.paymentMethod.uploadPicture' },
    { name: '牌照链接', value: 2, lang: 'content.foot.link' },
  ];

  curValue: any = 1;
  areaList: any = [];

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() show = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<any>();

  ngOnInit() {
    zip(this.legalAreaApi.getLegalareaList()).subscribe(([area]) => {
      this.areaList = area;
      this.loadForm(this.type);
    });
  }

  loadForm(type: string): void {
    if (type === 'theme') {
      const data: any = this.data;
      let attach = {};

      if (data) {
        attach = {
          title: [data.title, Validators.required],
          url: [data.url],
          open: [data.isBlank, Validators.required],
        };
      }

      this.formGroup = this.fb.group({
        title: ['', Validators.required],
        url: [''],
        open: [true],
        ...attach,
      });
    } else if (type === 'theme-icon') {
      const data: any = this.data;
      let attach = {};

      if (data) {
        attach = {
          title: [data.title, Validators.required],
          url: [data.url],
          open: [data.isBlank, Validators.required],
        };
      }

      this.formGroup = this.fb.group({
        title: ['', Validators.required],
        url: [''],
        open: [true],
        ...attach,
      });
    } else if (type === 'license') {
      this.formGroup = this.fb.group(
        (() => {
          const data: any = this.data;
          let attach = {};

          if (data) {
            const i = data.licenseType === 'Picture' ? 1 : 2;
            this.curValue = i;
            const hasArea = this.areaList.some((e) => e.id === data.lagalArea);

            attach = {
              [i === 1 ? 'icon' : 'code']: [data.image, Validators.required],
              ['url' + i]: [data.url],
              ['open' + i]: [data.isBlank, Validators.required],
              ['judicial' + i]: [hasArea ? data.lagalArea : '', Validators.required],
            };
          }

          return {
            // 图片上传
            icon: ['', Validators.required],
            url1: [''],
            open1: [true, Validators.required],
            judicial1: ['', Validators.required],

            // 代码上传
            code: ['', Validators.required],
            url2: [''],
            open2: [true, Validators.required],
            judicial2: ['', Validators.required],

            // 附加数据
            ...attach,
          };
        })()
      );
    }
  }

  // 加载状态
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }

  onSubmitLicense() {
    this.formGroup.markAllAsTouched();
    const i = this.curValue;

    if (
      this.formGroup.get(i === 1 ? 'icon' : 'code')?.invalid ||
      this.formGroup.get('open' + i)?.invalid ||
      this.formGroup.get('judicial' + i)?.invalid
    )
      return;

    const data: any = {};

    data.image = this.formGroup.get(i === 1 ? 'icon' : 'code')?.value;
    data.url = this.formGroup.get('url' + i)?.value;
    data.isBlank = this.formGroup.get('open' + i)?.value;
    data.lagalArea = this.formGroup.get('judicial' + i)?.value;
    data.licenseType = i === 1 ? 'Picture' : 'Code';
    data.id = this.data?.licenseId;

    this.update.emit(data);
    this.onBack();
  }

  onBack() {
    this.show.emit(false);
  }

  onTab(item: any) {
    this.formGroup.markAsUntouched();
    this.curValue = item.value;
  }

  onSubmitTheme() {
    this.formGroup.markAllAsTouched();

    if (
      this.formGroup.get('title')?.invalid ||
      this.formGroup.get('url')?.invalid ||
      this.formGroup.get('open')?.invalid
    )
      return;

    const data: any = {};

    data.title = this.formGroup.get('title')?.value;
    data.url = this.formGroup.get('url')?.value;
    data.isBlank = this.formGroup.get('open')?.value;
    data.id = this.data?.id;

    this.update.emit(data);
    this.onBack();
  }
}
