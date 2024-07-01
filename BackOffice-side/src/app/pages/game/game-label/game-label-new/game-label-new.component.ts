import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { finalize, forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { FormValidator } from 'src/app/shared/form-validator';
import { Language } from 'src/app/shared/interfaces/zone';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { SelectApi } from 'src/app/shared/api/select.api';
import { GameSearchComponent } from '../game-search/game-search.component';
import { GameApi } from 'src/app/shared/api/game.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-game-label-new',
  templateUrl: './game-label-new.component.html',
  styleUrls: ['./game-label-new.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    NgFor,
    AngularSvgIconModule,
    LangTabComponent,
    CdkDropList,
    CdkDrag,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    SelectGroupComponent,
    SelectDirective,
    NgIf,
    NgStyle,
    UploadComponent,
    ModalFooterComponent,
    ModalTitleComponent,
    FormRowComponent,
    InputNumberDirective,
    NgbPopover,
    LangPipe,
  ],
})
export class GameLabelNewComponent implements OnInit {
  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  word: any;

  constructor(
    private gameLabelApi: GameLabelApi,
    private zoneApi: ZoneApi,
    private appService: AppService,
    private matModalService: MatModal,
    private fb: FormBuilder,
    public lang: LangService,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private selectApi: SelectApi,
    private gameApi: GameApi
  ) {}

  isLoading = false;
  type = 'LabelPage';
  langIndex = 1;
  isHome = true;
  // 标签管理
  list: any = [];
  // 大厅/菜单 标签
  contentList: any = [];
  hallLabelList: any = [];
  hallBarLabelList: any = [];
  menuLabelList: any = [];
  frontPageList: any = [];
  // 可增加的 大厅/菜单 标签
  addLabelList: any = [];
  languageCodes: string[] = ['zh-cn'];
  // 当前选择语言的下标
  currentIndex = 0;
  // 当前被打开的 新增弹窗类型
  selecedPopup: any = '';
  // 娱乐场是否能被开启
  disable = true;
  // 娱乐场排除数组
  excludeList: any[] = [];
  // popup
  id?: any; // 标签管理 当前选中的标签ID
  curTab = 0; // 当前tab索引
  showEditTab = false; // 编辑i18n
  imgDomain = ''; // 图片域名
  currentLang = 'zh-cn'; //当前语言
  selectLang = ['zh-cn']; // PM:默认值CN
  langList: Language[] = [{ code: 'zh-cn', enabled: true, name: '中文', disabled: true }]; // PM:默认值CN

  headerList: any[] = []; // 首页菜单标签
  leftList: any[] = []; // 左侧菜单标签
  navigationList: any[] = []; // 导航栏菜单标签

  navigationExpandList: any[] = []; // 导航栏展开菜单标签
  expandList: any[] = []; // 展开菜单标签
  horizontalList: any[] = []; // 横栏标签
  verticallyList: any[] = []; // 列表标签

  /** 编辑弹窗title*/
  titleName = '';
  /** 展开列表弹窗状态*/
  pullType = 'LabelPage';
  /** 启用收藏*/
  enableFavorites = false;
  /** 启用近期玩过 */
  enableRecentlyPlayed = false;
  gameCode = '';
  /** 游戏厂商数据 */
  providerList: any[] = [];
  /** 厂商名字 */
  providerName = '';
  /** 厂商游戏id */
  gameCodeList: any[] = [];
  /** 厂商id的名字*/
  codeName = '';
  /** 厂商id*/
  providerCatId = '';
  // 编辑弹窗
  // editLabeldPopupRef:
  pullTypeList = [
    { name: '标签页', value: 'LabelPage', lang: 'game.provider.newLabel.label' },
    { name: '指定url', value: 'AssignUrl', lang: 'game.provider.newLabel.link' },
    { name: '指定厂商', value: 'AssignProvider', lang: 'game.provider.newLabel.provider' },
    { name: '指定游戏', value: 'AssignGame', lang: 'game.provider.newLabel.game' },
  ];

