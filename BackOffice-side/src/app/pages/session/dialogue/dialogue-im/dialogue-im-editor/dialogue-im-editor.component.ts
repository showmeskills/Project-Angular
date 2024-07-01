import {
  afterRender,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogueImEmojiComponent } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-emoji/dialogue-im-emoji.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { SessionMsgTypeEnum, SessionSendEvent } from 'src/app/shared/interfaces/session';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { DialogueImEditorService } from 'src/app/pages/session/dialogue/dialogue-im/dialogue-im-editor/dialogue-im-editor.service';
import { SessionApi } from 'src/app/shared/api/session.api';
import { filter, of } from 'rxjs';

@Component({
  selector: 'im-editor',
  standalone: true,
  imports: [CommonModule, DialogueImEmojiComponent, LangPipe, ReactiveFormsModule, SvgIconComponent, FormsModule],
  templateUrl: './dialogue-im-editor.component.html',
  styleUrls: ['./dialogue-im-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DialogueImEditorComponent,
      multi: true,
    },
    DialogueImEditorService,
  ],
})
export class DialogueImEditorComponent implements ControlValueAccessor, OnInit {
  appService = inject(AppService);
  modal = inject(MatModal);
  editorService = inject(DialogueImEditorService);
  api = inject(SessionApi);

  @ViewChild('inputRef') inpRef: ElementRef<HTMLTextAreaElement>;

  /**
   * 回车发送消息
   */
  @Input() enterSend = true;

  /**
   * 显示发送按钮
   */
  @Input() showSendBtn = true;

  /**
   * 最大输入长度
   */
  @Input() maxLength = 5_000;

  /**
   * 最大文件长度
   */
  get maxFileLength() {
    return this.editorService.maxFileLength;
  }

  @Input('maxFileLength') set maxFileLength(v: number) {
    this.editorService.maxFileLength = v;
  }

  /**
   * 输入框高度
   */
  @Input() minH = '100px';
  @Input() maxH = '200px';

  /**
   * 发送消息
   */
  @Output() send = new EventEmitter<SessionSendEvent>();

  /**
   * 输入触发
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<void>();

  task: Array<Function> = [];
  /**
   * 显示表情
   */
  showEmoji = false;

  #value = '';

  get inputMsg() {
    // return this.#value;
    return this.inpRef.nativeElement.innerText || '';
  }

  set inputMsg(v) {
    if ((this.inpRef.nativeElement.innerText || '') !== v) {
      this.inpRef.nativeElement.innerText = v;
      // this.onChange(v);
    }
  }

  constructor() {
    // 读写dom之后的操作，会频繁触发，dom初始化之后请换afterNextRender
    afterRender(() => this.task.shift()?.());
  }

  ngOnInit() {}

  sendMsg(ev?: MouseEvent) {
    ev?.stopPropagation();

    const msg = this.inputMsg.trim();
    // 不能发送空白消息
    if (!msg.length && !this.editorService.fileList.length) {
      this.inputMsg = '';
      return this.appService.showToastSubject.next({ msgLang: 'session.sendNullMsgTips' });
    } else if (msg.length > this.maxLength) {
      return this.appService.showToastSubject.next({ msgLang: 'form.sendLimitTips', msgArgs: { n: this.maxLength } });
    }

    // 发送消息要设置文件内容并替换
    const sendData = this.editorService.getSendContent(this.inpRef.nativeElement);
    const { content } = sendData;

    if (!content) return this.appService.showToastSubject.next({ msgLang: 'session.sendNullMsgTips' });
    const data = { ...sendData };

    this.send.emit({ msg: content, data, done: () => (this.inpRef.nativeElement.innerHTML = '') });
  }

