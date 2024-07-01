/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction } from '@angular/cdk/bidi';
import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

export enum NzBreakpointEnum {
  xxl = 'xxl',
  xl = 'xl',
  lg = 'lg',
  md = 'md',
  sm = 'sm',
  xs = 'xs',
}

interface MonacoEnvironment {
  globalAPI?: boolean;
  baseUrl?: string;
  getWorker?(workerId: string, label: string): Promise<Worker> | Worker;
  getWorkerUrl?(workerId: string, label: string): string;
}

export interface NzConfig {
  affix?: AffixConfig;
  select?: SelectConfig;
  alert?: AlertConfig;
  anchor?: AnchorConfig;
  avatar?: AvatarConfig;
  backTop?: BackTopConfig;
  badge?: BadgeConfig;
  button?: ButtonConfig;
  card?: CardConfig;
  carousel?: CarouselConfig;
  cascader?: CascaderConfig;
  codeEditor?: CodeEditorConfig;
  collapse?: CollapseConfig;
  collapsePanel?: CollapsePanelConfig;
  datePicker?: DatePickerConfig;
  descriptions?: DescriptionsConfig;
  drawer?: DrawerConfig;
  dropDown?: DropDownConfig;
  empty?: EmptyConfig;
  filterTrigger?: FilterTriggerConfig;
  form?: FormConfig;
  icon?: IconConfig;
  message?: MessageConfig;
  modal?: ModalConfig;
  notification?: NotificationConfig;
  pageHeader?: PageHeaderConfig;
  pagination?: PaginationConfig;
  progress?: ProgressConfig;
  rate?: RateConfig;
  segmented?: SegmentedConfig;
  space?: SpaceConfig;
  spin?: SpinConfig;
  switch?: SwitchConfig;
  table?: TableConfig;
  tabs?: TabsConfig;
  timePicker?: TimePickerConfig;
  tree?: TreeConfig;
  treeSelect?: TreeSelectConfig;
  typography?: TypographyConfig;
  image?: ImageConfig;
  popconfirm?: PopConfirmConfig;
  popover?: PopoverConfig;
  imageExperimental?: ImageExperimentalConfig;
  prefixCls?: PrefixCls;
}

export interface PrefixCls {
  prefixCls?: string;
  iconPrefixCls?: string;
}

export interface SelectConfig {
  nzBorderless?: boolean;
  nzSuffixIcon?: TemplateRef<any> | string | null;
  nzBackdrop?: boolean;
}

export interface AffixConfig {
  nzOffsetBottom?: number;
  nzOffsetTop?: number;
}

export interface AlertConfig {
  nzCloseable?: boolean;
  nzShowIcon?: boolean;
}

export interface AvatarConfig {
  nzShape?: any;
  nzSize?: any | number;
  nzGap?: number;
}

export interface AnchorConfig {
  nzBounds?: number;
  nzOffsetBottom?: number;
  nzOffsetTop?: number;
  nzShowInkInFixed?: boolean;
}

export interface BackTopConfig {
  nzVisibilityHeight?: number;
}

export interface BadgeConfig {
  nzColor?: number;
  nzOverflowCount?: number;
  nzShowZero?: number;
}

export interface ButtonConfig {
  nzSize?: 'large' | 'default' | 'small';
}

export interface CodeEditorConfig {
  assetsRoot?: string | SafeUrl;
  extraConfig?: any;
  defaultEditorOption?: any;
  useStaticLoading?: boolean;
  monacoEnvironment?: MonacoEnvironment;

  onLoad?(): void;

  onFirstEditorInit?(): void;

  onInit?(): void;
}

export interface CardConfig {
  nzSize?: any;
  nzHoverable?: boolean;
  nzBordered?: boolean;
  nzBorderless?: boolean;
}

export interface CarouselConfig {
  nzAutoPlay?: boolean;
  nzAutoPlaySpeed?: boolean;
  nzDots?: boolean;
  nzEffect?: 'scrollx' | 'fade' | string;
  nzEnableSwipe?: boolean;
  nzVertical?: boolean;
}

export interface CascaderConfig {
  nzSize?: string;
  nzBackdrop?: boolean;
}

export interface CollapseConfig {
  nzAccordion?: boolean;
  nzBordered?: boolean;
  nzGhost?: boolean;
}

export interface CollapsePanelConfig {
  nzShowArrow?: boolean;
}

export interface DatePickerConfig {
  nzSeparator?: string;
  nzSuffixIcon?: string | TemplateRef<any>;
  nzBackdrop?: boolean;
}

export interface DescriptionsConfig {
  nzBordered?: boolean;
  nzColumn?: { [key in NzBreakpointEnum]?: number } | number;
  nzSize?: 'default' | 'middle' | 'small';
  nzColon?: boolean;
}

export interface DrawerConfig {
  nzMask?: boolean;
  nzMaskClosable?: boolean;
  nzCloseOnNavigation?: boolean;
  nzDirection?: Direction;
}

export interface DropDownConfig {
  nzBackdrop?: boolean;
}