  get langArrayForm() {
    return this.formGroup.get('lang') as FormArray;
  }

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadForm();
      this.loadData();
    });
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /** 获取页面数据*/
  loadData() {
    this.loading(true);
    forkJoin([
      this.gameLabelApi.getList(+this.subHeaderService.merchantCurrentId),
      this.gameLabelApi.getScenesGroupData({
        tenantId: +this.subHeaderService.merchantCurrentId,
        lang: this.currentLang,
      }),
      this.zoneApi.getLanguages(),
      this.selectApi.getCategorySelect(+this.subHeaderService.merchantCurrentId, ['Online', 'Maintenance']),
    ]).subscribe(([list, labelsList, lang, provider]) => {
      this.loading(false);
      this.languageCodes = lang.map((e) => e.code);
      // 编辑/新增弹窗 多语系处理
      this.langList = lang || [];
      // 获取图片上传地址 -> 方便新增标签有图片域名地址
      this.imgDomain = list[0]?.iconAddress;
      this.list = list || [];
      // 获取游戏厂商过滤掉
      this.providerList =
        provider.flatMap((obj) => obj.providers).filter((obj) => obj.providerCatId !== 'GBGame-3') || [];

      this.headerList = labelsList.filter((item) => item.key === 'Header'); // 首页菜单标签
      this.leftList = labelsList.filter((item) => item.key === 'Left'); // 左侧菜单标签
      this.navigationList = labelsList.filter((item) => item.key === 'Navigation'); // 导航栏菜单标签

      this.navigationExpandList = labelsList.filter((item) => item.key === 'NavigationExpand'); // 导航栏展开菜单标签
      this.expandList = labelsList.filter((item) => item.key === 'Expand'); // 展开菜单标签
      this.horizontalList = labelsList.filter((item) => item.key === 'Horizontal'); // 横栏标签
      this.verticallyList = labelsList.filter((item) => item.key === 'Vertically'); // 列表标签
    });
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          name: ['', Validators.compose([Validators.required])],
          alias: ['', Validators.compose([Validators.required])],
          languageCode: ['zh-cn'],
        }),
      ]),
      icon: [''],
      menuIcon: [''],
      image: [''],
      webImage: [''], //活动推荐图web（新模版)
      hfiveImage: [''], //活动推荐图H5（新模版)
      activitySwitch: [false], //活动推荐图按钮
      promotionSwicth: [false], //活动促销按钮
    });

    this.validator = new FormValidator(this.formGroup);
  }

  /** 标签排序*/
  drop(event: any, list) {
    const index = event.currentIndex + (event.previousIndex > event.currentIndex ? -1 : 0);
    let item = list[index];
    let currenItem = list[event.previousIndex];

    this.loading(true);
    this.gameLabelApi
      .updateScenesLabelSort({
        tenantId: +this.subHeaderService.merchantCurrentId,
        id: currenItem?.id,
        sort: event.currentIndex === 0 ? 1 : item?.sort + 1,
      })
      .subscribe(() => {
        this.loadScenesGroupData();
      });
  }

  /** 删除标签*/
  onDelLabel(id) {
    this.gameLabelApi.delScenesLabel({ tenantId: +this.subHeaderService.merchantCurrentId, id }).subscribe((res) => {
      const msgLang = res ? 'game.provider.newLabel.deletedSuc' : 'game.provider.newLabel.failedDelete';
      this.appService.showToastSubject.next({
        msgLang,
        successed: res,
      });
      this.loadScenesGroupData();
    });
  }

  loadScenesGroupData() {
    this.loading(true);
    this.gameLabelApi
      .getScenesGroupData({ tenantId: +this.subHeaderService.merchantCurrentId, lang: this.currentLang })
      .subscribe((labelsList) => {
        // 分配标签列表
        this.headerList = labelsList.filter((item) => item.key === 'Header');
        this.leftList = labelsList.filter((item) => item.key === 'Left');
        this.navigationList = labelsList.filter((item) => item.key === 'Navigation'); // 导航栏菜单标签

        this.navigationExpandList = labelsList.filter((item) => item.key === 'NavigationExpand'); // 导航栏展开菜单标签
        this.expandList = labelsList.filter((item) => item.key === 'Expand');
        this.horizontalList = labelsList.filter((item) => item.key === 'Horizontal');
        this.verticallyList = labelsList.filter((item) => item.key === 'Vertically');
        this.loading(false);
      });
  }

  onConfirmSubmit() {}

  /** 提交的语言*/
  onLanguage() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        name: '',
        alias: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        name: [value.name, Validators.required],
        alias: [value.alias, Validators.required],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  /**  标签管理新增/编辑 弹窗 */
  openAddEditPopup(temp: TemplateRef<any>, id: any) {
    this.id = id;
    // 关闭多语系选择框
    this.showEditTab = false;
    // 固定中文禁止操作
    this.langList.forEach((e) => e.code === 'zh-cn' && (e['disabled'] = true));
    // 置顶中文显示
    this.curTab = 0;
    // 清除 校验提示
    this.formGroup.markAsUntouched();

    // 更新
    if (id || id === 0) {
      this.loading(true);
      this.gameLabelApi
        .queryLabel({ id })
        .pipe(finalize(() => this.loading(false)))
        .subscribe((data) => {
          // 语言code 字段转小写
          data.labelInfo.forEach((v) => {
            v.languageCode = v.languageCode.toLowerCase();
          });

          this.imgDomain = data?.iconAddress;
          this.formGroup.patchValue({
            icon: data.icon,
            menuIcon: data.menuIcon || '',
            image: data.image,
            webImage: data.webRecommendImage, //活动推荐图web（新模版)
            hfiveImage: data.h5RecommendImage, //活动推荐图H5（新模版)
            activitySwitch: data.isActivityRecommend, //活动推荐图按钮
            promotionSwicth: data.openPromotion, //活动促销按钮
          });

          this.selectLang = data.labelInfo.map((e) => e.languageCode);
          this.formGroup.setControl(
            'lang',
            this.fb.array(
              data.labelInfo.map((e) =>
                this.fb.group({
                  name: [e.name, Validators.compose([Validators.required])],
                  alias: [e.alias, Validators.compose([Validators.required])],
                  languageCode: [e.languageCode],
                })
              )
            )
          );

          this.matModalService.open(temp);
        });
    } else {
      // 新增
      // 清空数据
      this.formGroup.patchValue({
        icon: '',
        menuIcon: '',
        image: '',
        webImage: '', //活动推荐图web（新模版)
        hfiveImage: '', //活动推荐图H5（新模版)
        activitySwitch: false, //活动推荐图按钮
        promotionSwicth: false, //活动促销按钮
      });
      this.selectLang = ['zh-cn'];
      this.formGroup.setControl(
        'lang',
        this.fb.array(
          this.selectLang.map((languageCode) =>
            this.fb.group({
              name: ['', Validators.compose([Validators.required])],
              alias: ['', Validators.compose([Validators.required])],
              languageCode,
            })
          )
        )
      );

      this.matModalService.open(temp);
    }
  }

  /** 确认 更新/新增 弹窗 */
  onLabelSubmit(c) {
    this.formGroup.markAllAsTouched(); // 手动执行验证

    if (this.langArrayForm.invalid) {
      // 语言未通过验证
      if (this.langArrayForm.controls[this.curTab].invalid) return; // 当前语言没通过直接退出
      this.langArrayForm.controls.some((e, i) => {
        // 语言未填写完整切换到相应语言索引，提高用户体验
        if (e.invalid) this.curTab = i;
        return e.invalid; // 找到未通过验证停止遍历
      });
    }

    if (this.formGroup.invalid) return;
    this.loading(true);
    if (this.id || this.id === 0) {
      const param = {
        tenantId: +this.subHeaderService.merchantCurrentId,
        id: this.id,
        icon: this.formGroup.value.icon,
        menuIcon: this.formGroup.value.menuIcon,
        image: this.formGroup.value.image,
        labelNameList: this.formGroup.value.lang,
        webRecommendImage: this.formGroup.value.webImage, //活动推荐图web（新模版)
        h5RecommendImage: this.formGroup.value.hfiveImage, //活动推荐图H5（新模版)
        isActivityRecommend: this.formGroup.value.activitySwitch, //活动推荐图按钮
        openPromotion: this.formGroup.value.promotionSwicth, //活动促销按钮
      };
      this.gameLabelApi
        .updateLabel(param)
        .pipe(finalize(() => this.loading(false)))
        .subscribe((res) => {
          if (res === true) {
            c();
            this.appService.showToastSubject.next({
              msgLang: 'common.updateCompleted',
              successed: true,
            });
            this.loadData();
          } else {
            this.appService.showToastSubject.next({
              msgLang: 'common.updateFailed',
              successed: false,
            });
          }
        });
    } else {
      const param = {
        tenantId: +this.subHeaderService.merchantCurrentId,
        labelNameList: this.formGroup.value.lang,
        icon: this.formGroup.value.icon,
        menuIcon: this.formGroup.value.menuIcon,
        image: this.formGroup.value.image,
        webRecommendImage: this.formGroup.value.webImage, //活动推荐图web（新模版)
        h5RecommendImage: this.formGroup.value.hfiveImage, //活动推荐图H5（新模版)
        isActivityRecommend: this.formGroup.value.activitySwitch, //活动推荐图按钮
        openPromotion: this.formGroup.value.promotionSwicth, //活动促销按钮
      };
      this.gameLabelApi
        .createLabel(param)
        .pipe(finalize(() => this.loading(false)))
        .subscribe((res) => {
          if (res === true) {
            c();
            this.appService.showToastSubject.next({
              msgLang: 'common.addSuccess',
              successed: true,
            });
            this.loadData();
          } else {
            this.appService.showToastSubject.next({
              msgLang: 'common.addFailed',
              successed: false,
            });
          }
        });
    }
  }

  /** 新增标签通用方法*/
  openAddLabelPopup(temp: TemplateRef<any>, list, pid, type) {
    let redirectMethod = '';
    switch (type) {
      case 'Header':
      case 'Navigation':
        // 指定Url
        redirectMethod = 'AssignUrl';
        break;
      case 'Left':
        //下拉展开
        redirectMethod = 'DropDownList';
        break;
      case 'Expand':
      case 'Horizontal':
      case 'Vertically':
      case 'NavigationExpand':
        // 标签页
        redirectMethod = 'LabelPage';
        break;
    }
    const LabelList = cloneDeep(this.list);
    this.addLabelList = LabelList.filter((v) => !list.map((v) => v.labelId).includes(v.id));
    if (this.addLabelList.length === 0) {
      return this.appService.showToastSubject.next({
        msgLang: 'game.provider.noTagsAdd',
        successed: false,
      });
    }
    this.addLabelList.forEach((item) => {
      item.checked = false; //是否选中
      item.isPlayground = false; //是否娱乐场
      item.config = {
        assignUrl: '',
        assignAppUrl: '',
        assignProviderId: '', // 指定厂商
        assignGameCode: '', // 指定游戏-Code
        assignGameProviderId: '', // 指定游戏-厂商Id
        assignDropDownListUrl: '', // 左侧菜单选择下拉展开时出现的指定url
      };
      item.excludeLabels = []; // 排除标签
      item.sortMethod = 'ManualSort'; // 排序方式默认人工
      item.multiLine = 1; // 显示行数
      item.redirectMethod = redirectMethod; // 跳转方式
      item.enableFavorites = false; // 启用收藏
      item.enableRecentlyPlayed = false; // 启用近期玩过
      item.scenesType = type; // 标签类型
      item.languageCode = this.currentLang; // 当前语言
      item.pid = pid; // 标识确认当前是哪一个标签进行新增
      item.labelId = item.id; // 将id赋值给labelid
      item.id = 0; // 新增id默认为0
    });
    // flag含义：true代表是添加标签 false代表添加娱乐场排除标签
    this.matModalService.open(temp, { data: { flag: true, pid, type } });
  }

  /** 添加标签确认按钮*/
  onAddLabelSubmit(data, c) {
    // 筛选出 勾选内容 并 添加labelId 字段
    const list = cloneDeep(this.addLabelList.filter((v) => v.checked));
    if (data.flag) {
      if (list.length === 0) {
        return this.appService.showToastSubject.next({
          // 请选择至少一个标签
          msgLang: 'game.provider.newLabel.selectOneLabel',
          successed: false,
        });
      }
      const params = {
        tenantId: +this.subHeaderService.merchantCurrentId,
        languageCode: this.currentLang,
        pid: data.pid,
        scenesType: data.type,
        list,
      };
      this.loading(true);
      this.gameLabelApi.addScenesData(params).subscribe((res) => {
        const msgLang = res ? 'common.addSuccess' : 'common.addFailed';
        this.appService.showToastSubject.next({
          msgLang,
          successed: res,
        });
        this.loadScenesGroupData();
      });
    }
    // 娱乐场排除标签
    if (!data.flag) {
      this.excludeList = [...this.excludeList, ...list];
    }
    c();
  }

  /** 打开展开，横栏，列表弹窗 */
  async onPullPoupPoup(tpl, data, name, list: any[] = []) {
    if (!data) return;

    let obj = this.providerList.find((obj) => obj.providerCatId === data.config.assignGameProviderId);
    if (obj) {
      this.getGameCodeList(obj, data.config.assignGameCode);
      // 赋值code
      this.providerName = `${obj?.providerName}(${obj.providerCatId})`;
    } else {
      this.providerName = '';
      this.codeName = '';
    }
    let firstName: string | undefined = '';
    switch (data.scenesType) {
      case 'Expand':
        // 下拉展开
        firstName = await this.lang.getOne('game.provider.newLabel.expand');
        break;
      case 'Horizontal':
        firstName = await this.lang.getOne('game.provider.newLabel.column');
        break;
      case 'Vertically':
        firstName = await this.lang.getOne('game.provider.newLabel.listLabel');
        break;
      case 'NavigationExpand':
        firstName = await this.lang.getOne('game.provider.newLabel.navigationBarExpandMenu');
        break;
    }
    // 弹窗名称
    this.titleName = `${firstName}-${name}-${data.labelName}`;
    if (data.scenesType === 'Vertically') {
      const LabelList = cloneDeep(this.list);
      // 赋值娱乐场排除列表
      this.excludeList = LabelList.filter((item) => data.excludeLabels?.includes(item.id));
      this.addLabelList.forEach((item) => {
        item.checked = false;
      });
      // 娱乐场是否能被选中的逻辑
      let isAll = list.every((e) => !e.isPlayground);
      if (isAll || (!isAll && data.isPlayground)) {
        this.disable = false;
      } else {
        this.disable = true;
      }
    }
    this.matModalService.open(tpl, {
      width: '680px',
      disableClose: true,
      data,
      // 传递被修改的值
    });
  }

  /** 语言变更 */
  languageChange(lang) {
    if (lang === this.currentLang) {
      return;
    }
    this.currentLang = lang;
    this.loading(true);
    this.loadScenesGroupData();
  }

  /** 打开头部弹窗*/
  onheaderPoup(tpl, isHome = true, item, name) {
    if (!item) {
      return;
    }
    // 场景标签跳转方式
    this.titleName = `${name}-${item.labelName}`;
    this.isHome = isHome;
    this.matModalService.open(tpl, {
      width: '600px',
      disableClose: true,
      // 传递被修改的值
      data: item,
    });
  }

  /** 弹窗确认逻辑 */
  popupConfirm(data, c) {
    if (!data) {
      return;
    }
    if (data?.redirectMethod === 'AssignGame') {
      // 后端传递的gamecode会有匹配不上的问题需要加上一个判断
      const matches = this.gameCodeList?.some((item) => item?.gameId === data.config.assignGameCode);
      if (!data.config.assignGameCode || !data.config.assignGameProviderId || !matches) {
        return this.appService.showToastSubject.next({ msgLang: 'game.provider.newLabel.gameSelected' });
      }
    }

    // 赋值
    const item = { ...data, excludeLabels: this.excludeList.map((v) => v.id) };
    this.gameLabelApi.addorUpdateScenesData(item).subscribe((res) => {
      const msgLang = res ? 'common.updateCompleted' : 'common.updateFailed';
      this.appService.showToastSubject.next({
        msgLang,
        successed: true,
      });
      this.loadScenesGroupData();
    });
    c();
  }

  /** 打开娱乐场晒除标签弹窗*/
  openPLayPopup(tpl, list) {
    this.matModalService.open(tpl, { data: { flag: false, list } });
    const LabelList = cloneDeep(this.list);
    this.addLabelList = LabelList.filter((item) => !this.excludeList.map((v) => v.id).includes(item.id));
    this.addLabelList.forEach((item) => {
      item.checked = false;
    });
  }

  /** 删除娱乐场排除标签 */
  onDelPlayLabel(i) {
    this.excludeList.splice(i, 1);
  }

  /** 打开厂商搜索框 */
  onOpen(data) {
    if (!data) {
      return;
    }
    if (!this.providerList?.length)
      return this.appService.showToastSubject.next({ msgLang: 'game.provider.noSuppliers' });
    let list = cloneDeep(this.providerList);
    list = list.map((provider) => ({
      ...provider,
      searchName: provider.providerName,
      searchDeatil: provider.providerCatId,
    }));
    const modelref = this.matModalService.open(GameSearchComponent, {
      width: '600px',
      data: { list, flag: true },
      disableClose: true,
    });
    modelref.result.then((res) => {
      if (res) {
        this.providerName = `${res?.providerName}(${res.providerCatId})`;
        data.config.assignGameProviderId = res.providerCatId;
        data.config.assignGameCode = '';
        this.getGameCodeList(res);
      }
    });
  }

  /** 打开游戏id搜索框 */
  async onOpenGameId(data) {
    if (!data) {
      return;
    }
    if (!this.gameCodeList?.length || !data.config.assignGameProviderId) {
      return this.appService.showToastSubject.next({ msgLang: 'game.provider.newLabel.noGames' });
    }
    let list = cloneDeep(this.gameCodeList);
    list = list.map((item) => ({
      ...item,
      searchName: item.name,
      searchDeatil: item.gameId,
    }));
    const modelref = this.matModalService.open(GameSearchComponent, {
      width: '600px',
      data: { list },
      disableClose: true,
    });
    modelref.result.then((res) => {
      if (res) {
        this.codeName = `${res?.name}(${res.gameId})`;
        data.config.assignGameCode = res.gameId;
      }
    });
  }

  /** 获取厂商下面的code */
  getGameCodeList(data, gameId = false) {
    if (!data) {
      return;
    }
    this.loading(true);
    this.gameApi
      .getGameListSelect({
        TenantId: +this.subHeaderService.merchantCurrentId,
        ProviderCatId: data.providerCatId,
      })
      .subscribe((res) => {
        this.codeName = '';
        this.loading(false);
        this.gameCodeList = res || [];
        if (gameId) {
          const res = this.gameCodeList.find((item) => item.gameId === gameId);
          res ? (this.codeName = `${res?.name}(${res?.gameId})`) : (this.codeName = '');
        }
      });
  }
}
