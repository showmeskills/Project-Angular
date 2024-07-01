import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { UploadApi } from '../../api/upload.api';
import { Upload, UploadChange, UploadType, UploadURL } from '../../interfaces/upload';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { delay, filter, Observable, of, scan, Subscription, switchMap } from 'rxjs';
import { HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { formatBytes } from '../../models/tools.model';
import { clone } from 'lodash';
import { DefaultDirective } from './default.directive';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { NzImageService } from 'src/app/shared/components/image';
import { DomSanitizer } from '@angular/platform-browser';
import { BytesPipe } from '../../pipes/bytes.pipe';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgTemplateOutlet, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

/**
 * 是否为进度条事件
 * @param event
 */
function isHttpProgressEvent(event: HttpEvent<unknown>): event is HttpProgressEvent {
  return event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.UploadProgress;
}

/**
 * 是否为响应事件
 * @param event
 */
function isHttpResponse<T>(event: HttpEvent<T>): event is HttpResponse<T> {
  return event.type === HttpEventType.Response;
}

/**
 * 上传操作符
 */
export function uploadOperator(
  initUploadValue?: Upload
): (source: Observable<HttpEvent<unknown>>) => Observable<Upload> {
  const initialState: Upload = initUploadValue || {
    state: 'PENDING',
    progress: 0,
  };
  const calculateState = (upload: Upload, event: HttpEvent<unknown>): Upload => {
    if (!event) {
      return {
        ...upload,
        state: 'FAILED',
      };
    }

    if (isHttpProgressEvent(event)) {
      return {
        progress: event.total ? Math.round((100 * event.loaded) / event.total) : upload.progress,
        loaded: event.loaded,
        total: event.total,
        state: 'UPLOADING',
      };
    }

    if (isHttpResponse(event)) {
      return {
        ...upload,
        body: event.body,
        progress: 100,
        state: 'DONE',
      };
    }

    return upload;
  };

  return (source) => source.pipe(scan(calculateState, initialState));
}

function coerceBooleanProperty(value: any): boolean {
  return value != null && `${value}` !== 'false';
}

@Component({
  selector: 'upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [NzImageService],
  // changeDetection: ChangeDetectionStrategy.OnPush, // 一般事件会触发检查更新 异步赋值渲染操作需要手动检查更新
  host: {
    '[class.is-disabled]': 'disabled',
  },
  standalone: true,
  imports: [
    NgTemplateOutlet,
    AngularSvgIconModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    LangPipe,
    SafeUrlPipe,
    BytesPipe,
  ],
})
export class UploadComponent implements OnInit, ControlValueAccessor {
  constructor(
    private api: UploadApi,
    private appService: AppService,
    private modal: NgbModal,
    private modalConfig: NgbModalConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef,
    private lang: LangService,
    private sanitizer: DomSanitizer,
    private imageService: NzImageService,
    @Self() @Optional() public ngControl: NgControl // optional修饰 外部没有提供control也能使用
  ) {
    // 这里提供值访问器
    // 勿删：除非您知道您在做什么！！！
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  /** 默认展示内容 */
  @ContentChild(DefaultDirective, { static: false })
  defaultContent!: DefaultDirective;

  /** 禁止状态 */
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value); // control的disabled可能设置了不同的值 'disabled' || 'false'
  }

  private _disabled = false;

  /** 禁止上传点击Input 可供在外部自定义绑定click事件 */
  @Input() disabledInput = false;

  /** 上传状态 @docs-private */
  _uploadState?: Upload;
  get uploadState() {
    return this._uploadState;
  }

  set uploadState(val: Upload | undefined) {
    this._uploadState = val;
    this._changeDetectorRef.markForCheck();
  }

  /** 允许扩展名 */
  @Input() accept: string[] = ['png', 'jpg', 'jpeg', 'bmp', 'webp'];

  /** 允许扩展名 绑定在html上 */
  @Input() acceptFile = '';

  /** 上传类型 */
  @Input() type: UploadType = 'GameProvider';

  /** 描述 */
  @Input() desc = '600 x 300';

  /** 边距 */
  @HostBinding('style.padding')
  @Input()
  padding = '25px 20px';

  /** 限制大小 kb */
  @Input() limit = 1024;

  /** 是否显示限制大小文字 */
  @Input() showLimitText = true;

  get limitSize() {
    return this.limit * 1024;
  }

  /** 更改状态时延迟多少时长给订阅者 */
  @Input() stateDelay = 1500;

  /** 事件在值更改的时候发出 */
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  /** 上传控制值 */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    // 如果有 / 开头的剔除，避免encode编码转义后再拼接host会出现问题
    if (newValue && newValue.startsWith('/')) {
      newValue = newValue.slice(1);
    }

    this._value = newValue && !newValue.startsWith('http') ? window.encodeURIComponent(newValue) : newValue || '';

    if (!this._value) {
      this.abort();
    }
  }

  private _value = '';

  get filename(): any {
    return this.value ? decodeURIComponent(this.value).split('/').slice(-1)[0] : '';
  }

  /** 上传前回调，返回false停止上传 */
  @Input() beforeUpload?: (file: File) => boolean | Promise<boolean>;

  /** 自定义上传请求 */
  @Input() customUpload?: any;

  /** 自定义上传流 */
  @Input() customRequestSteam?: any;

  /** 上传取值 */
  @Input() field = 'filePath';

  /** 上传类型 */
  @Input() mark: 'video' | 'img' | 'file' = 'img';

  /** View -> model 值改变时回调 changes */
  private _onChange: (value: any) => void = () => {};

  /** View -> model 触摸回调 touched */
  private _onTouch = () => {};

  /** change事件 */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<UploadChange>();

  /** stateChange事件 */
  @Output() stateChange = new EventEmitter<UploadChange>();

  /** close清空值事件 */
  /* eslint-disable-next-line @angular-eslint/no-output-rename */
  @Output('clear') _clear = new EventEmitter<void>();

  /** 图片预览拼接的域名 */
  @Input()
  get domain(): string {
    return this._domain || this.appService.getStaticHost(this.type);
  }

  set domain(v: string) {
    this._domain = v;
  }

  private _domain = '';

  /** 上传流订阅者 */
  private _uploadSb!: Subscription;

  /** 文件节点 */
  @ViewChild('fileDom', { static: true })
  fileDom!: ElementRef<HTMLInputElement>;

  /** 接口返回值自定义绑定 通过返回值进行设定 */
  @Input() mapValue?: (uploadURL: UploadURL) => string | Promise<string>;

  /** 图片预览地址 */
  get previewURL() {
    if (this.value) {
      const file = this.fileDom.nativeElement.files?.[0];

      if (file) {
        return window.URL.createObjectURL(file);
      } else if (!this.value.startsWith('http')) {
        return (this.domain || '') + this.value;
      }
    }

    return this.value;
  }

  /** 是否显示删除文件按钮 */
  @Input() showClear = true;

  ngOnInit(): void {
    this._changeDetectorRef.markForCheck();
  }

  /** 更新value值 */
  updateValue(newValue?: any) {
    this.value = newValue;
    this._onChange(newValue);
    this._onTouch();
    this.valueChange.emit(newValue);
    this._changeDetectorRef.detectChanges(); // 立即触发改变当前和子组件变化检测

    !newValue && (this.fileDom.nativeElement.value = '');
  }

  /** 改变图片上传值 */
  async onChangeValue(fileDom: HTMLInputElement, value?: File) {
    if (this.disabled || this.disabledInput) return;

    if (value instanceof File) {
      const type = value.type.split('/').slice(-1)[0] || '';
      const ext = value.name.split('.').slice(-1)[0] || '';

      let requestSteam: Observable<{ upload: Upload; uploadURL: UploadURL }> | undefined;
      // 上传格式错误，请上传 2.的格式
      let upfail = await this.lang.getOne('components.IncorrectUpload');
      let format = await this.lang.getOne('components.format');
      if (this.accept.length && !(this.accept.includes(ext.toLowerCase()) || this.accept.includes(type.toLowerCase())))
        return this.throwError(`${upfail} ${this.accept.join(' ')} ${format}`);

      const size = this.limit * 1024;
      if (size && size < value.size) {
        // 如果设置限制kb大小提示
        // 请上传文件大小不超过
        let uploadSize = await this.lang.getOne('components.uploadSizeNolargerThan');
        return this.throwError(`${uploadSize} ${formatBytes(this.limitSize)}`);
      }

      // 自定义上传前回调返回false取消
      if (this.beforeUpload) {
        if (!(await this.beforeUpload(value))) return (this.uploadState = undefined);
      }

      // 自定义上传
      if (this.customUpload) {
        this._uploadSb = this.customUpload(value, {
          done: this.updateValue.bind(this),
          progress: this.progress.bind(this),
          state: this._uploadState,
          fileDom,
          vm: this,
        });
        return (this.uploadState = undefined);
      } else if (this.customRequestSteam) {
        const initUploadValue: Upload = {
          state: 'PENDING',
          progress: 0,
          loaded: 0,
          total: value.size,
        };

        requestSteam = this.customRequestSteam(value)
          .pipe(uploadOperator(initUploadValue)) // 自定义处理上传的操作符
          .pipe(tap(this.progress.bind(this)))
          .pipe(
            switchMap(
              (
                state: Upload // 完成或失败延迟等待样式展现后再发射值给订阅者操作
              ) =>
                ['DONE', 'FAILED'].includes(state.state)
                  ? of({
                      upload: state,
                      uploadURL: { [this.field]: value.name },
                    }).pipe(delay(this.stateDelay))
                  : of({
                      upload: state,
                      uploadURL: { [this.field]: value.name },
                    })
            )
          );
      }

      this._uploadSb = (requestSteam || this.uploadFile(value)) // 事件流会自动complete
        .pipe(
          tap((data) => this.stateChange.emit(clone(data))), // change事件 应包含所有状态
          catchError(() =>
            of<any>({
              upload: {
                progress: 100,
                state: 'FAILED',
              },
              uploadURL: { [this.field]: '' },
            })
          ),
          filter(({ upload }) => ['FAILED', 'DONE'].includes(upload.state))
        )
        .subscribe(({ upload, uploadURL }) => {
          this.uploadState = undefined; // 移除上传状态

          upload.state === 'FAILED' && (fileDom.value = ''); // 先清空一遍，否则上传失败value是失败的图片 再次选中相同图片不会触发change事件
          upload.state === 'DONE' && this.updateValue(uploadURL[this.field]);
          this.change.emit({ upload, uploadURL });
        });
    } else {
      this.clear();
    }
  }

  /**
   * 清空值，抛出信息
   */
  throwError(msg: string) {
    this.uploadState = undefined;
    this.updateValue('');

    this.appService.showToastSubject.next({
      msg,
      successed: false,
    });
  }

  /** 中断上传 */
  abort() {
    this._uploadSb && this._uploadSb.unsubscribe();
    this.fileDom.nativeElement.value = '';
    this.uploadState = undefined; // 移除上传状态
  }

  /** 上传图片 */
  uploadFile(imgFile: File) {
    // 直接赋值 先改变状态呈现样式
    const initUploadValue: Upload = {
      state: 'PENDING',
      progress: 0,
      loaded: 0,
      total: imgFile.size,
    };
    const getUploadURL$ = this.api.getUploadURL(this.type, imgFile.name, this.mark);

    this.uploadState = initUploadValue;

    return getUploadURL$.pipe(
      switchMap((uploadURL) =>
        this.api
          .upload(uploadURL, imgFile, {
            reportProgress: true,
            observe: 'events',
          })
          .pipe(uploadOperator(initUploadValue)) // 自定义处理上传的操作符
          .pipe(tap(this.progress.bind(this)))
          .pipe(
            switchMap(
              (
                state: Upload // 完成或失败延迟等待样式展现后再发射值给订阅者操作
              ) =>
                ['DONE', 'FAILED'].includes(state.state)
                  ? of({ upload: state, uploadURL }).pipe(delay(this.stateDelay))
                  : of({ upload: state, uploadURL })
            )
          )
      )
    );
  }

  // TODO 后期计划实现拖拽上传提高用户体验

  /** 进度操作 */
  progress = (upload) => {
    this.uploadState = upload;
    if (upload.state === 'FAILED') {
      this.appService.showToastSubject.next({
        msg: '上传失败！',
        successed: false,
        duration: 5e3,
      });
    }
  };

  onPreview(dom: any) {
    if (typeof dom === 'string') {
      this.imageService.preview([{ src: this.sanitizer.bypassSecurityTrustUrl(dom) as string }]);
      return;
    }

    this.modal.open(dom, {
      size: 'lg',
      centered: true,
      windowClass: 'upload-preview-modal',
    });
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // control的disabled状态 new FormControl({value: null, disabled: false})
    this._disabled = isDisabled;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFileInputClick($event: MouseEvent) {
    // const target = $event.target || $event.srcElement;
    // 点击触发Control的touch
    // if (!target?.['value']?.length) {
    //   this.ngControl.control?.markAsTouched({onlySelf: true})
    // }
  }

  clear() {
    this.updateValue();
    this._clear.emit();
    this.abort();
  }
}
