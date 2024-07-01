import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, timer } from 'rxjs';
import { CustomizedTimeService } from 'src/app/pages/user-asset/wallet-history/customized-time-dialog/customized-time.service';
import { DynamicComponentService } from 'src/app/shared/service/dynamic-component.service';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-customize-select',
  templateUrl: './customize-select.component.html',
  styleUrls: ['./customize-select.component.scss'],
})
export class CustomizeSelectComponent implements OnChanges, OnInit {
  constructor(
    private overlay: Overlay,
    private vcRef: ViewContainerRef,
    private dynamicComponentService: DynamicComponentService,
    private customizedTimeService: CustomizedTimeService,
    private generalService: GeneralService,
    private localeService: LocaleService,
  ) {}

  id: string = this.dynamicComponentService.makeID(); // 唯一标识
  expand: boolean = false; //是否已展开
  filterValue!: string;
  timeValueUpdate?: Subscription;

  @Input() label: string = ''; // 标题
  @Input() options: any[] = []; // 下拉对象组成的数组
  @Input() valueKey: string = 'value'; // 下拉对象中，代表值的key
  @Input() textKey: string = 'name'; // 下拉对象中，代表名称的key
  @Input() defaultText: string = this.localeService.getValue('all'); // 匹配的名称为空或不存在时显示
  @Input() width!: string; // 自定义width，最好用em做单位
  @Input() height!: string; // 自定义height
  @Input() minWidth!: string; // 自定义width，最好用em做单位
  @Input() maxWidth!: string; // 自定义width，最好用em做单位
  @Input() iconKey!: string; // 自定义下拉列表每一项的 icon,不传不显示
  @Input() showFilter: boolean = false; //是否显示过滤搜索框
  @Input() timeDance: boolean = false; //时间选择模式
  @Input() useUTC0: boolean = false; //是否使用UTC0时区查询
  @Input() fixedHeight: boolean = false; //默认h5模式高度会变高（用于筛选弹窗），但也可以传fixedHeight从而固定高度
  @Input() disabled: boolean = false; //是否禁用
  @Input() rightArrow: boolean = true; //是否显示右侧下拉箭头
  @Input() readonly: boolean = false; //是否只读
  @Input() fixedOptions: boolean = false; //选项是否全局定位
  @Input() optionsContainerClass: string = ''; //弹出下拉的额外样式
  /** 显示为 Placeholder */
  @Input() showAsPlaceholder: boolean = false;

  @Input() multipleChoice: boolean = false; //是否多选,目前只能配合传入模板使用

  //双向绑定value【【【有回调请使用onSelect来做触发，除非你清楚的知道区别】】】
  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  //双向绑定timeValue【【【有回调请使用onSelect来做触发，除非你清楚的知道区别】】】
  @Input() timeValue: number[] = [];
  @Output() timeValueChange: EventEmitter<number[]> = new EventEmitter();

  //可以绑定onSelect自定义做其它事情
  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onClickInput: EventEmitter<any> = new EventEmitter();

  /** 选择当前已激活项目是否忽略 onSelect 事件 */
  @Input() ignoreDuplicateSelectEvent: boolean = false;

  @Input() itemTemplate!: TemplateRef<any>;
  @Input() optionsTemplate!: TemplateRef<any>;
  @Input() inputTemplate!: TemplateRef<any>;

  overlayRef?: OverlayRef | null;
  @ViewChild('fixedOptionstl') fixedOptionstl!: TemplateRef<unknown>;

  showOverlay() {
    const el = document.querySelector(`.select-${this.id} .input-container`) as Element;
    this.overlayRef = this.overlay.create({
      panelClass: '',
      maxWidth: el.getBoundingClientRect().width,
      backdropClass: '',
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(el)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
        ])
        .withFlexibleDimensions(true),
    });
    this.overlayRef.backdropClick().subscribe(() => this.closeOverlay());
    this.overlayRef.attach(new TemplatePortal(this.fixedOptionstl, this.vcRef));
  }

  closeOverlay() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.timeDance && changes.timeValue && changes.timeValue.currentValue.length < 1) {
      //当 timeValue 为空数组时候，初始化默认值(通常只用于重置，首次加载时候这里执行顺序会低于父组件，所以首次初始化通常要在父组件内写)
      this.onClick(this.options.find(x => x.default));
    }
  }

  ngOnInit(): void {
    if (this.timeDance && this.value && this.value !== 'customize' && !this.timeValueUpdate) {
      this.setStartEndDate(this.value);
    }
  }

  clickInput() {
    this.onClickInput.emit(this);
    if (!this.readonly) {
      if (this.fixedOptions) {
        this.showOverlay();
      } else {
        this.expand = !this.expand;
      }
    }
  }

  onClick = (item: any, active?: boolean) => {
    if (!item) return;
    this.expand = false;
    this.closeOverlay();
    const v = item[this.valueKey];
    if (this.timeDance) {
      this.setStartEndDate(v, item, active);
    }
    // 自定义时间交由customizedTimeService判断是否触发变更
    if (this.timeDance && v === 'customize') return;
    this.valueChange.emit(v);
    this.changeEvent(item, active);
  };

  onCheck = (item: any, active?: boolean) => {
    const v = item[this.valueKey];
    const i = this.value.findIndex((x: any) => x === v);
    const value = this.value || [];
    if (i > -1) {
      value.splice(i, 1);
    } else {
      value.push(v);
    }
    this.valueChange.emit(value);
    this.changeEvent(item, active);
  };

  changeEvent(item: any, active?: boolean) {
    if (this.ignoreDuplicateSelectEvent && active) return;
    //延迟于valueChange执行保证顺序
    setTimeout(() => {
      this.onSelect.emit(item);
    }, 10);
  }

  setStartEndDate(type: string, item?: any, active?: boolean) {
    switch (type) {
      case 'today':
      case '3days':
      case '7days':
      case '30days':
      case '90days':
        this.timeValueUpdate?.unsubscribe();
        this.timeValueUpdate = timer(0, 1000)
          .pipe(untilDestroyed(this))
          .subscribe(x => {
            this.timeValueChange.emit(this.generalService.getStartEndDateArray(type, 'd', this.useUTC0));
          });
        break;
      case 'customize':
        this.customizedTimeService.show(this.timeValue[0], this.timeValue[1], this.useUTC0).subscribe(v => {
          if (v[0] && v[1]) {
            this.timeValueUpdate?.unsubscribe();
            this.valueChange.emit(type);
            this.timeValueChange.emit(v);
            this.changeEvent(item, active);
          }
        });
        break;
    }
  }
}
