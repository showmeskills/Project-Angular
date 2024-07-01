// github:https://github.com/element-plus/element-plus/blob/dev/packages/components/progress/src/progress.vue

import { Component, ContentChild, Input, OnInit } from '@angular/core';
import { ProgressTextDirective } from './progress.directive';
import { NgIf, NgTemplateOutlet } from '@angular/common';

type Color = { color: string; percentage: number };
type ProgressFn = (percentage: number) => string;

@Component({
  selector: 'pp-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  standalone: true,
  imports: [NgIf, NgTemplateOutlet],
})
export class ProgressComponent implements OnInit {
  @Input() type: 'line' | 'circle' | 'dashboard' = 'line';
  @Input() width = 126;
  @Input() status: '' | 'primary' | 'success' | 'exception' | 'warning' = '';
  @Input() color: string | Color[] | ProgressFn = '';
  @Input() rounded = 100;
  @Input() duration = 3;
  @Input() showText = true;
  @Input() textInside = false;
  @Input() trackColor = '#e5e9f2';
  @Input() strokeWidth = 6;
  @Input() indeterminate = false;
  @Input() strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit' = 'round';
  /** 进度百分比 0 ~ 100 */
  @Input() percentage = 0;

  /** 进度展示内容 */
  @ContentChild(ProgressTextDirective, { static: false })
  progressContent!: ProgressTextDirective;

  /** getters */
  get barStyle() {
    return {
      width: `${this.percentage}%`,
      animationDuration: `${this.duration}s`,
      backgroundColor: this.getCurrentColor(this.percentage),
      borderRadius: this.rounded + 'px',
    };
  }

  get relativeStrokeWidth() {
    return ((this.strokeWidth / this.width) * 100).toFixed(1);
  }

  get radius() {
    return this.type === 'circle' ? parseInt(`${50 - parseFloat(this.relativeStrokeWidth) / 2}`, 10) : 0;
  }

  get trackPath(): any {
    const r = this.radius;
    const isDashboard = this.type === 'dashboard';

    return `
      M 50 50
      m 0 ${isDashboard ? '' : '-'}${r}
      a ${r} ${r} 0 1 1 0 ${isDashboard ? '-' : ''}${r * 2}
      a ${r} ${r} 0 1 1 0 ${isDashboard ? '' : '-'}${r * 2}
    `;
  }

  get perimeter() {
    // 周长：2PI * r
    return 2 * Math.PI * this.radius;
  }

  get rate() {
    return this.type === 'dashboard' ? 0.75 : 1;
  }

  get strokeDashoffset() {
    const offset = (-1 * this.perimeter * (1 - this.rate)) / 2;
    return `${offset}px`;
  }

  get trailPathStyle() {
    return {
      strokeDasharray: `${this.perimeter * this.rate}px, ${this.perimeter}px`,
      strokeDashoffset: this.strokeDashoffset,
    };
  }

  get circlePathStyle() {
    return {
      strokeDasharray: `${this.perimeter * this.rate * (this.percentage / 100)}px, ${this.perimeter}px`,
      strokeDashoffset: this.strokeDashoffset,
      transition: 'stroke-dasharray 0.6s ease 0s, stroke 0.6s ease',
    };
  }

  get stroke() {
    let ret: string;
    if (this.color) {
      ret = this.getCurrentColor(this.percentage);
    } else {
      switch (this.status) {
        case 'success':
          ret = '#13ce66';
          break;
        case 'exception':
          ret = '#ff4949';
          break;
        case 'warning':
          ret = '#e6a23c';
          break;
        case 'primary':
        default:
          ret = '#20a0ff';
      }
    }
    return ret;
  }

  get slotData() {
    return {
      percentage: this.percentage,
    };
  }

  get progressTextSize() {
    return this.type === 'line' ? 12 + this.strokeWidth * 0.4 : this.width * 0.111111 + 2;
  }

  constructor() {}

  /** lifeCycle */
  ngOnInit(): void {}

  /** methods */
  getCurrentColor(percentage: number) {
    const color = this.color;
    if (typeof color === 'function') {
      return color(percentage);
    } else if (typeof color === 'string') {
      return color;
    } else {
      const span = 100 / color.length;
      const seriesColors = color.map((seriesColor, index) => {
        if (typeof seriesColor === 'string') {
          return {
            color: seriesColor,
            percentage: (index + 1) * span,
          };
        }
        return seriesColor;
      });
      const colors = seriesColors.sort((a, b) => a.percentage - b.percentage);
      for (const color of colors) {
        if (color.percentage > percentage) return color.color;
      }
      return colors[colors.length - 1]?.color;
    }
  }
}
