import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, FormArray, FormArrayName, NgControl } from '@angular/forms';
import { LangTabService } from 'src/app/shared/components/lang-tab/lang-tab.service';
import { Language } from 'src/app/shared/interfaces/zone';
import { AppService } from 'src/app/app.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { SelectGroupComponent } from '../select-group/select-group.component';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  template: `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">{{ 'common.prompt' | lang }}</div>

        <div class="c-btn-close" (click)="modal.dismiss()">
          <svg-icon [src]="'./assets/images/svg/admin-close.svg'" class="svg-icon"></svg-icon>
        </div>
      </div>

      <div class="modal-body">
        <svg-icon [src]="'./assets/images/svg/warning.svg'" class="svg-icon svg-icon-7x mt-8"></svg-icon>
        <p class="fz-16 mt-8">{{ 'components.langDelTip' | lang }}</p>
      </div>

      <div class="modal-footer btn-wrap">
        <button type="button" class="c-btn btn btn-light" (click)="modal.dismiss()">
          {{ 'common.cancel' | lang }}
        </button>
        <button type="button" class="c-btn btn btn-primary" (click)="modal.close({ value: true })">
          {{ 'common.confirm' | lang }}
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [AngularSvgIconModule, LangModule],
})
export class LanguageWarningComponent implements OnInit {
  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {}
}

@Component({
  selector: 'lang-tab',
  templateUrl: './lang-tab.component.html',
  styleUrls: ['./lang-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [MatTabsModule, NgFor, NgIf, AngularSvgIconModule, SelectGroupComponent, NgTemplateOutlet],
})
export class LangTabComponent implements OnInit, ControlValueAccessor, OnDestroy {
  constructor(
    private cdRef: ChangeDetectorRef,
    private appService: AppService,
    private modal: NgbModal,
    @Optional() private formArrayName: FormArrayName,
    public service: LangTabService,
    @Self() @Optional() public ngControl: NgControl
  ) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  @Input() selection = 'zh-cn';
  get curCode() {
    return this.selection;
  }

  set curCode(v: string) {
    this.selection = v;
    this.selectionChange.emit(v);
  }

  public get langIndex(): number {
    return this.langTabList.findIndex((e) => e.code === this.curCode);
  }

  showEditTab = false;
  @ContentChild(TemplateRef) ref!: TemplateRef<any>;

  @Output() languageChange = new EventEmitter();
  @Output() selectionChange = new EventEmitter<string>();

  @Input() edit = true;
  @Input() formArray!: FormArray;

  /** getters */
  get langTabList(): Language[] {
    return this.service.list.filter((j) => this.value.includes(j.code) || j.code === 'zh-cn');
  }

  public get curLang(): Language | undefined {
    return this.service.list.find((e) => e.code === this.curCode);
  }

  /** lifeCycle */
  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.value = [];
  }

  /** methods */
  private _change = () => {};
  private _touched = () => {};
  private _value = ['zh-cn'];

  @Output() valueChange = new EventEmitter<string[]>();
  @Input('value')
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    this._value = newValue;
    this.valueChange.emit(newValue);
  }

  findIndex(code: string): number {
    return this.value.findIndex((e) => e === code);
  }

  onLanguageChange(languages: Language[]): void {
    if (!languages.length)
      // 需要选中一个语种
      return this.appService.showToastSubject.next({
        msgLang: 'components.languageNeed',
        successed: false,
      });

    const lang = languages.map((e) => e.code);
    const hasRemove = !this.value.every((e) => lang.includes(e)); // 是否有移除语言情况
    const some = this.value.every((e) => lang.includes(e)) && this.value.length === languages.length; // 是否有更新情况

    if (some) return; // 与更新前相同

    const done = () => {
      if (!lang.some((e) => e === this.curCode)) this.curCode = lang[0]; // 当前选中的语言被删除了默认显示第一条语言

      this.value = lang;
      this.languageChange.emit(lang);
    };

    if (hasRemove) {
      // 有删除 警告确认再赋值
      this.modal.open(LanguageWarningComponent, { centered: true }).result.then(({ value }) => {
        value && done();
      });
    } else {
      done();
    }
  }

  check() {
    if (!this.formArrayName && !this.formArray) return;
    const langArrayForm: any = this.formArray?.value?.length ? this.formArray : this.formArrayName.control;

    const curOriginIndex = this.value.findIndex((e) => e === this.curCode); // 找到相应传递进来的index

    if (
      ![...langArrayForm.controls].some((e) => e.invalid) || // 语言通过验证了
      langArrayForm.controls[curOriginIndex].invalid // 当前语言没通过
    )
      return; // 直接退出

    langArrayForm.controls.some((e, i) => {
      // 语言未填写完整切换到相应语言索引，提高用户体验
      if (e.invalid) this.curCode = this.value[i];
      return e.invalid; // 找到未通过验证停止遍历
    });
  }

  registerOnChange(fn: any): void {
    this._change = fn;
  }

  registerOnTouched(fn: any): void {
    this._touched = fn;
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledState(isDisabled: boolean): void {}
}
