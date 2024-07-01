import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-customize-textarea,[customize-textarea]',
  templateUrl: './customize-textarea.component.html',
  styleUrls: ['./customize-textarea.component.scss'],
})
export class CustomizeTextareaComponent implements OnInit, AfterViewInit {
  constructor() {}

  changeSubject: Subject<string> = new Subject();

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  @Input() label: string = ''; // 标题
  @Input() width!: string; // 自定义width，最好用em做单位
  @Input() placeholder: string = ''; // 提示占位文字
  @Input() onChangeDebounceTime: number = 0;
  @Input() disabled: boolean = false; //是否禁用
  @Input() readonly: boolean = false; //是否只读
  @Input() autoFocus: boolean = false; //是否自动焦点，通常用于弹窗
  @Input() trim: boolean = true; //是否自动忽略前后空格
  @Input() row: number = 10; // 默认行数（高度）
  @Input() max: number | null = null; //最大输入字符数量默认无限制

  //双向绑定value
  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  //可以绑定onChange自定义做其它事情,注意：从父组件进行的改变它不会被触发
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.changeSubject.pipe(debounceTime(this.onChangeDebounceTime), untilDestroyed(this)).subscribe(v => {
      this.onChange.emit(v);
    });
  }

  ngAfterViewInit() {
    this.autoFocus &&
      setTimeout(() => {
        this.textarea.nativeElement.focus();
      }, 0);
  }

  change(v: string) {
    this.trim && (v = v.trim());
    this.value = v;
    this.valueChange.emit(v);
    this.changeSubject.next(v);
  }
}
