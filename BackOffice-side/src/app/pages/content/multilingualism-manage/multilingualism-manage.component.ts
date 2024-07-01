import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormValidator } from 'src/app/shared/form-validator';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { MultilingualismApi } from 'src/app/shared/api/multilingualism.api';
import { finalize, forkJoin } from 'rxjs';
import { JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { SelectApi } from 'src/app/shared/api/select.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { Clipboard } from '@angular/cdk/clipboard';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-multilingualism-manage',
  templateUrl: './multilingualism-manage.component.html',
  styleUrls: ['./multilingualism-manage.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    NgIf,
    SelectChildrenDirective,
    SelectGroupDirective,
    PaginatorComponent,
    ReactiveFormsModule,
    UploadComponent,
    LangPipe,
  ],
})
export class MultilingualismManageComponent implements OnInit {
  formGroup!: FormGroup; // 新增字段表单
  validator!: FormValidator; // 新增字段表单验证

  formLanguageGroup!: FormGroup; // 新增语系表单
  valiLanguageDator!: FormValidator; // 新增语系表单验证

  addFieldPopupRef!: NgbModalRef; // 新增字段弹窗实例
  uploadPopupRef!: NgbModalRef; // 上传文件弹窗实例
  addLanguagePopupRef!: NgbModalRef; // 新增语系弹窗实例

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  delFieldPopupRef!: NgbModalRef; // 删除字段弹窗实例

  constructor(
    private modalService: NgbModal,
    private modalMatServive: MatModal,
    private fb: FormBuilder,
    private appService: AppService,
    private multilingualismApi: MultilingualismApi,
    private selectApi: SelectApi,
    private clipboard: Clipboard,
    public lang: LangService
  ) {}

  isLoading = false;

  // 头部筛选
  textSerach: any = ''; // 字段搜索
  translateSerach: any = ''; // 翻译搜索
  time: Date[] = []; // 时间区间
  typeList: any = []; // 类型
  selectedType = ''; // 当前选中类型

  // 页面渲染数据
  list: any = [];
  languageList: any = [];

  // 翻译数据
  translateList: any = [];
  // 新增翻译数据
  addTranslateList: any = [];
  addTranslateContentList: any = [];

  // 国家清单
  countryList: any = [];
  checked = false;

  // 生成翻译资源
  translateData: any = {
    type: 0,
    identifyStr: '',
    isCover: false,
  };

  generateTranslateList: any = [];
  generateLoading = false;

  // 全部导出
  exportTypeList: any = [
    { name: '全部', value: 'All', lang: 'content.mu.all' },
    { name: '前台', value: 'Web', lang: 'content.mu.qian' },
    { name: 'APP', value: 'App', lang: 'content.mu.app' },
    { name: '后台', value: 'Backstage', lang: 'content.mu.hou' },
    { name: '原创游戏', value: 'OriginalGame', lang: 'content.mu.origin' },
    { name: '商户2', value: 'Web2', lang: 'content.mu.merchant2' },
  ];

  selectedExportType = 'All'; // 当前选中类型
  selectedExportLang = 'zh-cn'; // 当前选中语系

  customUpload = async (file /*{ done }*/) => {
    const suc = await this.lang.getOne('content.mu.upSuc');
    const data = await this.lang.getOne('content.mu.data');
    const fail = await this.lang.getOne('content.mu.failUp');
    this.multilingualismApi.uploadtranslatefile(file).subscribe((res) => {
      this.loading(false);
      this.uploadPopupRef.close();

      if (res.error) {
        this.appService.showToastSubject.next({
          msgLang: res.error.detail || 'content.mu.upFailed',
          successed: false,
        });
      }

      if (res.successCount > 0) {
        this.appService.showToastSubject.next({
          msg: `${suc} ${res.successCount} ${data}`,
          successed: true,
        });
      }
      if (res.failCount > 0) {
        this.appService.showToastSubject.next({
          msg: `${fail} ${res.failCount} ${data}`,
          successed: false,
        });
      }

      setTimeout(() => {
        this.loadData();
      }, 500);
    });
  };

