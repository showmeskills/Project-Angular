import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'customize-button',
  templateUrl: './customize-button.component.html',
  styleUrls: ['./customize-button.component.scss'],
  host: {
    '[style.width]': 'width',
    '[style.min-width]': 'minWidth',
    '[class.keep-color]': 'awayTheme',
  },
})
export class CustomizeButtonComponent implements OnInit {
  constructor() {}

  /**图标 */
  @Input() icon!: string;
  /**宽度 */
  @Input() width!: string;
  /**最小宽度 */
  @Input() minWidth!: string;
  /**类型
   * primary 主要
   * default 次要（默认值）
   * text 无色无框，纯文字，仅hover变色
   */
  @Input() type: 'primary' | 'text' | 'plain-text' | 'default' = 'default';
  /**大小 */
  @Input() size: 'large' | 'medium' | 'medium-small' | 'small' | 'mini' = 'medium';
  /**圆角 */
  @Input() radius: string = '4px';
  /**边框型按钮。会在类型的基础上淡化背景色，无边框的会加上边框*/
  @Input() plain!: boolean;
  /**是否加载中 */
  @Input() loading!: boolean;
  /**是否激活（相当于hover） */
  @Input() active!: boolean;
  /**是否禁用 */
  @Input() disabled!: boolean;
  /**脱离主题 */
  @Input() awayTheme: boolean = false;

  /**点击事件 */
  @Output() onClick: EventEmitter<MouseEvent> = new EventEmitter();
  @Output() onReady: EventEmitter<MouseEvent> = new EventEmitter();

  click(e: MouseEvent) {
    if (this.loading || this.disabled) return;
    this.onClick.emit(e);
  }

  ngOnInit(): void {
    this.onReady.emit();
  }
}
