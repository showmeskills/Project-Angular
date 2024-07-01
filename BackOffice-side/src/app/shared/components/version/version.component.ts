import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountApi } from 'src/app/shared/api/account.api';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

const apiVersion$ = new BehaviorSubject('-');

@Component({
  selector: 'version,[version]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="isOnline">version：{{ version }}</span>
    <span *ngIf="!isOnline">
      F: {{ version }}<br />
      B: {{ apiVersion$ | async }}
    </span>
  `,
  styles: [
    `
      :host {
        font-size: 16px;
      }
    `,
  ],
})
export class VersionComponent implements OnInit {
  constructor(private accountApi: AccountApi) {}

  isOnline = true; // 是否为线上版本
  version = ''; // 版本号
  apiVersion$ = apiVersion$;

  ngOnInit(): void {
    window['version'] = this.version = environment.version;
    this.isOnline = environment.isOnline;
    this.getApiVersion();
  }

  /**
   * 获取接口版本号
   */
  getApiVersion() {
    // 此接口不加loading
    if (this.isOnline) return;
    this.accountApi.getApiVersion().subscribe((res) => {
      this.apiVersion$.next(res);
    });
  }
}
