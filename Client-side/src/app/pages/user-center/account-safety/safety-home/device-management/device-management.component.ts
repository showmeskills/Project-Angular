import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { delay, finalize, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { DeviceHistory, DeviceLog } from 'src/app/shared/interfaces/history.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

export interface DeviceHistoryExpand extends DeviceHistory {
  loading: boolean; // 是否加载中
  expand: boolean; // 是否已展开
  record: DeviceLog[]; // 详细记录
  paginator: PaginatorState; // 记录的分页信息
}

@UntilDestroy()
@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.scss'],
})
export class DeviceManagementComponent implements OnInit {
  constructor(
    private popupService: PopupService,
    private historyApi: HistoryApi,
    private appService: AppService,
    private localeService: LocaleService,
    private layout: LayoutService
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
      // 切换模式如果有数据需要清空数据重新初始化，因为h5数据是全部显示的，web是只显示当前10个
      if (this.deveiceList.length > 0) this.reLoadDeviceData(true);
    });
  }

  isH5!: boolean;
  loadDeviceListLoading: boolean = false;
  deveiceList: DeviceHistoryExpand[] = []; // 设备列表
  focusDeveice!: DeviceHistoryExpand; // 正在查看具体记录的设备
  isRecordView: boolean = false; // 是列表页还是具体记录页
  recordViewTitle: string = ''; // 具体记录页标题

  // 设备列表分页信息
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  ngOnInit() {
    this.loadDeviceData();
  }

  // 初始化 clean 为true时候强制清空
  reLoadDeviceData(clean: boolean = false) {
    this.paginator.page = 1;
    if (this.isH5) this.paginator.total = 0;
    if (clean || this.isH5) this.deveiceList = []; //h5才需要清数据，web会重新赋值
    this.loadDeviceData();
  }

  //获取设备列表数据
  loadDeviceData() {
    //情况1：数据本身空的时候，不论web还是h5均需要全局loading
    //情况2：有数据后，web是点分页全局加载，h5是滚动到末尾加载（传 loadDeviceListLoading 给分页组件）
    // const needGlobalLoading: boolean = (() => {
    //   if (this.deveiceList.length <= 0) return true;
    //   if (!this.isH5) return true;
    //   return false;
    // })();

    // needGlobalLoading && this.appService.isLoadingSubject.next(true);

    this.loadDeviceListLoading = true;
    this.historyApi
      .getDevices(this.paginator.page, this.paginator.pageSize)
      .pipe(
        map(v => v.data),
        map(v => ({
          ...v,
          // 扩展增加属性，类型变为 DeviceHistoryExpand
          list: v.list.map((x: DeviceHistory) => ({
            ...x,
            loading: false, // 具体某个设备的加载状态
            expand: false, // 具体某个设备的展开状态
            record: [], // 具体某个设备的具体登录记录
            paginator: {
              // 具体某个设备的分页信息
              page: 1,
              pageSize: 10,
              total: 0,
            },
          })),
        })),
        finalize(() => {
          this.loadDeviceListLoading = false;
          // needGlobalLoading && this.appService.isLoadingSubject.next(false);
        })
      )
      .subscribe(data => {
        this.paginator.total = data.total;

        if (this.isH5) {
          // h5是滚动加载显示全部，用push追加
          this.deveiceList.push(...data.list);
        } else {
          // web直接赋值替换当前页内容
          this.deveiceList = data.list;
        }
      });
  }

  // 判断展开
  checkToExpand(device: DeviceHistoryExpand) {
    if (device.record.length <= 0) {
      this.loadDeviceLog(device, true);
    } else {
      device.expand = !device.expand;
    }
  }

  // 进入查看更多记录
  intoRecordView(device: DeviceHistoryExpand) {
    this.focusDeveice = {
      ...device,
      record: [...device.record],
      paginator: { ...device.paginator },
    };
    this.isRecordView = true;
    this.recordViewTitle = this.focusDeveice.os
      ? `${this.focusDeveice.browser}(${this.focusDeveice.os})`
      : this.focusDeveice.browser;
  }

  //读取指定设备记录
  loadDeviceLog(device: DeviceHistoryExpand, reCheckToExpand?: boolean) {
    //情况1：记录第一次拉取的时候，无论web还是h5都不需要全局loading
    //情况2：有数据后，web是点分页全局加载，h5是滚动到末尾加载（传 device.loading [会在intoRecordView里转为focusDeveice引用] 给分页组件）
    // const needGlobalLoading: boolean = (() => {
    //   if (device.record.length <= 0) return false;
    //   if (this.isH5) return false;
    //   return true;
    // })();
    // needGlobalLoading && this.appService.isLoadingSubject.next(true);

    device.loading = true;
    this.historyApi
      .getDeviceLog(device.id, device.paginator.page, device.paginator.pageSize)
      .pipe(
        map(v => v.data),
        delay(device.record.length <= 0 ? 300 : 0), //在管理列表页首次展开延长一点时间，让device.loading至少显示一小会，避免闪烁
        finalize(() => {
          device.loading = false;
          // needGlobalLoading && this.appService.isLoadingSubject.next(false);
        })
      )
      .subscribe(data => {
        device.paginator.total = data.total;

        if (this.isH5) {
          // h5是滚动加载显示全部，用push追加
          device.record.push(...data.list);
        } else {
          // web直接赋值替换当前页内容
          device.record = data.list;
        }

        //重新检查展开
        reCheckToExpand && this.checkToExpand(device);
      });
  }

  // 删除设备
  deleteDevice(device: DeviceHistoryExpand) {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        icon: 'assets/svg/delete-device.svg',
        content: this.localeService.getValue(`del_device00`),
        description: device.os ? `${device.browser}(${device.os})` : device.browser,
        buttons: [
          { text: this.localeService.getValue(`cancels`), primary: false },
          { text: this.localeService.getValue(`delete`), primary: true },
        ],
        callback: () => {
          // this.appService.isLoadingSubject.next(true);
          this.loadDeviceListLoading = true;
          this.historyApi
            .deleteDevice(device.id)
            .pipe()
            .subscribe(() => {
              // this.appService.isLoadingSubject.next(false);
              // 重新初始化
              this.reLoadDeviceData();
            });
        },
      },
    });
  }
}
