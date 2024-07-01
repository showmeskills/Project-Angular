import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BigNumberPipe, FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormsModule } from '@angular/forms';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { MemberItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'list-table',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    BigNumberPipe,
    CurrencyIconDirective,
    CurrencyValuePipe,
    FormatMoneyPipe,
    FormsModule,
    LangPipe,
    SelectChildrenDirective,
    SelectGroupDirective,
    TimeFormatPipe,
    NgbPopover,
    VipNamePipe,
  ],
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss'],
})
export class MemberListTableComponent {
  @Input() list: MemberItem[];
  @Input() isSimple = false;
  @Input() data: any;
  @Input() isLoading: boolean;
  @Output() sort = new EventEmitter<'registerTime' | 'lastLoginTime' | 'Balance'>();

  constructor(
    public router: Router,
    public subHeaderService: SubHeaderService
  ) {}

  /**
   * 判断游戏icon是否存在
   * @Author FrankLin
   */
  isGameIcon(arr: number[], item: any) {
    if (!Array.isArray(item)) {
      return false;
    }
    return item.some((res) => arr.includes(res.gameCategory));
  }

  /**
   * 判断显示厂商
   * @Author FrankLin
   */
  showGameMaker(arr: number[], item: any): string {
    if (!Array.isArray(item)) {
      return '';
    }
    let gameMaker = [];
    item.forEach((res) => {
      if (arr.includes(res.gameCategory)) {
        gameMaker = gameMaker.concat(res.gameProviders);
      }
    });
    return gameMaker.join(', ');
  }

  onSort(field: 'registerTime' | 'lastLoginTime' | 'Balance') {
    this.sort.emit(field);
  }

  /**
   * 打开会员详情标签页
   * @param item
   */
  openUID(item: any) {
    // PS：注意这里window.open 不能放在异步里，否则会被浏览器拦截（因为处于安全考虑浏览器只限制于点击后的同步操作，类似video必须点击才能自动播放声音视频）
    window.open(
      this.router.serializeUrl(
        this.router.createUrlTree(['/member/list/detail/overview'], {
          queryParams: { id: item.id, uid: item.uid, tenantId: item.tenantId },
        })
      )
    );
  }
}