  ngOnInit() {
    // this.paginator.pageSize = 10;
    this.getInitData();

    // 新增字段表单 字段与验证
    this.formGroup = this.fb.group({
      field: ['', Validators.compose([Validators.required])],
      type: ['', Validators.compose([Validators.required])],
    });
    this.validator = new FormValidator(this.formGroup);

    // 新增语系表单 字段与验证
    this.formLanguageGroup = this.fb.group({
      simplifiedChinese: ['', Validators.compose([Validators.required])],
      traditionalChinese: [''],
      english: [''],
      name: ['', Validators.compose([Validators.required])],
      code: ['', Validators.compose([Validators.required])],
    });
    this.valiLanguageDator = new FormValidator(this.formLanguageGroup);
  }

  // 获取数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    const param = {
      Type: this.selectedType,
      Key: this.textSerach,
      Text: this.translateSerach,
      ...(this.time[0] ? { StartTime: +this.time[0] } : {}),
      ...(this.time[1] ? { EndTime: +this.time[1] } : {}),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.multilingualismApi
      .getList(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((data) => {
        data.list.forEach((v) => {
          v.checked = false;
        });
        this.list = data.list;
        this.languageList = data.langCodeList || [];
        this.paginator.total = data.total || 0;
      });
  }

  // 获取筛选数据
  getInitData() {
    this.loading(true);
    forkJoin([this.multilingualismApi.getCategory()]).subscribe(([typeData]) => {
      this.loading(false);

      this.typeList = typeData || [];
      this.loadData();
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 重置
  onReset() {
    this.time = [];
    this.selectedType = '';
    this.textSerach = '';
    this.translateSerach = '';
  }

  getKeyCotent(content: any, item: any): any {
    return content.find((v) => v.langCode === item) || { text: '', id: '' };
  }

  getTypeText(id: any) {
    return this.typeList.find((v) => v.code === id).description;
  }

  // onSort() {}

  // 修改翻译
  translateChange(e: any, id: any, langCode: any, item: any) {
    const key = item.key;
    const type = item['content'][0]['typeId'];

    // 有ID是修改翻译
    if (id) {
      if (this.translateList.findIndex((v) => v.id === id) === -1) {
        this.translateList.push({ id, text: e.target.value });
      } else {
        this.translateList.forEach((v) => {
          if (v.id === id) {
            v.text = e.target.value;
          }
        });
      }
    } else {
      // 无ID是新增翻译
      if (this.addTranslateList.findIndex((v) => v.key === key) === -1) {
        this.addTranslateContentList = [{ langCode, text: e.target.value }];
        this.addTranslateList.push({
          content: this.addTranslateContentList,
          key,
          type,
        });
      } else {
        if (this.addTranslateContentList.findIndex((j) => j.langCode === langCode) === -1) {
          this.addTranslateContentList.push({ langCode, text: e.target.value });
        } else {
          this.addTranslateContentList.forEach((j) => {
            if (j.langCode === langCode) {
              j.text = e.target.value;
            }
          });
        }
      }
    }
  }

  // 生成翻译
  async translate() {
    const add = await this.lang.getOne('content.mu.add');
    const suc = await this.lang.getOne('content.mu.dataSuc');
    const fail = await this.lang.getOne('content.mu.dataFail');
    if (this.translateList.length === 0 && this.addTranslateList.length === 0) {
      this.appService.showToastSubject.next({
        msgLang: 'content.mu.unfind',
        successed: false,
      });
      return;
    }

    if (this.translateList.length > 0) {
      this.loading(true);
      this.multilingualismApi
        .update({ list: this.translateList })
        .pipe(
          finalize(() => {
            this.loading(false);
            this.translateList = [];
          })
        )
        .subscribe((res) => {
          if (res === true) {
            this.appService.showToastSubject.next({
              msgLang: 'content.mu.changeSuc',
              successed: true,
            });
          } else {
            this.appService.showToastSubject.next({
              msgLang: 'content.mu.changeFail',
              successed: false,
            });
          }
          // this.loadData();
        });
    }

    if (this.addTranslateList.length > 0) {
      this.loading(true);
      this.multilingualismApi
        .add({ list: this.addTranslateList })
        .pipe(
          finalize(() => {
            this.loading(false);
            this.addTranslateList = [];
          })
        )
        .subscribe((res) => {
          if (res.successCount > 0) {
            this.appService.showToastSubject.next({
              msg: `${add} ${res.successCount} ${suc}`,
              successed: true,
            });
          }
          if (res.failCount > 0) {
            this.appService.showToastSubject.next({
              msg: `${add} ${res.failCount} ${fail}！`,
              successed: false,
            });
          }
          // this.loadData();
        });
    }

    setTimeout(() => {
      this.loadData();
    }, 500);
  }

  // 导出
  onExport() {
    const curCheckedArr = this.list.filter((e) => e.checked);
    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'content.mu.gou', // 请勾选需要导出的内容
        successed: false,
      });
    }

    const arr: { Key: string; Type: string; [key: string]: string }[] = [];

    curCheckedArr.forEach((a) => {
      const typeSet = new Set();
      a.content.forEach((c) => {
        typeSet.add(c.typeId);
      });
      const types = Array.from(typeSet);

      types.forEach((type) => {
        const newRow: { Key: string; Type: string; [key: string]: string } = { Key: a.key, Type: type as string };
        this.languageList.forEach((lang) => {
          const matchingContent = a.content.find((c) => c.typeId === type && c.langCode === lang);
          newRow[lang] = matchingContent ? matchingContent.text : '';
        });
        arr.push(newRow);
      });
    });

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(arr, 'multilingualism-manage-list ' + Date.now());
  }

