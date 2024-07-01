import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgTemplateOutlet, NgFor } from '@angular/common';

@Component({
  selector: 'rule-integral',
  templateUrl: './integral.component.html',
  styleUrls: ['./integral.component.scss'],
  standalone: true,
  imports: [NgIf, FormRowComponent, FormWrapComponent, NgTemplateOutlet, NgFor, FormsModule, LangPipe],
})
export class IntegralComponent implements OnInit {
  constructor(
    public lang: LangService,
    private appService: AppService,
    private api: RiskApi
  ) {}

  isLoading = false; // 是否处于加载

  // isAdd: boolean = true; // 默认 +
  data: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading(true);
    this.api.getAllScoreConfigs().subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) {
        this.data = res;
      }
    });
  }

  addCut(type: any, action?: any) {
    const curIndex = this.data.findIndex((item) => item.action === action);
    if (type === 'add') {
      ++this.data[curIndex].score;
      return;
    }
    --this.data[curIndex].score;
  }

  submit() {
    this.loading(true);
    this.api.updateScoreConfig(this.data).subscribe((res) => {
      if (res === true) this.loadData();
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'risk.config.suc' : 'risk.config.fail',
        successed: res,
      });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
