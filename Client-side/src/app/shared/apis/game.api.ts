/* eslint-disable jsdoc/require-returns-description */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SportEvent } from 'src/app/shared/interfaces/sport-event.interface';
import { environment } from 'src/environments/environment';
import {
  GameFavoriteList,
  GameList,
  GameListByLabelParams,
  GameListByTypeParams,
  GameListItem,
  GameProviderParams,
  GameSearch,
  GameSort,
  Gamelabel,
  LabelCodeList,
  NewGameList,
  PlayGameParams,
  PlayGameResponse,
  ProviderCategoryInterface,
  ProviderInterface,
  SceneData,
  ScenesGameResponse,
  ScenesInfo,
  ScenesLabelList,
} from '../interfaces/game.interface';
import { ResponseData, ResponseListData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class GameApi extends BaseApi {
  /**
   * 获取厂商列表
   *
   * @param category SportsBook, Lottery, Casino, Chess
   * @returns ProviderInterface
   */
  getProviderList(category: string = ''): Observable<ResponseData<ProviderInterface[]>> {
    const url = `${environment.apiUrl}/v1/game/provider`;
    return this.getByCaches(url, { category });
  }

  /**
   * 游戏列表-游戏供应商分类
   *
   * @param param
   * @returns
   */
  gameListByProvider(param: GameProviderParams): Observable<ResponseListData<GameListItem[]>> {
    const url = `${environment.apiUrl}/v1/game/gamelistbyprovider`;
    return this.post(url, param);
  }

  /**
   * 获取游戏类型下拉（交易记录）
   *
   * @returns ProviderCategoryInterface
   */
  getProviderCategory(): Observable<ResponseData<ProviderCategoryInterface[]>> {
    const url = `${environment.apiUrl}/v1/game/providercategory`;
    return this.get(url);
  }

  /**
   * 游戏列表-标签分类 , gameCount 显示游戏数量，预设24个，上限50个
   *
   * @param params GameListByLabelParams
   * @returns
   */
  getGameListByLabel(params: GameListByLabelParams): Observable<ResponseData<GameList>> {
    const url = `${environment.apiUrl}/v1/game/gamelistbylabel`;
    return this.post(url, params);
  }

  /**
   * 新的 为你推荐返回接口 根据标签返回 gameCount 显示游戏数量，预设24个，上限50个
   *
   * @param params GameListByLabelParams
   * @returns
   */
  getGameListByMultipleLabel(params: GameListByLabelParams): Observable<ResponseData<NewGameList>> {
    const url = `${environment.apiUrl}/v1/game/gamemultiplelabel`;
    return this.post(url, params);
  }

  /**
   * 游戏列表-类型分类 , gameCount 显示游戏数量，预设24个，上限50个
   *
   * @param params GameListByTypeParams
   * @returns
   */
  getGamelistbyGameType(params: GameListByTypeParams): Observable<ResponseData<GameList[]>> {
    const url = `${environment.apiUrl}/v1/game/gamelistbygametype`;
    return this.post(url, params);
  }

  /**
   * 获取游戏链接
   *
   * @param params 请求参数
   * @returns
   */
  getPlayGameUrl(params: PlayGameParams): Observable<ResponseData<PlayGameResponse>> {
    const url = `${environment.apiUrl}/v2/game/game/playgame`;
    return this.get<ResponseData<PlayGameResponse>>(url, {
      domain: window.location.origin,
      ...params,
    }).pipe(
      tap(res => {
        if (res?.data?.playGameUrl) this.dataCollectionService.gtmPush('play_game', { game_code: params.gameId });
        if (res?.code === '2096') this.appService.showForbidTip('play');
      }),
    );
  }

  /**
   * 获取游戏排序下拉选项GameSort
   *
   * @returns
   */
  getGameSortList(): Observable<ResponseData<GameSort[]>> {
    const url = `${environment.apiUrl}/v1/game/sortselect`;
    return this.getByCaches(url);
  }

  /**
   * 搜索游戏名称
   *
   * @param name
   * @returns
   */
  getGameByName(name: string): Observable<ResponseData<GameSearch>> {
    const url = `${environment.apiUrl}/v1/game/search`;
    return this.get(url, { name });
  }

  /**
   * 获得游戏详情
   *
   * @param gameId
   * @param providerCatId
   * @returns
   */
  getGameInfo(gameId: string, providerCatId: string): Observable<ResponseData<GameListItem>> {
    const url = `${environment.apiUrl}/v1/game/getgameinfo`;
    return this.get(url, { gameId, providerCatId });
  }

  /**
   * 获取游戏标签下拉
   *
   * @returns
   */
  getGamelabel(): Observable<ResponseData<Gamelabel[]>> {
    const url = `${environment.apiUrl}/v1/game/gamelabel`;
    return this.getByCaches(url);
  }

  /**
   * 根据标签获取厂商列表
   *
   * @param labelCodes
   * @param gameTypes
   * @returns
   */
  getProviderByLabel(labelCodes?: string[], gameTypes?: string[]): Observable<ResponseData<ProviderInterface[]>> {
    const url = `${environment.apiUrl}/v1/game/providerbylabel`;
    return this.post(url, { labelCodes, gameTypes });
  }

  /**
   * 根据标签获取厂商列表
   *
   * @param providerCatId
   * @returns
   */
  getLabelByProviderid(providerCatId: string): Observable<ResponseData<LabelCodeList[]>> {
    const url = `${environment.apiUrl}/v1/game/getlabelbyproviderid`;
    return this.get(url, { providerCatId });
  }

  /**
   * 小游戏收藏列表
   *
   * @param pageIndex
   * @param pageSize
   * @returns
   */
  getFavoritegame(pageIndex: number, pageSize: number): Observable<ResponseData<GameFavoriteList>> {
    const url = `${environment.apiUrl}/v2/game/game/favoritegame`;
    return this.get(url, { pageIndex, pageSize });
  }

  /**
   * 添加收藏游戏
   *
   * @param id
   * @returns
   */
  postAddFavoriteGame(id: string): Observable<ResponseData<{ favoriteCount: number }>> {
    const url = `${environment.apiUrl}/v1/game/addfavoritegame`;
    return this.post(url, { id });
  }

  /**
   * 移除收藏游戏
   *
   * @param id
   * @returns
   */
  postRemoveFavoriteGame(id: string): Observable<ResponseData<{ favoriteCount: number }>> {
    const url = `${environment.apiUrl}/v1/game/removefavoritegame`;
    return this.post(url, { id });
  }

  /**
   * 获取场景标签
   *
   * @returns
   */
  getLabelScenesList(): Observable<ResponseData<ScenesLabelList[]>> {
    const url = `${environment.apiUrl}/v1/game/getlabelsceneslist`;
    return this.get(url);
  }

  /**
   * 获取场景标签-顶部与左侧菜单
   *
   * @returns
   */
  getScenesMenu(): Observable<ResponseData<SceneData>> {
    const url = `${environment.apiUrl}/v2/game/game/getscenesmenu`;
    return this.getByCaches(url);
  }

  /**
   * 通过标签Id获取场景游戏
   *
   * @param ids
   * @returns
   */
  getGameListByIds(ids: number[]): Observable<ResponseData<ScenesGameResponse[]>> {
    const params = '?ids=' + ids.join('&ids=');
    const url = `${environment.apiUrl}/v2/game/game/getscenesgamelistbylabelids${params}`;
    return this.getByCaches<ResponseData<ScenesGameResponse[]>>(url).pipe(
      map(x => {
        if (x?.data) {
          x.data.forEach(item => {
            item.gameList = item.gameList.slice(0, 25);
          });
        }
        return x;
      }),
    );
  }

  /**
   * 最近玩过
   *
   * @param pageIndex
   * @param pageSize
   * @returns
   */
  getRecentLyPlayed(pageIndex: number, pageSize: number): Observable<ResponseListData<GameListItem[]>> {
    const url = `${environment.apiUrl}/v2/game/game/getrecentlyplayed`;
    return this.get(url, { pageIndex, pageSize });
  }

  /**
   * 获取OB熱門賽事
   *
   * @param lang
   * @param matchCount
   * @returns
   */
  getHotMatch(lang: string, matchCount: number): Observable<SportEvent[]> {
    const url = `${environment.apiUrl}/v1/game/gethotmatch`;
    // return this.get<ResponseData<SportEvent[]>>(url, { lang, matchCount }).pipe(
    //   map(v => v?.data || [])
    // );
    return this.get<ResponseData<SportEvent[]>>(url, { lang, matchCount }).pipe(map(v => v?.data || []));
  }

  /**
   * 获取场景标签和游戏列表
   *
   * @param scenesType 场景类型 Hall 大厅列表 Menu 菜单 HallBar 大厅横栏 FrontPage 首页
   * @param gameCount 游戏数量
   * @returns
   */
  getLabelAndGameListByScenes(
    scenesType: 'Hall' | 'Menu' | 'HallBar' | 'FrontPage',
    gameCount: number,
  ): Observable<ResponseData<ScenesInfo[]>> {
    const url = `${environment.apiUrl}/v1/game/getlabelandgamelistbyscenes`;
    return this.post(url, { gameCount, scenesType });
  }
}
