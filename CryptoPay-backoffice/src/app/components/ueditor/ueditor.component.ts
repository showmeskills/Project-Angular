import {
  Component,
  Input,
  forwardRef,
  OnDestroy,
  EventEmitter,
  Output,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  NgZone,
  Inject,
  SimpleChange,
  SkipSelf,
  Optional,
} from '@angular/core';
import { DOCUMENT, NgIf } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { InputNumber } from '@ng-util/util';
import { UEditorConfig } from 'src/app/components/ueditor/ueditor.config';
import { NuLazyService } from '@ng-util/lazy';
import { EditorToolService } from 'src/app/components/ueditor/tools/tools.service';
import { UploadType } from 'src/app/shared/interfaces/upload';
import { LangService } from 'src/app/shared/components/lang/lang.service';

const isSSR = !(typeof document === 'object' && !!document);
let _hook_finished = false;

export type EventTypes =
  | 'destroy'
  | 'reset'
  | 'focus'
  | 'langReady'
  | 'beforeExecCommand'
  | 'afterExecCommand'
  | 'firstBeforeExecCommand'
  | 'beforeGetContent'
  | 'afterGetContent'
  | 'getAllHtml'
  | 'beforeSetContent'
  | 'afterSetContent'
  | 'selectionchange'
  | 'beforeSelectionChange'
  | 'afterSelectionChange';

@Component({
  selector: 'ueditor',
  template: `
    <textarea id="{{ id }}" class="ueditor-textarea"></textarea>
    <div *ngIf="loading" class="loading" [innerHTML]="loadingTip"></div>
  `,
  preserveWhitespaces: false,
  styles: [
    `
      :host {
        line-height: initial;
      }

      :host .ueditor-textarea {
        display: none;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UEditorComponent),
      multi: true,
    },
    // UEditor,
    EditorToolService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf],
})
export class UEditorComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    this.setDisabled();
  }

  constructor(
    private lazySrv: NuLazyService,
    private cog: UEditorConfig,
    @Inject(DOCUMENT) private doc: any,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    // private ue: UEditor,
    @SkipSelf() @Optional() private toolService: EditorToolService,
    public lang: LangService
  ) {}

  /**
   * 获取UE实例
   */
  get Instance(): any {
    return this.instance;
  }

  private instance: any;
  private value!: string;
  private inited = false;
  private events: any = {};
  private isDestroy = false;

  loading = true;
  id = `_ueditor-${Math.random().toString(36).substring(2)}`;

  @Input() config: any;
  @Input() loadingTip = '加载中...';
  @Input() type: UploadType = 'Article'; // 上传类型
  private _disabled = false;
  @Input() @InputNumber() delay = 50;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() readonly onPreReady = new EventEmitter<UEditorComponent>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() readonly onReady = new EventEmitter<UEditorComponent>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() readonly onDestroy = new EventEmitter();

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private _getWin(): any {
    return this.doc.defaultView || window;
  }

  ngOnInit(): void {
    this.inited = true;
  }

  ngAfterViewInit(): void {
    if (isSSR) {
      return;
    }
    // 已经存在对象无须进入懒加载模式
    if (this._getWin().UE) {
      this.initDelay();
      return;
    }

    this.lazySrv.monitor(this.cog.js).subscribe(() => this.initDelay());
    this.lazySrv.load(this.cog.js!);
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges): void {
    if (this.inited && changes.config) {
      this.destroy();
      this.initDelay();
    }
  }

  private initDelay(): void {
    setTimeout(() => this.init(), this.delay);
  }

  private async init(): Promise<void> {
    const UE = this._getWin().UE;
    if (!UE) {
      throw new Error('uedito js文件加载失败');
    }

    if (this.instance) {
      return;
    }

    // registrer hook
    if (this.cog.hook && !_hook_finished) {
      _hook_finished = true;
      this.cog.hook(UE);
    }

    this.onPreReady.emit(this);
    const lang = this.lang.isLocal ? 'zh-cn' : 'en';
    const opt = { ...this.cog.options, ...this.config, lang };

    await this.zone.runOutsideAngular(async () => {
      if (this.isDestroy) return;
      // this.ue.value = UE; // 给ue服务添加值

      let ueditor = UE?.getEditor(this.id, opt);

      if (!UE?.getEditor) {
        // 重新赋值情况可能，UE又被加载了一次，尝试延迟再执行
        console.warn(UE, 'UE is not ready, retry after 1s');
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        ueditor = UE.getEditor(this.id, opt);
      }

      if (!ueditor) {
        throw new Error('ueditor 初始化失败');
      }

      this.toolService.init(UE, ueditor);
      this.toolService.registryButton(UE, this.type);

      ueditor.ready(async () => {
        this.instance = ueditor;

        if (this.value) {
          this.instance.setContent(this.value);
        }

        this.onReady.emit(this);
      });

      ueditor.addListener('contentChange', () => {
        this.value = ueditor.getContent();

        this.zone.run(() => this.onChange(this.value));
      });

      // 失去焦点触发touched 用于外部touched进行验证
      ueditor.addListener('blur', () => {
        this.zone.run(() => this.onTouched());
      });
    });

    this.loading = false;
    this.cd.detectChanges();
  }

  destroy(): void {
    this.isDestroy = true;
    // this.ue.destroy();

    if (this.instance) {
      this.zone.runOutsideAngular(() => {
        Object.keys(this.events).forEach((name) => this.instance.removeListener(name, this.events[name]));
        this.instance.removeListener('ready');
        this.instance.removeListener('contentChange');
        // 由于此时 Angular 已经移除 DOM，可能会引起内部无法访问产生异常
        // https://github.com/cipchk/ngx-ueditor/issues/62
        try {
          this.instance.ui.setFullScreen(false); // 被销毁时移除全屏状态，如果处理全屏内部找不到tool状态会报错
          this.instance.destroy();
          this.instance = null;
        } catch (error) {
          console.error(error);
        }
      });
    }

    this.onDestroy.emit();
  }

  private setDisabled(): void {
    if (!this.instance) {
      return;
    }
    if (this._disabled) {
      this.instance.setDisabled();
    } else {
      this.instance.setEnabled();
    }
  }

  /**
   * 设置编辑器语言
   */
  setLanguage(lang: 'zh-cn' | 'en'): PromiseLike<void> {
    const UE = this._getWin().UE;
    return this.lazySrv.load(`${this.cog.options!.UEDITOR_HOME_URL}/lang/${lang}/${lang}.js`).then(() => {
      this.destroy();

      // 清空语言
      if (!UE._bak_I18N) {
        UE._bak_I18N = UE.I18N;
      }
      UE.I18N = {};
      UE.I18N[lang] = UE._bak_I18N[lang];

      this.initDelay();
    });
  }

  /**
   * 添加编辑器事件
   */
  addListener(eventName: EventTypes, fn: any): void {
    if (this.events[eventName]) {
      return;
    }
    this.events[eventName] = fn;
    this.instance.addListener(eventName, fn);
  }

  /**
   * 移除编辑器事件
   */
  removeListener(eventName: EventTypes): void {
    if (!this.events[eventName]) {
      return;
    }
    this.instance.removeListener(eventName, this.events[eventName]);
    delete this.events[eventName];
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  writeValue(value: string): void {
    this.value = value;
    if (this.instance) {
      this.instance.setContent(this.value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.setDisabled();
  }
}
