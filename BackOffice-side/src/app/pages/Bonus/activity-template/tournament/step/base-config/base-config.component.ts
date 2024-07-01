import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { UEditorComponent } from 'src/app/components/ueditor';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivityTypeEnum } from 'src/app/shared/interfaces/activity';
import { filter, finalize, forkJoin, switchMap, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewContestStatusEnum } from 'src/app/shared/interfaces/activity';

@Component({
  selector: 'tournament-base-config',
  templateUrl: './base-config.component.html',
  styleUrls: ['./base-config.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    LangTabComponent,
    UEditorComponent,
    UploadComponent,
  ],
})
export class TournamentBaseConfigComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public appService: AppService,
    public router: Router,
    private api: ActivityAPI
  ) {
    const { activityType } = activatedRoute.snapshot.params;
    const { id, code } = activatedRoute.snapshot.params;

    const { tenantId, configState } = activatedRoute.snapshot.queryParams;

    this.id = +id || 0; // 空为新建
    this.code = code || '';
    this.activityType = ActivityTypeEnum[activityType] as any;

    this.tenantId = +tenantId;
    this.configState = +configState;
  }

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;

  /** 语系数据 */
  selectLang = ['zh-cn'];

  /** 商户ID */
  tenantId;

  /** 活动ID */
  id = 0;

  /** 活动状态 */
  configState: NewContestStatusEnum;

  /**
   * 活动Code
   */
  code = '';

  /** 活动类型 */
  activityType: ActivityTypeEnum;

  /** 营销图 */
  thumbnailsImage = '';

  /** 名称多语系 */
  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  /**
   * 编辑 - 活动状态：进行中
   * @Note 只允许编辑文案，不可进行下一步操作
   *  */
  get isProcessingEdit() {
    return this.configState === NewContestStatusEnum.Processing;
  }

  ngOnInit() {
    this.loadForm();
    this.id && this.getDetail();
  }

  /** 初始化语言表单 */
  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          title: ['', Validators.required], // 标题
          subTitle: [''], // 副标题
          tc: ['', Validators.required], // T&C
          languageCode: ['zh-cn'],
        }),
      ]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  /** 更新语言表单 */
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        title: '',
        subTitle: '',
        tc: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        title: [value.title, Validators.required],
        subTitle: [value.subTitle],
        tc: [value.tc, Validators.required],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  /** 获取详情 */
  getDetail() {
    this.appService.isContentLoadingSubject.next(true);
    zip([this.api.activityDetailStep1(this.id, this.tenantId)]).subscribe(([goGamingRes]) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!goGamingRes) return;

      this.thumbnailsImage = goGamingRes?.thumbnails;
      if (goGamingRes.infoList?.length) {
        this.selectLang = goGamingRes.infoList.map((e) => e.languageCode);
        this.formGroup.setControl(
          'lang',
          this.fb.array(
            goGamingRes.infoList.map((e) =>
              this.fb.group({
                title: [e.name, Validators.required],
                subTitle: [e?.subName],
                tc: [e?.content, Validators.required],
                languageCode: [e?.languageCode],
              })
            )
          )
        );
      }
    });
  }

  /** 提交 */
  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const infoList =
      this.formGroup.value.lang?.map((e) => ({
        languageCode: e.languageCode, // 语言Code
        name: e.title, // 标题
        subName: e.subTitle, // 副标题
        content: e.tc, // T&C
      })) || [];

    const parmas = {
      tenantId: this.tenantId,
      id: String(this.id || '0'),
      type: this.activityType,
      thumbnails: this.thumbnailsImage,
      infoList,
    };

    this.appService.isContentLoadingSubject.next(true);
    // goGaming平台的的基础配置接口
    this.api[this.id ? 'activityUpdateStep1' : 'activityCreateStep1'](parmas)
      .pipe(
        switchMap((step1) => {
          // bonus子服务的基础配置接口
          const beseConfigParmas = {
            tenantId: this.tenantId,
            tmpCode: step1.activityCode,
            tmpName: infoList[0]?.name,
          };
          const qualificationAPI = this.api.newrank_addorupdate_stepone(beseConfigParmas).pipe(
            map((res) => {
              const isSuccess = res?.code === '0000';

              // 抛出返回的错误信息
              !isSuccess &&
                this.appService.showToastSubject.next(
                  res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
                );

              return isSuccess ? step1.activityCode : null;
            }),
            filter((e) => !!e)
          );
          return forkJoin([qualificationAPI]).pipe(map(() => step1));
        }),
        finalize(() => this.appService.isContentLoadingSubject.next(false))
      )
      .subscribe(({ id, activityCode }) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!(typeof activityCode === 'string' && activityCode.length)) {
          this.appService.toastOpera(false);
          throw new Error('responseData id is null or type is not number');
        }

        this.id = id;
        this.code = activityCode;

        if (this.isProcessingEdit) {
          this.router.navigate(['/bonus/activity-manage/NewRank']);
        } else {
          this.jump('tournament-qualifications');
        }
      });
  }

  jump(lastPath: string) {
    const prefix = this.router.url.split('/').slice(0, 7).join('/');
    return this.router.navigate([`${prefix}/${lastPath}`, this.id, this.code], {
      queryParamsHandling: 'merge',
      queryParams: {
        tenantId: this.tenantId,
        ...(this.configState ? { configState: this.configState } : {}),
      },
    });
  }
}
