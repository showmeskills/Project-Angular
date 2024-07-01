import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MessagestationApi } from 'src/app/shared/api/messagestation.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { lastValueFrom, take, zip } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DetailService } from '../../detail/detail.service';
import { LocationService } from 'src/app/shared/service/location.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UEditorComponent } from 'src/app/components/ueditor/ueditor.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { cloneDeep } from 'lodash';
import { VipApi } from 'src/app/shared/api/vip.api';
import { MemberApi } from 'src/app/shared/api/member.api';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';

@Component({
  selector: 'app-message-send',
  templateUrl: './message-send.component.html',
  styleUrls: ['./message-send.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    UEditorComponent,
    AngularSvgIconModule,
    LangPipe,
    VipNamePipe,
    JsonPipe,
  ],
})
export class MessageSendComponent implements OnInit {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private appService: AppService,
    private api: MessagestationApi,
    private memberApi: MemberApi,
    private subHeaderService: SubHeaderService,
    public langService: LangService,
    private route: ActivatedRoute,
    private detailService: DetailService,
    private location: LocationService,
    private vipApi: VipApi,
    private breadcrumbsService: BreadcrumbsService
  ) {
    const { tenantId } = this.route.snapshot.queryParams;
    const { id } = this.route.snapshot.queryParams;

    this.tenantId = tenantId;
    this.id = id;
  }

  tenantId;
  id;

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  selectLang = ['zh-cn']; // PM:默认值CN

  /**是否可以新增 */
  isNowUser = true;

  // VIP等级下拉列表 - 默认VIPA （操作的vip数据列表）
  vipLevelList: { name: string; value: string }[] = [];

  dataMessage: any = {
    userUidAll: false,
    userUid: '',
    vipValText: 'common.notSelected',
    vipList: cloneDeep(this.vipLevelList), // 选中VIP的数据列表，先全选
    sourceValText: 'common.notSelected',
    statusValText: 'common.notSelected',
    statusValList: [],
    sourceValList: [],
    /** 需要传入的ID号 */
    userIdList: [],
  };

  /** 数据信息 */
  dataList = {};

  /** 用户信息 */
  userIdListInfo = [];

  /** 与userlist 做数据做拆分不然过于混乱 */
  userNameList: {
    id: string;
    uid: string;
    name: string;
  }[] = [];

  /** 总览进入时显示的UID号 */
  uid = [];

  /** 发送类型 */
  messageType = 'System';
  /** 发送类型列表 */
  messageTypeList: Tabs[] = [
    { name: '系统消息', lang: 'member.model.systemInfo', value: 'System' },
    { name: '交易通知', lang: 'member.model.tradeInfo', value: 'Transaction' },
    { name: '活动通知', lang: 'member.model.notification', value: 'Activity' },
    { name: '平台资讯', lang: 'member.model.platform', value: 'Information' },
  ];

  get base(): any {
    const { statusList = [], sourceList = [] } = { ...this.dataMessage };
    return { statusList, sourceList };
  }

  get userList(): any {
    return this.userIdListInfo || [];
  }

  /** 是否从会员详情进入 */
  get isToMemberDetial() {
    return this.id !== undefined;
  }

  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  // 获取数据
  loadData() {
    this.getVipLevelList();

    zip([this.memberApi.getMemberStatusSelect(), this.memberApi.getMemberSourceSelect()]).subscribe(
      ([statusList, sourceList]) => {
        this.dataMessage.statusList = [...statusList];
        this.dataMessage.sourceList = [...sourceList];
      }
    );
    // 从列表中打开站内信
    if (!this.isToMemberDetial) {
      if (this.userList.length > 0) {
        this.dataMessage.tenantId = this.userList[0].tenantId;
      }
    } else {
      this.breadcrumbsService.setBefore([
        {
          name: '会员详情',
          lang: 'nav.memberDetail',
          click: () =>
            this.router.navigate(['/member/list/detail/overview'], {
              queryParams: { id: this.userList.id, uid: this.userList.uid, tenantId: this.userList.tenantId },
            }),
        },
      ]);
    }
    if (this.base.isNowUser) {
      this.isNowUser = false;
      this.dataMessage.userUid = this.userList.uid;
    }
    this.uid = this.route.snapshot.queryParams['uid'];
    if (this.uid?.length > 0) {
      this.isNowUser = false;
      this.dataMessage.userUid = this.uid;
    }
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          title: ['', Validators.compose([Validators.required])],
          content: ['', Validators.compose([Validators.required])],
          languageCode: ['zh-cn'],
        }),
      ]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  /** 获取VIPA/VIPC的等级 */
  getVipLevelList() {
    this.vipApi.vip_manage_level_simple_list(this.tenantId).subscribe((res) => {
      if (res?.code === '0000' && Array.isArray(res?.data))
        this.vipLevelList = res.data.map((v) => ({ name: v.vipName, value: String(v.vipLevel) })) || [];
    });

    this.dataMessage.vipList = [];
  }

  allSelection() {
    this.dataMessage.userUidAll = true;
  }

  /**状态全选 */
  @ViewChild('allStatusSelected') private allStatusSelected: MatOption;
  toggleAllStatus() {
    if (this.allStatusSelected.selected) {
      this.dataMessage.statusValList = [...this.base.statusList.map((item) => item.categoryDescription), ''];
    } else {
      this.dataMessage.statusValList = [];
    }
  }

  /**状态单选 */
  toggleStatus() {
    if (this.allStatusSelected.selected) {
      return this.allStatusSelected.deselect();
    } else {
      if (this.dataMessage.statusValList.length == this.base.statusList.length) this.allStatusSelected.select();
    }
  }

  /**来源全选 */
  @ViewChild('allSourceSelected') private allSourceSelected: MatOption;
  toggleAllSource() {
    if (this.allSourceSelected.selected) {
      this.dataMessage.sourceValList = [...this.base.sourceList.map((item) => item.categoryDescription), ''];
    } else {
      this.dataMessage.sourceValList = [];
    }
  }

  /**来源单选 */
  toggleSource() {
    if (this.allSourceSelected.selected) {
      return this.allSourceSelected.deselect();
    } else {
      if (this.dataMessage.sourceValList.length == this.base.sourceList.length) this.allSourceSelected.select();
    }
  }

  ngOnInit(): void {
    this.dataList = this.detailService.dataList;
    this.userIdListInfo = this.detailService.userIdListInfo;
    if (this.userIdListInfo?.length > 1) {
      this.isNowUser = true;
    }
    this.loadForm();
    this.loadData();
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        title: '',
        content: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        title: [value.content, Validators.compose([Validators.required])],
        content: [value.content, Validators.compose([Validators.required])],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  async getUserId(userId): Promise<void> {
    const msg: any = await lastValueFrom(this.langService.get('member.model.enterUser').pipe(take(1)));
    // 添加失败,已添加此会员
    // const addFailedMsg: any = await lastValueFrom(this.langService.get('member.model.addFailed').pipe(take(1)));
    // 添加成功
    const addSuccess: any = await lastValueFrom(this.langService.get('common.addSuccess').pipe(take(1)));
    // 添加失败
    const addFailed: any = await lastValueFrom(this.langService.get('common.addFailed').pipe(take(1)));
    if (!userId) {
      this.appService.showToastSubject.next({
        msg,
        successed: true,
      });
      return;
    }
    let uidNameList = userId?.split(';')?.filter(Boolean) ?? [];
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getFinduserList({
        uidNameList,
        tenantId: this.tenantId,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res.length) {
          this.userNameList = res;
          this.appService.showToastSubject.next({
            msg: addSuccess,
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msg: addFailed,
            successed: false,
          });
        }
      });
  }

  async onSubmit(tpl, langTab): Promise<void> {
    //msg: '发送失败,请至少选择一个会员',
    const msg: any = await lastValueFrom(this.langService.get('member.model.sendFailed').pipe(take(1)));
    this.formGroup.markAllAsTouched();
    langTab.check();
    if (this.formGroup.invalid) return;
    const titleContent = this.formGroup.value.lang;
    this.dataMessage.userIdList = this.userNameList.map((e) => e.id);

    // 判断是否有vip等级和uid被选中
    if (this.dataMessage.vipList.length === 0 && this.dataMessage.userIdList.length === 0) {
      this.appService.showToastSubject.next({
        msg,
        successed: false,
      });
      return;
    }

    let sourceList: string[] = [];
    let statusList: string[] = [];

    //如果从列表打开群发站内信;
    if (!this.isToMemberDetial) {
      const { sourceValList, statusValList } = this.dataMessage;
      sourceList = sourceValList
        .map((e) => {
          const map = this.dataMessage.sourceList.find((obj) => obj.categoryDescription === e);
          return map && map.categoryCode ? map.categoryCode : '';
        })
        .filter((value) => value !== '');

      statusList = statusValList
        .map((e) => {
          const map = this.dataMessage.statusList.find((obj) => obj.categoryDescription === e);
          return map && map.categoryCode ? map.categoryCode : '';
        })
        .filter((value) => value !== '');
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .createNotice({
        titleContent,
        tenantId: this.tenantId,
        id: 0,
        noticeType: this.messageType,
        userIdList: this.dataMessage.userIdList,
        queryInfo: {
          isAll: this.dataMessage.userUidAll,
          vipList: this.dataMessage.vipList.filter((e) => e !== ''),
          sourceList,
          statusList,
        },
      })
      .subscribe(async (res) => {
        //msg: '发送成功',
        const sendSuccess: any = await lastValueFrom(this.langService.get('common.sendSuccess').pipe(take(1)));
        //msg: '发送失败',
        const sendFailed: any = await lastValueFrom(this.langService.get('common.sendFailed').pipe(take(1)));
        this.appService.isContentLoadingSubject.next(false);
        if (res === true) {
          //从总览中打开信息则返回到总览页
          if (this.isToMemberDetial) {
            this.router.navigate(['/member/list/detail/overview'], {
              queryParams: {
                id: this.route.snapshot.queryParams['id'],
                uid: this.route.snapshot.queryParams['uid'],
                tenantId: this.route.snapshot.queryParams['tenantId'],
              },
            });
          } else {
            this.router.navigate(['/member/list']); //从列表打开群发站内信返回列表页
          }
          this.appService.showToastSubject.next({
            msg: sendSuccess,
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msg: sendFailed,
            successed: false,
          });
        }
      });
  }

  /** 返回 */
  onBack() {
    this.location.back();
  }

  @ViewChild('allVipSelected') private allVipSelected: MatOption;
  toggleAllVip() {
    if (this.allVipSelected.selected) {
      this.dataMessage.vipList = [...this.vipLevelList.map((item) => item.value), ''];
    } else {
      this.dataMessage.vipList = [];
    }
  }

  /**
   * 下拉选择VIP
   */
  toggleVip() {
    if (this.allVipSelected.selected) {
      return this.allVipSelected.deselect();
    }
    if (this.dataMessage.vipList.length == this.vipLevelList.length) this.allVipSelected.select();
  }
}
