import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

interface TextArr {
  text: string;
  isLink?: boolean;
  clickIndex?: number;
}

@Component({
  selector: 'app-customize-text',
  templateUrl: './customize-text.component.html',
  styleUrls: ['./customize-text.component.scss'],
})
export class CustomizeTextComponent implements OnInit {
  constructor() {}

  /** 传入text*/
  @Input() text!: string;

  /** 自定义模版*/
  @Input() textTemplate!: TemplateRef<any>;

  /** 拆分text */
  textArr: TextArr[] = [];

  /** 点击  */
  @Output() onClick: EventEmitter<number> = new EventEmitter();

  ngOnInit(): void {
    this.textArr = this.combineText();
  }

  /**
   * 点击红色字体时间
   *
   * @param clickIndex 下标
   */
  handleClick(clickIndex: number) {
    this.onClick.emit(clickIndex);
  }

  /** 组合字段 */
  combineText() {
    const returnArr: any[] = [];
    const textExp = new RegExp(/※{.*?}※/g);
    const linkTextArr: any = this.text.match(textExp)?.map((text, i) => ({
      text: text.replace('※{', '').replace('}※', ''),
      isLink: true,
      clickIndex: i,
    }));

    this.text
      .split(textExp)
      ?.map(text => ({
        text,
        isLink: false,
      }))
      .map((item: any, i: number) => {
        returnArr.push(item, linkTextArr[i]);
      });
    return returnArr.filter(item => item);
  }
}
