import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, finalize, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { RetrieveAccountApi } from 'src/app/shared/apis/retrieve-account.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import {
  DepositeByCurrencyParams,
  TopUpOrderInforItem,
  UpdateCurrencyDepositeOrderParams,
  historyListItem,
} from 'src/app/shared/interfaces/retrieve-account.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { RetrieveAccountService } from '../retrieve-account.service';

@UntilDestroy()
@Component({
  selector: 'app-currency-record',
  templateUrl: './currency-record.component.html',
  styleUrls: ['./currency-record.component.scss'],
})
export class CurrencyRecordComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private popup: PopupService,
    private appService: AppService,
    private resourceApi: ResourceApi,
    private activatedRoute: ActivatedRoute,
    private retrieveAccountApi: RetrieveAccountApi,
    private location: Location,
    private toast: ToastService,
    private localeService: LocaleService,
    private retrieveAccountService: RetrieveAccountService,
  ) {}

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    //弹出框存在时执行，关闭弹出框
    if (this.orderDialogPopup) {
      this.orderDialogPopup.close();
    }
  }

  /** 订单Id输入框 */
  @ViewChild('orderId', { static: false }) private orderIdElement!: ElementRef;
  /** 金额输入框 */
  @ViewChild('amount', { static: false }) private amountElement!: ElementRef;
  /** web申请单弹出框 */
  @ViewChild('orderDialog') orderDialogRef!: TemplateRef<any>;
  orderDialogPopup!: MatDialogRef<any>;
  /** 修改金额确定弹窗 */
  @ViewChild('amountReviseDialog') amountReviseDialogRef!: TemplateRef<any>;
  amountReviseDialogPopup!: MatDialogRef<any>;

  isH5!: boolean;
  /** 历史记录加载 */
  loading: boolean = false;
  /** 表单加载 */
  loadingForm: boolean = false;
  headerName: string = this.localeService.getValue('com_rec_not00');
  /** Id栏位 */
  submitValid1: boolean = false;
  /** 文档栏位 */
  submitValid2: boolean = false;
  /** 视频栏位 */
  submitValidVideo: boolean = false;

  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
  fileList: any = [];
  /** 历史记录列表 */
  historyList: historyListItem[] = [];
  /** api使用 */
  filesData: any[] = [];
  /** 备注 api使用 */
  remarkValue: string = '';
  /** 订单号 api使用 */
  id: string = '';
  /** 金额 api使用 */
  currentAmount: string = '';
  /** orderId查询到的订单信息 */
  matchedOrderInfor: any = {};
  /** 需要补充材料 */
  isSupplement: boolean = false;
  /** 金额提示 */
  showAmountNotice: boolean = false;
  /** orderId获取到的订单状态错误返回信息 */
  orderStatusError: string = '';

  /**
   * appealInfor.handleResult
   * 待补充材料，旧数据中的未填写补充材料的单子，无法明确状态-NoSupplement-处理结果、上传文件功能
   * 待补充材料，汇款截图不完整-SupplementComplete-处理结果、注意事项、上传文件
   * 待补充资料，汇款截图无法验证-SupplementVerify-处理结果、注意事项、上传视频
   * 待补充材料，未能查询到该笔订单-SupplementOrder-处理结果、注意事项、上传文件
   * 待补充资料，申诉资讯不完整-SupplementNewsComplete-处理结果、注意事项、上传文件
   * 待补充材料-SupplementRemark-处理结果、上传文件
   */
  appealInfor: any = {};

  /** 补充视频 */
  videoData: string | null = null;

  successlAppealID!: string;
  imgUpLoading!: boolean;
  vidioUpLoading!: boolean;

  /** 是否可以编辑金额 */
  isAmountRevise: boolean = false;

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });

    this.activatedRoute.queryParamMap.pipe(untilDestroyed(this)).subscribe(params => {
      const appealId = params.get('appealId');
      if (appealId) {
        this.handleSupplement(appealId, 'Supplement');
      }
    });

    this.retrieveAccountService.currencyRecordList$
      .pipe(
        untilDestroyed(this),
        filter(x => typeof x === 'boolean' && x === true),
      )
      .subscribe(isReload => {
        if (isReload) {
          this.retrieveAccountService.currencyRecordList$.next(false);
        }
      });
  }

  submit(isSupplement: boolean) {
    if (isSupplement) {
      switch (this.appealInfor.handleResult) {
        /*待补充材料，旧数据中的未填写补充材料的单子，无法明确状态-NoSupplement-处理结果、上传文件功能 */
        case 'NoSupplement':
        /*待补充材料，汇款截图不完整-SupplementComplete-处理结果、注意事项、上传文件 */
        case 'SupplementComplete':
        /*待补充材料，未能查询到该笔订单-SupplementOrder-处理结果、注意事项、上传文件 */
        case 'SupplementOrder':
        /*待补充资料，申诉资讯不完整-SupplementNewsComplete-处理结果、注意事项、上传文件 */
        case 'SupplementNewsComplete':
        /*待补充材料-SupplementRemark-处理结果、上传文件 */
        case 'SupplementRemark':
          if (this.filesData.length > 0) {
            this.cancelAppeal(this.appealInfor.appealId, false);
          } else {
            this.submitValid2 = !this.filesData.length;
          }
          break;
        /*待补充资料，汇款截图无法验证-SupplementVerify-处理结果、注意事项、上传视频 */
        case 'SupplementVerify':
          //视频补充
          if (this.videoData) {
            this.cancelAppeal(this.appealInfor.appealId, false);
          } else {
            this.submitValidVideo = !this.videoData;
          }
          break;
      }
    } else {
      this.handleUpFileSubmit();
    }
  }

  //图片补充
  handleUpFileSubmit() {
    if (this.id.length > 0 && this.filesData.length > 0) {
      if (!this.orderIdElement?.nativeElement?.isValid1 && !this.orderIdElement?.nativeElement?.isValid3) {
        this.loading = true;
        const params: DepositeByCurrencyParams = {
          orderNum: this.matchedOrderInfor.orderNum,
          amount: Number(this.currentAmount),
          images: this.filesData,
          desc: this.remarkValue,
        };
        this.retrieveAccountApi
          .postDepositeByCurrency(params)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(callback => {
            const { data, message } = callback;
            if (data) {
              this.submitCallBackDiagol();
              this.clean();
              this.successlAppealID = data;
            } else {
              this.toast.show({ message: message, type: 'fail' });
            }
            this.back();
          });
      }
    } else {
      this.submitValid1 = !(this.id.length > 0);
      this.submitValid2 = !(this.filesData.length > 0);
    }
  }

  cancelAppeal(id: string, handleStatus: boolean) {
    this.loading = true;
    const params: UpdateCurrencyDepositeOrderParams = {
      appealId: id,
      isCancel: handleStatus,
      images: this.filesData,
      amount: Number(this.currentAmount),
      desc: this.remarkValue,
      video: this.videoData ?? '',
    };
    this.retrieveAccountApi.postUpdateCurrencyDepositeOrder(params).subscribe(res => {
      if (res) {
        if (res.data) {
          this.toast.show({
            message: handleStatus ? this.localeService.getValue('op_s') : this.localeService.getValue('info_s'),
            type: 'success',
          });
          this.clean();
        } else {
          this.toast.show({ message: res.message, type: 'fail' });
        }
      }
      this.loading = false;
      this.back();
    });
  }

  clean() {
    this.remarkValue = '';
    this.id = '';
    this.currentAmount = '';
    this.matchedOrderInfor = {};
    this.filesData = [];
    this.fileList = [];
    this.videoData = null;
    this.isSupplement = false;
    this.submitValid1 = false;
    this.submitValid2 = false;
    this.submitValidVideo = false;
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlurOrderId(element: any) {
    this.setFocus(element);
    if (element.value.length > 0) {
      this.getMactedOrderIndFor(element.value);
    }
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlurAmount(element: any) {
    this.setFocus(element);
  }

  setFocus(element: any) {
    //延迟200MS，防止clear无法点击
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }

  /**
   * Input Focus事件
   *
   * @param element
   */
  onFocus(element: any) {
    element.isFocus = true;
  }

  /**
   * Id输入
   *
   * @param element
   */
  onInput(element: any) {
    //输入是否有空格
    const unEmptyStr = element.value.indexOf(' ') == -1;
    console.log('ii--->', element.value[0]);
    //后端返回错误
    element.isValid1 = false;
    //未找到该笔未成功订单，请重新输入。
    element.isValid3 = false;
    //submit时不能为空
    this.submitValid1 = false;
  }

  getMactedOrderIndFor(orderId: string) {
    //D289828585033861
    //根据orderId获取相关信息
    this.loadingForm = true;
    this.retrieveAccountApi
      .getTxinFor(orderId)
      .pipe(
        map(x => x),
        finalize(() => (this.loadingForm = false)),
      )
      .subscribe((callbackData: any) => {
        if (callbackData == null) {
          //未找到该笔未成功订单，请重新输入。
          this.orderIdElement.nativeElement.isValid3 = true;
        }
        const { data, message, success } = callbackData;
        if (success) {
          this.matchedOrderInfor = {
            orderNum: data.orderNum,
            createTime: 'null',
            userName: data.userName,
            paymentName: data.paymentName,
            amount: String(data.amount),
            fee: '0',
            orderStatus: '',
            currency: data.currency,
            paymentWay: data.paymentCode,
            toCurrency: 'null',
            isOpen: false,
            paymentIcon: data.paymentImages !== null && data.paymentImages.length > 0 ? data.paymentImages[0] : '',
          };
          this.currentAmount = String(data.amount);
          this.checkAmount(this.currentAmount);
        } else {
          this.orderStatusError = message;
          this.orderIdElement.nativeElement.isValid1 = true;
        }
      });
  }

  //补充资料
  handleSupplement(item: any, status: string) {
    this.clean();
    if (status == 'Supplement') {
      this.getCurrencyDeposite(item);
      this.isSupplement = true;
    }
  }

  //获取appealId相关信息
  getCurrencyDeposite(appealId: string) {
    this.loadingForm = true;
    this.retrieveAccountApi
      .getCurrencyDepositeId(appealId)
      .pipe(
        map(x => x),
        finalize(() => (this.loadingForm = false)),
      )
      .subscribe((callback: any) => {
        const { success, data, message } = callback;

        if (success) {
          this.appealInfor = data;
          const formatData: TopUpOrderInforItem = {
            ...data,
            paymentIcon: data.paymentImages !== null && data.paymentImages.length > 0 ? data.paymentImages[0] : '',
          };
          this.matchedOrderInfor = formatData;
          this.id = data.orderNum;
          this.currentAmount = data.amount;
        } else {
          this.toast.show({ message: message, type: 'fail' });
        }
      });
  }

  /**
   * 金额输入
   *
   * @param element
   */
  onAmountInput(element: any) {
    this.checkAmount(element.value);
  }

  //金额验证
  checkAmount(currentAmount: string) {
    const { amount } = this.matchedOrderInfor;
    if (amount) {
      this.showAmountNotice = !(amount == currentAmount);
    }
  }

  submitCallBackDiagol() {
    // if (this.isH5) {
    this.orderDialogPopup = this.popup.open(this.orderDialogRef, {
      speed: 'fast',
      autoFocus: false,
      isFull: false,
    });
    // } else {
    //   this.orderDialogPopup = this.popup.open(this.orderDialogRef, {
    //     speed: 'fast',
    //     autoFocus: false,
    //     isFull: false,
    //   });
    // }
  }

  openAmountReviseDialog() {
    this.amountReviseDialogPopup = this.popup.open(this.amountReviseDialogRef, {
      speed: 'fast',
      autoFocus: false,
      isFull: false,
    });
  }
  delFilesData(key: number) {
    this.fileList.splice(key, 1);
    this.filesData.splice(key, 1);
  }

  //上传图片
  upFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;

    if (this.fileList.length == 4) {
      this.toast.show({ message: this.localeService.getValue('upload_max', 4), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    const file = target.files && target.files[0];
    if (!file) return;

    // 文件类型验证
    const fileType = file.type.toLowerCase();
    if (!['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'].includes(fileType)) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    // 文件大小验证 10M
    const fileMaxSize = 1024 * 1024 * 10;
    if (file.size > fileMaxSize) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    //通过检验，开始上传
    this.submitValid2 = false;
    this.imgUpLoading = true;
    this.resourceApi.uploadFile(file, fileType, 'Appeal').subscribe(url => {
      if (url) {
        this.fileList.push(file);
        this.filesData.push(url);
      } else {
        this.toast.show({ message: this.localeService.getValue('up_img_f'), type: 'fail', title: '' });
      }
      target.value = '';
      this.imgUpLoading = false;
    });
  }

  //上传视频
  upvideo(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;

    if (this.fileList.length == 1) {
      this.toast.show({ message: this.localeService.getValue('upload_max', 1), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    const file = target.files && target.files[0];
    if (!file) return;

    // 文件类型验证
    const fileType = file.type.toLowerCase();
    if (!['video/mp4', 'video/mp3', 'video/mov', 'video/rmvb', 'video/quicktime'].includes(fileType)) {
      this.toast.show({ message: this.localeService.getValue('unsupp_file'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    // 文件大小验证 30M
    const fileMaxSize = 1024 * 1024 * 30;
    if (file.size > fileMaxSize) {
      this.toast.show({ message: this.localeService.getValue('file_limerr'), type: 'fail', title: '' });
      target.value = '';
      return;
    }

    //通过检验，开始上传
    this.submitValidVideo = false;
    this.vidioUpLoading = true;
    this.resourceApi.uploadFile(file, fileType, 'Appeal').subscribe(url => {
      if (url) {
        this.fileList.push(file);
        this.videoData = url;
      } else {
        this.toast.show({ message: this.localeService.getValue('up_video_s'), type: 'fail', title: '' });
      }
      target.value = '';
      this.vidioUpLoading = false;
    });
  }

  //顶部返回
  back() {
    this.location.back();
  }

  /**
   * ENTER 键提交
   */
  checkToSubmit() {
    if (this.vidioUpLoading || this.imgUpLoading || this.loading) return;
    this.submit(this.isSupplement);
  }
}
