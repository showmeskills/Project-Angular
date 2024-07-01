import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { finalize, forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { ZoneApi } from 'src/app/shared/api/zone.api';
import { FormValidator } from 'src/app/shared/form-validator';
import { Language } from 'src/app/shared/interfaces/zone';
import { LanguageWarningComponent } from '../component/language-warning.component';
import { moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { GameLabelEditComponent } from './game-label-edit/game-label-edit.component';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { SelectDirective } from 'src/app/shared/directive/select.directive';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgTemplateOutlet, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-game-label',
  templateUrl: './game-label.component.html',
  styleUrls: ['./game-label.component.scss'],
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
    LangPipe,
  ],
})
export class GameLabelComponent implements OnInit {
  editLabeldPopupRef!: NgbModalRef;
  addLabelPoupRef!: NgbModalRef;
  confirmPoupRef!: NgbModalRef;

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;
  word: any;

  constructor(
    private gameLabelApi: GameLabelApi,
    private zoneApi: ZoneApi,
    private appService: AppService,
    private modalService: NgbModal,
    private matModalService: MatModal,
    private fb: FormBuilder,
    public lang: LangService,
    private subHeaderService: SubHeaderService,
    private destroy$: DestroyService
  ) {}

  isLoading = false;

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

  languageCodes: any = ['zh-cn'];

  //当前选择语言的下标
  currentIndex = 0;

  // 当前被打开的 新增弹窗类型
  selecedPopup: any = '';

  // popup
  id?: any; // 标签管理 当前选中的标签ID
  curTab = 0; // 当前tab索引
  showEditTab = false; // 编辑i18n
  imgDomain = ''; // 图片域名
  selectLang = ['zh-cn']; // PM:默认值CN
  langList: Language[] = [{ code: 'zh-cn', enabled: true, name: '中文', disabled: true }]; // PM:默认值CN

  get langArrayForm() {
    return this.formGroup.get('lang') as FormArray;
  }

  get langTabList(): Language[] {
    return this.selectLang?.map((e) => this.langList.find((j) => j.code === e) as Language);
  }

