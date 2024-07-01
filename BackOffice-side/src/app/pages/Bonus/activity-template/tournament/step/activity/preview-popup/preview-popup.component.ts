import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { GameLabelApi } from 'src/app/shared/api/game-label.api';
import { GameApi } from 'src/app/shared/api/game.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { IconCountryComponent, CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { PrizeAmountType } from 'src/app/shared/interfaces/activity';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'tournament-preview-popup',
  templateUrl: './preview-popup.component.html',
  styleUrls: ['./preview-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormWrapComponent,
    AngularSvgIconModule,
    FormsModule,
    LoadingDirective,
    EmptyComponent,
    LangPipe,
    ModalFooterComponent,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    MatFormFieldModule,
    UploadComponent,
    IconCountryComponent,
    CurrencyValuePipe,
    CurrencyIconDirective,
    HostPipe,
  ],
})
export class TournamentPreviewPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<TournamentPreviewPopupComponent, boolean>,
    private appService: AppService,
    private fb: FormBuilder,
    private api: ActivityAPI,
    private gameLabelApi: GameLabelApi,
    public lang: LangService,
    private selectApi: SelectApi,
    private gameApi: GameApi
  ) {}

  protected readonly PrizeAmountType = PrizeAmountType;

  @Input() tmpCode;
  @Input() tenantId;

  /** 第三步数据 */
  @Input() prizePoolList;

  /** 活动第一步 - 数据 */
  stepOneInfo;
  thumbnailsImage = '';
  selectLang = ['zh-cn']; // PM:默认值CN
  formGroup = this.fb.group({
    lang: this.fb.array([
      this.fb.group({
        title: [''], // 标题
        subTitle: [''], // 副标题
        tc: [''], // T&C
        languageCode: ['zh-cn'],
      }),
    ]),
  });

  /** 活动第二步 - 数据 */
  stepTwoInfo;
  selectedLabelList: any[] = []; // 已选择的游戏标签
  selectedGameList: any[] = []; // 已选择的游戏
  selectCountryList: any[] = []; // 已选的国家
  memberManualRemark = ''; // 已选的会员UID
  criteriaList: any = [
    // 条件
    { name: '倍数', lang: 'Highest single win', value: 0 },
    { name: '投注总金额', lang: 'Total amount wagered', value: 1 },
    { name: '总旋转次数/总回合数', lang: 'Totalspins', value: 2 },
    { name: '总赢次数', lang: 'TotalWin', value: 3 },
  ];

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.api.activityDetailStep1(this.tmpCode, this.tenantId),
      this.api.newrank_get_steptwo(this.tmpCode, this.tenantId),
      this.selectApi.getCountry(),
      this.gameLabelApi.getList(this.tenantId)
    ).subscribe(([stepOneInfo, stepTwoInfo, countryList, gameLabelList]) => {
      this.appService.isContentLoadingSubject.next(false);

      /** 第一步 */
      this.stepOneInfo = stepOneInfo || {};
      if (stepOneInfo?.infoList?.length) {
        this.selectLang = stepOneInfo.infoList.map((e) => e.languageCode);
        this.formGroup.setControl(
          'lang',
          this.fb.array(
            stepOneInfo.infoList.map((e) =>
              this.fb.group({
                title: [e.name],
                subTitle: [e?.subName],
                tc: [e?.content],
                languageCode: [e?.languageCode],
              })
            )
          ) as any
        );
      }

      /** 第二步 */
      this.stepTwoInfo = stepTwoInfo?.data || {};
      // 游戏列表 - 标签列表
      if (this.stepTwoInfo?.labelIds && this.stepTwoInfo?.labelIds?.length && gameLabelList?.length) {
        this.selectedLabelList = gameLabelList.filter((v) => [...(this.stepTwoInfo?.labelIds || [])].includes(v.id));
      }
      // 游戏列表 - 游戏数据
      if (this.stepTwoInfo?.byGameTypes && this.stepTwoInfo?.byGameTypes?.length) {
        const gameIdsList = this.stepTwoInfo?.byGameTypes.map((v) => v?.gameId).filter((j) => j) || [];
        this.getgamelistbygameids(gameIdsList);
      }
      // 国家限制 - 获取国家
      if (this.stepTwoInfo?.countryType === 1 && this.stepTwoInfo?.countrys.length && countryList?.length) {
        this.selectCountryList = countryList
          .map((e) => e.countries.filter((j) => this.stepTwoInfo?.countrys?.includes(j.countryIso3)))
          .flat(Infinity);
      }
      // 玩家限制 - 获取UID
      if ([1, 2].includes(this.stepTwoInfo?.uidType)) {
        this.memberManualRemark = this.stepTwoInfo.uids?.users?.map((v) => v.uid).join(';') || '';
      }
    });
  }

  getCriteria(value) {
    return this.criteriaList.find((v) => v.value === value);
  }

  /** 游戏列表 - 游戏ids获取游戏列表 */
  getgamelistbygameids(idsList: number[]) {
    const parmas = {
      tenantId: this.tenantId,
      ids: idsList,
    };
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi.getgamelistbygameids(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.selectedGameList = res || [];
    });
  }
}