  // 全部导出 弹窗
  openExportAllPopup(temp: TemplateRef<any>) {
    this.modalMatServive.open(temp, { width: '540px' });
  }

  // 全部导出 确认
  getExportAll(closeModal: any) {
    this.loading(true);
    this.multilingualismApi
      .getkeylist({ type: this.selectedExportType, language: this.selectedExportLang })
      .subscribe((res) => {
        this.loading(false);
        if (res && res.length > 0) {
          const list = res.map((e) => ({
            Key: e.key,
            Type: e.type,
            text: e.text,
          }));
          JSONToExcelDownload(list, 'multilingualism-manage-list-all ' + Date.now());
          closeModal();
        }
      });
  }

  // 打开新增字段弹窗
  openAddFieldPopup(temp: TemplateRef<any>) {
    this.formGroup.patchValue({ field: '', type: undefined });
    this.formGroup.markAsUntouched();
    this.addFieldPopupRef = this.modalService.open(temp, {
      centered: true,
      windowClass: 'multilingualism-modal',
    });
  }

  // 新增字段弹窗确认
  onAddFieldSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    this.loading(true);
    const param = {
      key: this.formGroup.value['field'],
      type: this.formGroup.value['type'],
    };
    this.multilingualismApi
      .addKey(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'content.mu.addSuc',
            successed: true,
          });
          this.addFieldPopupRef.close();
          this.loadData();
        } else {
          this.appService.showToastSubject.next({
            msg: res.error.detail,
            successed: false,
          });
        }
      });
  }

  // 打开上传弹窗
  openUploadPopup(temp: TemplateRef<any>) {
    this.uploadPopupRef = this.modalService.open(temp, { centered: true });
  }

  // 上传弹窗确认
  onUploadSubmit() {
    this.uploadPopupRef.close();
  }

  // 打开新增语系弹窗
  openAddLanguagePopup(temp: TemplateRef<any>) {
    this.formLanguageGroup.patchValue({
      simplifiedChinese: '',
      traditionalChinese: '',
      english: '',
      name: '',
      code: '',
    });
    this.formLanguageGroup.markAsUntouched();
    this.checked = false;
    this.countryList.forEach((a) => {
      a.checked = false;
      a.countries.forEach((b) => {
        b.checked = false;
      });
    });

    if (this.countryList.length === 0) {
      this.selectApi
        .getCountry()
        .pipe()
        .subscribe((res) => {
          this.countryList = res;
        });
    }
    this.addLanguagePopupRef = this.modalService.open(temp, { centered: true });
  }

  // 打开生成翻译资源弹窗
  openTranslate(temp: TemplateRef<any>) {
    this.translateData.type = 0;
    this.translateData.identifyStr = '';
    this.translateData.isCover = false;
    this.generateTranslateList = [];
    this.modalService.open(temp, {
      centered: true,
      windowClass: 'multilingualism-modal',
    });
  }

  //
  onTranslateSubmit() {
    this.generateLoading = true;
    this.multilingualismApi.geneRateTransLate(this.translateData).subscribe((res) => {
      this.generateLoading = false;
      if (res) {
        this.generateTranslateList = res.map((v) => v.fullUrl);
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'content.mu.reFail',
          successed: false,
        });
      }
    });
  }

  //复制
  onCopy(content: string) {
    if (!content) return;
    const successed = this.clipboard.copy(content);
    this.appService.showToastSubject.next({ msgLang: successed ? 'content.mu.cSuc' : 'content.mu.cFail', successed });
  }

  // 板块
  seletedbkAll(data: any, flag: boolean) {
    data.forEach((v) => (v.checked = flag));
  }

  // 全部
  seletedChangeAll() {
    this.countryList.forEach((a) => {
      a.checked = this.checked;
      a.countries.forEach((b) => {
        b.checked = this.checked;
      });
    });
  }

  // 新增语系弹窗确认
  onAddLanguageSubmit() {
    this.formLanguageGroup.markAllAsTouched();
    if (this.formLanguageGroup.invalid) return;

    const countrys: any = [];
    this.countryList.forEach((a) => {
      a.countries.forEach((b) => {
        if (b.checked) {
          countrys.push(b.countryCode);
        }
      });
    });

    if (countrys.length === 0) {
      this.appService.showToastSubject.next({
        msgLang: 'content.mu.pSelC',
        successed: false,
      });
      return;
    }

    const param = {
      simplifiedChinese: this.formLanguageGroup.value['simplifiedChinese'],
      traditionalChinese: this.formLanguageGroup.value['traditionalChinese'],
      english: this.formLanguageGroup.value['english'],
      name: this.formLanguageGroup.value['name'],
      code: this.formLanguageGroup.value['code'],
      countryUse: this.checked ? 'All' : countrys.join(';'),
    };

    this.loading(true);
    this.multilingualismApi
      .addlanguage(param)
      .pipe(
        finalize(() => {
          this.loading(false);
        })
      )
      .subscribe((res) => {
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'content.mu.addYuSuc',
            successed: true,
          });
          this.addLanguagePopupRef.close();
          this.loadData();
        } else {
          this.appService.showToastSubject.next({
            msg: res.error.detail || 'content.mu.addYuFail',
            successed: false,
          });
        }
      });
  }

  // 删除
  onDel(temp, isDel: boolean) {
    const curCheckedArr = this.list.filter((e) => e.checked);
    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'content.mu.gou', //请勾选需要导出的内容
        successed: false,
      });
    }
    this.delFieldPopupRef = this.modalService.open(temp, { centered: true });
    if (isDel) {
      this.delFieldPopupRef.close();
      const param = curCheckedArr.map((item) => ({
        key: item.key,
        type: item.content[0]?.typeId,
      }));
      this.multilingualismApi
        .delKey({ items: param })
        .pipe(finalize(() => this.loading(false)))
        .subscribe((res) => {
          if (res === true) {
            this.appService.showToastSubject.next({
              msgLang: 'content.ba.suc',
              successed: true,
            });

            this.loadData(true);
          } else {
            this.appService.showToastSubject.next({
              msg: res.error.detail,
              successed: false,
            });
          }
        });
    }
  }
}