  /**
   * 选择表情
   * @param emoji
   */
  onSelectEmoji(emoji: string) {
    this.showEmoji = false;
    if (!emoji) return;

    this.task.push(() => {
      this.inpRef.nativeElement.focus();
      this.insertContent(emoji);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange(v: string) {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched() {}
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(obj: any): void {
    this.#value = obj;
  }

  /**
   * 粘贴事件
   */
  onPaste(ev: ClipboardEvent) {
    ev.preventDefault();

    let text = ev.clipboardData?.getData('text/plain') || '';
    if (!text) return; // 没有内容

    document.execCommand('insertText', false, text);
  }

  /**
   * 拖拽事件
   * @param $event
   */
  onDragend($event: DragEvent) {
    $event.preventDefault();
  }

  /**
   * 失去焦点
   */
  range = document.createRange();
  focusNode: Node | null = null;
  onBlur() {
    this.onTouched();
    this.saveRange();
  }

  /**
   * 保存光标位置
   */
  saveRange() {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);

    if (!this.inpRef.nativeElement.contains(range.startContainer)) return;
    this.range = range;
    this.focusNode = selection.focusNode;
  }

  /**
   * 输入事件
   */
  onInput() {
    this.editorService.updateFileList(this.inpRef.nativeElement);
    this.change.emit();
  }

  /**
   * 按键事件
   * @param e
   */
  onKeydown(e: Event) {
    const ev = e as KeyboardEvent;

    if (ev.key === 'Enter' && !(ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey)) {
      if (this.enterSend) {
        ev.preventDefault();
        this.sendMsg();
        this.range = document.createRange();
        this.range.selectNodeContents(this.inpRef.nativeElement);
      }
    } else {
      this.saveRange();
    }
  }

  /**
   * 设置光标到末尾
   */
  setFocusEnd() {
    this.inpRef.nativeElement.focus();

    const selection = window.getSelection()!;
    const range = document.createRange();

    range.selectNodeContents(this.inpRef.nativeElement);
    range.collapse(false); // 不折叠到开始
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * 设置光标
   */
  setFocus() {
    const inpEl = this.inpRef.nativeElement;
    const selection = window.getSelection()!;
    // 尝试获取之前的光标位置
    let range = this.range;
    const startOffset = range.startOffset;

    // 如果获取光标位置失败 则将光标移动到末尾
    if (isNaN(+startOffset) || startOffset < 0 || !this.focusNode) {
      this.setFocusEnd();
    } else {
      // 如果元素内容为空
      if (!inpEl.firstChild) {
        inpEl.insertBefore(document.createTextNode(''), null); // \u200B 是零宽度空格字符会被计算长度，考虑后期会被计算到其他问题这里不用
      }

      // 将光标移动到之前的位置
      range.setStart(this.focusNode, startOffset);
      range.setEnd(this.focusNode, range.endOffset);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    this.inpRef.nativeElement.focus();
  }

  /**
   * 插入内容
   * @param v
   */
  insertContent(v: string | Node) {
    if (!v) return;

    const selection = window.getSelection()!;
    const range = this.range;

    const node = v instanceof Node ? v : document.createTextNode(v);
    if (!this.inpRef.nativeElement.contains(range.startContainer)) range.selectNodeContents(this.inpRef.nativeElement);
    range.deleteContents();
    range.insertNode(node);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    this.inpRef.nativeElement.focus();

    // 解决图片加载完成后滚动高度问题
    setTimeout(() => {
      Array.from(this.inpRef.nativeElement.getElementsByTagName('img')).forEach((e) => {
        e.onload = () => this.change.emit();
      });
    });

    this.editorService.updateFileList(this.inpRef.nativeElement);
    this.change.emit();
  }

  onClick(ev: MouseEvent) {
    ev.stopPropagation(); // 阻止冒泡到父级触发点击事件
    this.saveRange();
  }

  /**
   * 打开上传
   */
  openUpload(type: SessionMsgTypeEnum) {
    this.showEmoji = false;

    (this.editorService.uploadFile(type) || of(null))
      .pipe(filter((e): e is DocumentFragment => e instanceof DocumentFragment))
      .subscribe((fragment) => {
        return this.insertContent(fragment);
      });
  }

  protected readonly SessionMsgTypeEnum = SessionMsgTypeEnum;
}