export interface EmptyConfig {
  nzDefaultEmptyContent?: Type<any> | TemplateRef<string> | string | undefined;
}

export interface FilterTriggerConfig {
  nzBackdrop?: boolean;
}

export interface FormConfig {
  nzNoColon?: boolean;
  nzAutoTips?: Record<string, Record<string, string>>;
  nzTooltipIcon?: string | { type: string; theme: any };
}

export interface IconConfig {
  nzTheme?: 'fill' | 'outline' | 'twotone';
  nzTwotoneColor?: string;
}

export interface MessageConfig {
  nzAnimate?: boolean;
  nzDuration?: number;
  nzMaxStack?: number;
  nzPauseOnHover?: boolean;
  nzTop?: number | string;
  nzDirection?: Direction;
}

export interface ModalConfig {
  nzMask?: boolean;
  nzMaskClosable?: boolean;
  nzCloseOnNavigation?: boolean;
  nzDirection?: Direction;
}

export interface NotificationConfig extends MessageConfig {
  nzTop?: string | number;
  nzBottom?: string | number;
  nzPlacement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
}

export interface PageHeaderConfig {
  nzGhost: boolean;
}

export interface PaginationConfig {
  nzSize?: 'default' | 'small';
  nzPageSizeOptions?: number[];
  nzShowSizeChanger?: boolean;
  nzShowQuickJumper?: boolean;
  nzSimple?: boolean;
}

export interface ProgressConfig {
  nzGapDegree?: number;
  nzGapPosition?: 'top' | 'right' | 'bottom' | 'left';
  nzShowInfo?: boolean;
  nzStrokeSwitch?: number;
  nzStrokeWidth?: number;
  nzSize?: 'default' | 'small';
  nzStrokeLinecap?: 'round' | 'square';
  nzStrokeColor?: string;
}

export interface RateConfig {
  nzAllowClear?: boolean;
  nzAllowHalf?: boolean;
}

export interface SegmentedConfig {
  nzSize?: any;
}

export interface SpaceConfig {
  nzSize?: 'small' | 'middle' | 'large' | number;
}

export interface SpinConfig {
  nzIndicator?: TemplateRef<any>;
}

export interface SwitchConfig {
  nzSize: any;
}

export interface TableConfig {
  nzBordered?: boolean;
  nzSize?: any;
  nzShowQuickJumper?: boolean;
  nzLoadingIndicator?: TemplateRef<any>;
  nzShowSizeChanger?: boolean;
  nzSimple?: boolean;
  nzHideOnSinglePage?: boolean;
}

export interface TabsConfig {
  nzAnimated?:
    | boolean
    | {
        inkBar: boolean;
        tabPane: boolean;
      };
  nzSize?: any;
  nzType?: 'line' | 'card';
  nzTabBarGutter?: number;
  nzShowPagination?: boolean;
}

export interface TimePickerConfig {
  nzAllowEmpty?: boolean;
  nzClearText?: string;
  nzNowText?: string;
  nzOkText?: string;
  nzFormat?: string;
  nzHourStep?: number;
  nzMinuteStep?: number;
  nzSecondStep?: number;
  nzPopupClassName?: string;
  nzUse12Hours?: string;
  nzSuffixIcon?: string | TemplateRef<any>;
  nzBackdrop?: boolean;
}

export interface TreeConfig {
  nzBlockNode?: boolean;
  nzShowIcon?: boolean;
  nzHideUnMatched?: boolean;
}

export interface TreeSelectConfig {
  nzShowIcon?: string;
  nzShowLine?: boolean;
  nzDropdownMatchSelectWidth?: boolean;
  nzHideUnMatched?: boolean;
  nzSize?: 'large' | 'small' | 'default';
  nzBackdrop?: boolean;
}

export interface TypographyConfig {
  nzEllipsisRows?: number;
  nzCopyTooltips?: [any, any] | null;
  nzCopyIcons: [any, any];
  nzEditTooltip?: null | any;
  nzEditIcon: any;
}

export interface ImageConfig {
  nzFallback?: string;
  nzPlaceholder?: string;
  nzDisablePreview?: string;
  nzCloseOnNavigation?: boolean;
  nzDirection?: Direction;
}

export interface ImageExperimentalConfig {
  nzFallback?: string;
  nzPlaceholder?: string;
  nzDisablePreview?: string;
  nzCloseOnNavigation?: boolean;
  nzDirection?: Direction;
  nzAutoSrcset?: boolean;
  nzSrcLoader?(params: { src: string; width: number }): string;
}

export interface PopConfirmConfig {
  nzPopconfirmBackdrop?: boolean;
  nzAutofocus?: null | 'ok' | 'cancel';
}

export interface PopoverConfig {
  nzPopoverBackdrop?: boolean;
}

export type NzConfigKey = keyof NzConfig;

/**
 * User should provide an object implements this interface to set global configurations.
 */
export const NZ_CONFIG = new InjectionToken<NzConfig>('nz-config');
