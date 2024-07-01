import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { CategoryMenuComponent } from './category-menu/category-menu.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';

@Component({
  selector: 'app-odds-setting',
  templateUrl: './odds-setting.component.html',
  styleUrls: ['./odds-setting.component.scss'],
  standalone: true,
  imports: [CategoryMenuComponent, NgIf, FormsModule, NgFor, NgStyle, AngularSvgIconModule, LangPipe],
})
export class OddsSettingComponent implements OnInit {
  constructor(
    private lotteryApi: LotteryApi,
    public subHeaderService: SubHeaderService,
    private appService: AppService,
    private dialog: MatModal
  ) {}

  @ViewChild('editall') editAll!: TemplateRef<any>;
  dialogRef: any;

  lotteryId: any;
  lotteryName: any;

  active = '双面盘';
  isEdit = false;

  data: any = {
    lotteryPlayConfig: {
      lotteryPlayConfigId: 2,
      lotteryId: 1,
      lotteryMinAmount: '',
      lotteryMaxQuota: '',
      lotterySingleMaxQuota: '',
      thirdPartyCode: '1',
    },
  };

  layout: object = {
    keno: [
      {
        title: '双面',
        lang: 'lotto.double',
        type: '双面盘',
        layout: [
          {
            title: '双面',
            lang: 'lotto.double',
          },
        ],
      },
      {
        title: '珠仔正赌',
        lang: 'lotto.zz',
        type: '双面盘',
        layout: [
          {
            title: '珠仔正赌',
            lang: 'lotto.zz',
            showAllEdit: true,
            direction: 'column',
          },
        ],
      },
      {
        title: '珠仔正赌',
        lang: 'lotto.zz',
        type: '标准盘',
        layout: [
          {
            title: '正赌选1',
            lang: 'lotto.op',
            showAllEdit: true,
            direction: 'column',
          },
          {
            title: '正赌选2',
            lang: 'lotto.op2',
          },
          {
            title: '正赌选3',
            lang: 'lotto.op3',
          },
          {
            title: '正赌选4',
            lang: 'lotto.op4',
          },
          {
            title: '正赌选5',
            lang: 'lotto.op5',
          },
        ],
      },
      {
        title: '趣味',
        lang: 'lotto.qw',
        type: '标准盘',
        layout: [
          {
            title: '上下',
            lang: 'lotto.sx',
          },
          {
            title: '奇偶',
            lang: 'lotto.jo',
          },
          {
            title: '大小/单双',
            lang: 'lotto.jo',
          },
          {
            title: '牛牛',
            columnsCount: 3,
            lang: 'lotto.niu',
          },
        ],
      },
    ],
  };

  lotteryOdds: any;

  currentLayout: any;
  layoutIndex = 0;
  oneMenuIndex = 0;
  currentMethods: any | null;
  currentPath = 'keno';
  isLoading = false;

  ngOnInit(): void {
    this.currentLayout = this.layout[this.currentPath];
    this.switchLayout(0);
  }

  changeActive(type: string) {
    this.active = type;
    let index = 0;
    for (let i = 0; i < this.currentLayout.length; i++) {
      if (this.currentLayout[i].type === this.active) {
        index = i;
        break;
      }
    }
    this.switchLayout(index);
  }

  lotteryChange(e: any) {
    this.lotteryId = e?.lotteryId;
    this.lotteryName = e?.lotteryName;
    if (!e) {
      this.currentMethods = null;
    }
    e && this.getCurrentMethods();
  }

  switchLayout(index: number) {
    this.layoutIndex = index;
    this.oneMenuIndex = 0;
    this.lotteryId && this.getCurrentMethods();
  }

  switchOneMenu(index: number) {
    this.oneMenuIndex = index;
    this.getCurrentMethods();
  }

  getCurrentMethods() {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;
    this.loading(true);
    const params = {
      lotteryId: this.lotteryId,
      lotteryPlayTitle: this.active,
      lotteryPlayType: this.currentLayout[this.layoutIndex].title,
    };
    if (this.currentLayout[this.layoutIndex].layout.length > 1) {
      Object.assign(params, {
        lotteryPlaySubdivide: this.currentLayout[this.layoutIndex].layout[this.oneMenuIndex].title,
      });
    }
    this.lotteryApi.getOddsSettingList(this.subHeaderService.merchantCurrentId, params).subscribe((res) => {
      this.data = res.data;
      const t = [...new Set(res.data.lotteryPlay.map((cur) => cur.lotteryPlaySubdivide))];
      this.currentMethods = t.map((cur) => {
        return {
          title: cur,
          balls: res.data.lotteryPlay.filter((a) => a.lotteryPlaySubdivide === cur),
        };
      });
      this.loading(false);
    });
  }

  calcWidth() {
    return {};
  }

  ballWrapStyle(item) {
    if (this.currentLayout[this.layoutIndex].layout[this.oneMenuIndex].direction === 'column') {
      return {
        display: 'flex',
        'flex-direction': 'column',
        'flex-flow': 'wrap',
        height: (item.balls.length / 4) * 52 + 18 + 'px',
        gap: 0,
      };
    }
    if (this.currentLayout[this.layoutIndex].layout[this.oneMenuIndex].columnsCount) {
      return {
        'grid-template-columns': `repeat(${
          this.currentLayout[this.layoutIndex].layout[this.oneMenuIndex].columnsCount
        }, 1fr)`,
      };
    }
    return {};
  }

  editRate(e: any, lotteryPlayId) {
    if (!this.isEdit) return;
    this.lotteryApi
      .updateLotteryPlayById(this.subHeaderService.merchantCurrentId, {
        lotteryPlayId,
        lotteryOdds: e.target.value,
      })
      .subscribe((res) => {
        if (res.code === '200') {
          this.appService.showToastSubject.next({
            msgLang: 'lotto.changeSuc',
            successed: true,
          });
          this.getCurrentMethods();
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'lotto.changeFail',
            successed: false,
          });
        }
      });
  }

  changeLimit() {
    if (!this.isEdit) return;
    this.lotteryApi.updateLotteryPlayConfigById(this.data.lotteryPlayConfig).subscribe((res) => {
      if (res.code === '200') {
        this.appService.showToastSubject.next({
          msgLang: 'lotto.changeSuc',
          successed: true,
        });
        this.getCurrentMethods();
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'lotto.changeFail',
          successed: false,
        });
      }
    });
  }

  editAllRates() {
    const params = {
      lotteryId: this.lotteryId,
      lotteryPlayTitle: this.active,
      lotteryPlayType: this.currentLayout[this.layoutIndex].title,
      lotteryOdds: this.lotteryOdds,
    };
    if (this.currentLayout[this.layoutIndex].layout.length > 1) {
      Object.assign(params, {
        lotteryPlaySubdivide: this.currentLayout[this.layoutIndex].layout[this.oneMenuIndex].title,
      });
    } else {
      Object.assign(params, {
        lotteryPlaySubdivide: this.currentLayout[this.layoutIndex].title,
      });
    }
    this.lotteryApi.updateBachLotteryPlay(this.subHeaderService.merchantCurrentId, params).subscribe((res) => {
      if (res.code === '200') {
        this.appService.showToastSubject.next({
          msgLang: 'lotto.changeSuc',
          successed: true,
        });
        this.getCurrentMethods();
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'lotto.changeFail',
          successed: false,
        });
      }
      this.lotteryOdds = '';
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 调整全部弹窗
  showModel() {
    this.dialogRef = this.dialog.open(this.editAll, { minWidth: 540 });
  }
}
