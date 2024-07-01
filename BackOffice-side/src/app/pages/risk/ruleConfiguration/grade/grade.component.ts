import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgTemplateOutlet, NgIf } from '@angular/common';

@Component({
  selector: 'rule-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss'],
  standalone: true,
  imports: [NgFor, FormRowComponent, NgTemplateOutlet, NgIf, FormWrapComponent, FormsModule, LangPipe],
})
export class GradeComponent implements OnInit {
  constructor(
    public lang: LangService,
    private appService: AppService,
    private api: RiskApi
  ) {}

  isLoading = false; // 是否处于加载

  levelList: any[] = [];

  get levelElevenList() {
    return this.levelList.filter((v) => 11 >= v.level);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading(true);
    this.api.getAllLevelConfigs().subscribe((res) => {
      this.loading(false);
      if (Array.isArray(res)) {
        this.levelList = res.sort((a, b) => {
          return a.level > b.level ? 1 : -1;
        });
      }
    });
  }

  submit() {
    this.loading(true);
    this.api.updateLevelConfig(this.levelList).subscribe((res) => {
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
