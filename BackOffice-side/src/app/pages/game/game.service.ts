import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { StatusService, TypeLangService } from 'src/app/shared/interfaces/status';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ProviderStatus } from 'src/app/shared/interfaces/provider';
import { GameCategory } from 'src/app/shared/interfaces/game';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ThemeTypeEnum } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  constructor(private lang: LangService) {
    (async () => {
      this.statusListText = await Promise.all(this.statusList.map((e) => this.getStateLabel(e.value)));
    })();
  }

  statusListText: Array<StatusService<ProviderStatus> & { text: string }> = [];

  /**
   * 状态
   */
  readonly statusList: StatusService<ProviderStatus>[] = [
    { name: '上架', value: 'Online', type: ThemeTypeEnum.Success, lang: ['game.provider.up'], langArgs: {} },
    { name: '下架', value: 'Offline', type: ThemeTypeEnum.Danger, lang: ['game.provider.down'], langArgs: {} },
    { name: '维护', value: 'Maintenance', type: ThemeTypeEnum.Warning, lang: ['game.provider.main'], langArgs: {} },
    { name: '未知', value: 'None', type: ThemeTypeEnum.Default, lang: ['common.unknown'], langArgs: {} },
  ];

  getState = (status: string): StatusService<ProviderStatus> | undefined => {
    const stateList = cloneDeep(this.statusList);

    return stateList.find((e) => e.value === status) || ({ langArgs: {} } as any);
  };

  async getStateText(status) {
    const item = this.getState(status);

    if (!item?.lang?.length) return Promise.resolve('');

    return this.lang.getOneArr(item.lang, item.langArgs);
  }

  async getStateLabel(status) {
    const item = this.getState(status);
    let text = '';

    if (item?.lang?.length) {
      text = (await this.lang.getOneArr(item.lang, item.langArgs)) || '';
    }

    return { ...item, text: text || '' };
  }
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private lang: LangService) {
    (async () => {
      this.categoryTextList = await Promise.all(this.categoryList.map((e) => this.getCategoryText(e.value)));
    })();
  }

  categoryTextList: Array<string | undefined> = [];

  /**
   * 状态
   */
  readonly categoryList: TypeLangService<GameCategory>[] = [
    { name: '体育', value: 'SportsBook', type: ThemeTypeEnum.Default, lang: 'game.type.SportsBook', langArgs: {} },
    { name: '电子竞技', value: 'Esports', type: ThemeTypeEnum.Default, lang: 'game.type.Esports', langArgs: {} },
    { name: '彩票', value: 'Lottery', type: ThemeTypeEnum.Default, lang: 'game.type.Lottery', langArgs: {} },
    {
      name: '真人娱乐场',
      value: 'LiveCasino',
      type: ThemeTypeEnum.Default,
      lang: 'game.type.LiveCasino',
      langArgs: {},
    },
    { name: '老虎机', value: 'SlotGame', type: ThemeTypeEnum.Default, lang: 'game.type.SlotGame', langArgs: {} },
    { name: '棋牌', value: 'Chess', type: ThemeTypeEnum.Default, lang: 'game.type.Chess', langArgs: {} },
  ];

  getCategory = (status: string): TypeLangService<GameCategory> | undefined => {
    const stateList = cloneDeep(this.categoryList);

    return stateList.find((e) => e.value === status) || ({ langArgs: {} } as any);
  };

  async getCategoryText(status): Promise<string | undefined> {
    const item = this.getCategory(status);

    if (!item?.lang?.length) return Promise.resolve('');

    return this.lang.getOne(item.lang, item.langArgs);
  }
}

@Pipe({
  name: 'gameCategoryLang',
  standalone: true,
  pure: false,
})
export class GameCategoryLangPipe implements PipeTransform {
  constructor(
    private gameService: GameService,
    private lang: LangService
  ) {}

  value = '';
  destroy$ = new Subject<void>();
  transform(value: any): string {
    const lang = this.gameService.getCategory(value)?.lang || '';

    if (!value || !lang) {
      this.value = '-';
      return this.value;
    }

    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$ = new Subject<void>();

    this.lang
      .get(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        this.value = e;
      });

    return this.value;
  }
}