  get curLang(): Language | undefined {
    return this.langList.find((e) => e.code === this.selectLang[this.curTab]);
  }

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadForm();
      this.loadData();
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取页面数据
  loadData() {
    this.loading(true);
    forkJoin([
      this.gameLabelApi.getList(+this.subHeaderService.merchantCurrentId),
      this.gameLabelApi.getSceneslist(+this.subHeaderService.merchantCurrentId),
      this.zoneApi.getLanguages(),
    ]).subscribe(([list, labelsList, lang]) => {
      this.loading(false);

      // 编辑/新增弹窗 多语系处理
      this.langList = lang || [];

      // 获取图片上传地址 -> 方便新增标签有图片域名地址
      this.imgDomain = list[0]?.iconAddress;

      this.list = list || [];

      this.contentList = labelsList.contentList || [];

      this.languageCodes = labelsList.contentList.map((res) => res.languageCode);
    });
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          name: ['', Validators.compose([Validators.required])],
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

  // 拖拽
  drop(event: any, type: any, index) {
    let list;
    if (type === 'hall') {
      list = this.contentList[index]?.hallLabelList;
    } else if (type === 'hallBarl') {
      list = this.contentList[index]?.hallBarLabelList;
    } else if (type === 'menu') {
      list = this.contentList[index]?.menuLabelList;
    } else if (type === 'front') {
      list = this.contentList[index]?.frontPageList;
    }
    moveItemInArray(list, event.previousIndex, event.currentIndex);
  }

  // 删除 大厅/菜单 标签
  onDelLabel(i: number, type: any, index) {
    if (type === 'hall') {
      this.contentList[index]?.hallLabelList.splice(i, 1);
    } else if (type === 'hallBarl') {
      this.contentList[index]?.hallBarLabelList.splice(i, 1);
    } else if (type === 'menu') {
      this.contentList[index]?.menuLabelList.splice(i, 1);
    } else if (type === 'front') {
      this.contentList[index]?.frontPageList.splice(i, 1);
    }
  }

  // 重置
  reset() {
    this.loadData();
  }

  onOpenConfirmPopup(temp: TemplateRef<any>) {
    this.confirmPoupRef = this.modalService.open(temp, { centered: true });
  }

  onConfirmSubmit() {
    this.confirmPoupRef.close();
    this.loading(true);
    const list = this.contentList.map((e) => {
      e.hallLabelList.forEach((item) => {
        item.scenesType = 'Hall';
      });
      e.hallBarLabelList.forEach((item) => {
        item.scenesType = 'HallBar';
      });
      e.menuLabelList.forEach((item) => {
        item.scenesType = 'Menu';
      });
      e.frontPageList.forEach((item) => {
        item.scenesType = 'FrontPage';
      });
      return e;
    });

    const param: any = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      contentList: list,
    };

    this.gameLabelApi
      .addscenesLabel(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (res === true) {
          this.appService.showToastSubject.next({
            msgLang: 'game.saveSuc',
            successed: true,
          });
          this.loadData();
        } else {
          this.appService.showToastSubject.next({
            msgLang: 'game.saveFailed',
            successed: false,
          });
        }
      });
  }

  // 提交的语言
  onLanguage(languages) {
    if (!languages.length)
      return this.appService.showToastSubject.next({
        msgLang: 'components.languageNeed',
        successed: false,
      });

    const lang = languages.map((e) => e.code);
    const hasRemove = !this.selectLang.every((e) => lang.includes(e)); // 是否有移除语言情况
    const done = () => {
      // 当前选中的语言被改变或删除了
      if (this.selectLang[this.curTab] !== lang[this.curTab]) {
        // 尝试找到之前的语种
        const i = lang.indexOf(this.selectLang[this.curTab]);
        this.curTab = i == -1 ? 0 : i;
      }
      this.selectLang = lang;
      this.updateLanguageForm();
    };

    if (hasRemove) {
      // 有删除 警告确认再赋值
      this.modalService.open(LanguageWarningComponent, { centered: true }).result.then(({ value }) => {
        value && done();
      });
    } else {
      done();
    }
  }

  // 更新语言表单
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        name: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        name: [value.name, Validators.compose([Validators.required])],
        languageCode: [value.languageCode],
      });
    });

    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  // 打开 新增/编辑 弹窗
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
                  languageCode: [e.languageCode],
                })
              )
            )
          );

          this.editLabeldPopupRef = this.modalService.open(temp, {
            centered: true,
          });
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
              languageCode,
            })
          )
        )
      );

      this.editLabeldPopupRef = this.modalService.open(temp, {
        centered: true,
      });
    }
  }

  // 确认 更新/新增 弹窗
  onLabelSubmit() {
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
            this.editLabeldPopupRef.close();
            this.appService.showToastSubject.next({
              msgLang: 'game.updateLabelSuc',
              successed: true,
            });
            this.loadData();
          } else {
            this.appService.showToastSubject.next({
              msgLang: res.detail || 'game.updateLabelFailed',
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
            this.editLabeldPopupRef.close();
            this.appService.showToastSubject.next({
              msgLang: 'game.addTagSuc',
              successed: true,
            });
            this.loadData();
          } else {
            this.appService.showToastSubject.next({
              msgLang: 'game.addTagFailed',
              successed: false,
            });
          }
        });
    }
  }

  // 打开 大厅/菜单 弹窗
  openAddLabelPopup(temp: TemplateRef<any>, type: any, index) {
    this.selecedPopup = type;
    let addList: any = [];

    if (type === 'hall') {
      if (this.hallLabelList.length >= 10) {
        this.appService.showToastSubject.next({
          msgLang: 'game.delLabelTip',
          successed: false,
        });
        return;
      }
      addList = this.contentList[index]?.hallLabelList;
    } else if (type === 'hallBarl') {
      if (this.hallBarLabelList.length >= 10) {
        this.appService.showToastSubject.next({
          msgLang: 'game.horizontalTagDel',
          successed: false,
        });
        return;
      }
      addList = this.contentList[index]?.hallBarLabelList;
    } else if (type === 'menu') {
      if (this.menuLabelList.length >= 10) {
        this.appService.showToastSubject.next({
          msgLang: 'game.menuLabelMoreDel',
          successed: false,
        });
        return;
      }
      addList = this.contentList[index]?.menuLabelList;
    } else if (type === 'front') {
      if (this.frontPageList.length >= 10) {
        this.appService.showToastSubject.next({
          msgLang: 'game.homeLabelMoreDel',
          successed: false,
        });
        return;
      }
      addList = this.contentList[index]?.frontPageList;
    }
    // 筛选 所有标签除 大厅/菜单 的其余标签 并取消所有勾选。
    addList = addList ? addList : [];
    this.addLabelList = this.list.filter((v) => !addList.map((v) => v.labelId).includes(v.id));
    this.addLabelList.forEach((item) => {
      item.checked = false;
      item.isPlayground = false;
      item.config = { assignUrl: '', redirectMethod: 'LabelPage', sortMethod: 'ManualSort' };
      item.excludeLabels = [];
    });
    if (this.addLabelList.length === 0) {
      this.appService.showToastSubject.next({
        msgLang: 'game.provider.noTagsAdd',
        successed: false,
      });
    }
    if (this.addLabelList.length > 0) this.addLabelPoupRef = this.modalService.open(temp, { centered: true });
    this.currentIndex = index;
  }

  // 确认 大厅/菜单 弹窗
  onAddLabelSubmit() {
    // 筛选出 勾选内容 并 添加labelId 字段。
    const list = cloneDeep(this.addLabelList.filter((v) => v.checked));
    list.forEach((j) => (j.labelId = j.id));

    // 确认 新增标签弹窗 对勾选的内容进行页面数据添加。
    if (this.selecedPopup === 'hall') {
      const hallNewList = [...(this.contentList[this.currentIndex]?.hallLabelList || []), ...list];
      if (hallNewList.length > 100) {
        this.appService.showToastSubject.next({
          msgLang: 'game.labbyLabelMoreControl',
          successed: false,
        });
        return;
      }
      this.contentList[this.currentIndex].hallLabelList = hallNewList;
    } else if (this.selecedPopup === 'hallBarl') {
      const menuNewList = [...(this.contentList[this.currentIndex]?.hallBarLabelList || []), ...list];
      if (menuNewList.length > 100) {
        this.appService.showToastSubject.next({
          msgLang: 'game.herLabelMoreControl',
          successed: false,
        });
        return;
      }
      this.contentList[this.currentIndex].hallBarLabelList = menuNewList;
    } else if (this.selecedPopup === 'menu') {
      const menuNewList = [...(this.contentList[this.currentIndex]?.menuLabelList || []), ...list];
      if (menuNewList.length > 100) {
        this.appService.showToastSubject.next({
          msgLang: 'game.menuLabelMoreControl',
          successed: false,
        });
        return;
      }
      this.contentList[this.currentIndex].menuLabelList = menuNewList;
    } else if (this.selecedPopup === 'front') {
      const menuNewList = [...(this.contentList[this.currentIndex]?.frontPageList || []), ...list];
      if (menuNewList.length > 100) {
        this.appService.showToastSubject.next({
          msgLang: 'game.homeLabelMoreControl',
          successed: false,
        });
        return;
      }
      this.contentList[this.currentIndex].frontPageList = menuNewList;
    }
    this.addLabelPoupRef.close();
  }

  /** 首页标签,大厅列表标签弹窗 */
  onEdit(item, flag = false, currentList) {
    // 是否已经有娱乐场开关已经开启 ture为没有开启
    const isAll = currentList.every((e) => !e.isPlayground);

    // 完成数组赋值
    const [...list] = cloneDeep(this.list);
    list.forEach((value) => {
      value.checked = false;
    });

    const modelref = this.matModalService.open(GameLabelEditComponent, {
      width: '600px',
      data: { item, flag, addLabelList: list, isAll },
      disableClose: true,
    });
    modelref.result.then(function (res) {
      if (res) {
        item.excludeLabels = res.excludeLabels;
        item.isPlayground = res.isPlayground;
        item.config.redirectMethod = res.redirectMethod;
        item.config.assignUrl = res.assignUrl;
        item.config.assignAppUrl = res.assignAppUrl;
        item.multiLine = res.multiLine;
      }
    });
  }

  /**语言变更 */
  updateLanguage(e) {
    this.contentList = e.map((languageCode) => ({
      languageCode,
      frontPageList: [],
      hallLabelList: [],
      menuLabelList: [],
      hallBarLabelList: [],
      ...this.contentList.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
    }));
  }
}
