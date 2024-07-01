/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsdoc/require-returns */
import { Injectable, signal } from '@angular/core';
import { AccountInforData } from '../interfaces/account.interface';

const TOKEN_KEY = 'token';
export const LOCAL_USER_INFO = 'TE9DQUxfVVNFUl9';
const VISITORID = 'visitorId';
export const LOGIN_TOKEN_KEY = 'loginToken';
const THEME_KEY = 'theme';
// const BET_MODE_KEY = "betMode";
// const ODDS_TYPE_KEY = "oddsType";
const INVITE_CODE = 'inviteCode';
const LANGUAGE_CODE = 'languageCode';
const CURRENT_CURRENCY = 'currentCurrency';
const STATISTICS_PANEL_POSITION = 'statisticsPanelPosition';
const TOPUP_TIPS_KEY = 'topupTipsKey';
const CURRENCY_DISPLAY = 'currencyDisplay';
const NOWURL = 'url';
const APP_DOWNLOAD_TIPS = 'appDownloadTips';
const GUIDE_SHOWED = 'guideShowed';
const CS_TOURISTS_CONTACT = 'csTouristsContact';
const SHOWAUTHTIP = 'showAuthTip';
const WHEELMUSIC = 'wheelMusic';
const WHEELSHOWN = 'wheelShown';
// const EARLYRECHARGE = 'earlyRechargeShowed';
const MY_AFFILIATE = 'myAffiliate';
export const IP_KEY = 'x54652w';
const GLOBAL_WAITING_ICON = 'globalWaitingIcon';
const SHOWRISKBANNER = 'riskBanner';
const RISKFORM = 'riskForm';
const SHOWKYCVALIDATIONBANNER = 'kycValidationBanner';
const EDD_POPUP = 'eddPopup';
const DOMAIN_LIST = 'RE9NQUlOX0xJU1Q';
const DEFAULT_LANG = 'defaultLang';
const VISITORID_PRO = 'U2FsdGVkX1';

/** 前缀 */
export const LocalKeyPrefix = 'storage.platform.';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  /** 基础token */
  get token(): string | null {
    return this.getValue(TOKEN_KEY);
  }
  set token(value: string | null) {
    this.setValue(TOKEN_KEY, value);
  }

  /**用户信息 */
  get localUserInfo(): AccountInforData | null {
    return JSON.parse(this.getValue(LOCAL_USER_INFO) as any);
  }
  set localUserInfo(value: any) {
    this.setValue(LOCAL_USER_INFO, JSON.stringify(value));
  }

  /** 当前的url */
  get nowUrl(): string {
    return this.getValue(NOWURL) ?? '';
  }
  set nowUrl(value: string) {
    this.setValue(NOWURL, value);
  }

  /** 可用域名列表 */
  get domainList(): any {
    let v: any = window.atob(this.getValue(DOMAIN_LIST) ?? '') || null;
    if (v) v = v.split(',');
    return v;
  }
  set domainList(value: string) {
    this.setValue(DOMAIN_LIST, window.btoa(value));
  }

  /** 浏览器唯一码 */
  get visitorId(): string | null {
    return this.getValue(VISITORID);
  }
  set visitorId(value: string | null) {
    this.setValue(VISITORID, value);
  }

  /** 浏览器唯一码(收费) */
  get visitorIdPro(): string | null {
    return this.getValue(VISITORID_PRO);
  }
  set visitorIdPro(value: string | null) {
    this.setValue(VISITORID_PRO, value);
  }

  /** 登录注册成功后的token */
  get loginToken(): string | null {
    return this.getValue(LOGIN_TOKEN_KEY);
  }
  set loginToken(value: string | null) {
    this.setValue(LOGIN_TOKEN_KEY, value);
  }

  /** 主题 */
  get theme(): 'sun' | 'moon' {
    return this.getValue(THEME_KEY) as 'sun' | 'moon';
  }
  set theme(value: string) {
    this.setValue(THEME_KEY, value);
  }

  /** 投注模式 */
  // get betMode(): 'asia' | 'euro' { return (this.getValue(BET_MODE_KEY) ?? 'euro') as 'asia' | 'euro' }
  // set betMode(value: string) { this.setValue(BET_MODE_KEY, value) }

  /** 盘口类型 */
  // get oddsType(): string { return (this.getValue(ODDS_TYPE_KEY) ?? '00002') }
  // set oddsType(value: string) { this.setValue(ODDS_TYPE_KEY, value) }

  /** 邀请码 */
  inviteCodeSignal = signal(this.inviteCode);
  get inviteCode(): string | null {
    return this.getValue(INVITE_CODE);
  }
  set inviteCode(value: string | null) {
    this.inviteCodeSignal.set(value);
    this.setValue(INVITE_CODE, value);
  }

  /** 语言 */
  get languageCode(): string {
    return this.getValue(LANGUAGE_CODE) ?? '';
  }
  set languageCode(value: string) {
    this.setValue(LANGUAGE_CODE, value);
  }

  /** 当前币种 */
  get currentCurrency(): string {
    return this.getValue(CURRENT_CURRENCY) ?? '';
  }
  set currentCurrency(value: string) {
    this.setValue(CURRENT_CURRENCY, value);
  }

  /** 顶部币种管理显示哪些币种 */
  get currencyDisplay(): any {
    return JSON.parse(this.getValue(CURRENCY_DISPLAY) as any);
  }
  set currencyDisplay(value: any) {
    this.setValue(CURRENCY_DISPLAY, JSON.stringify(value));
  }

  /** 统计面板位置记忆 */
  get statisticsPanelPosition(): any {
    return JSON.parse(this.getValue(STATISTICS_PANEL_POSITION) as any);
  }
  set statisticsPanelPosition(value: any) {
    this.setValue(STATISTICS_PANEL_POSITION, JSON.stringify(value));
  }

  /** 充值提示弹窗 */
  get topupTips(): any {
    return JSON.parse(this.getValue(TOPUP_TIPS_KEY) as any);
  }
  set topupTips(value: any) {
    this.setValue(TOPUP_TIPS_KEY, JSON.stringify(value));
  }

  /** app下载提示（h5时候） */
  get appDownloadTips(): any {
    return this.getValue(APP_DOWNLOAD_TIPS);
  }
  set appDownloadTips(value: any) {
    this.setValue(APP_DOWNLOAD_TIPS, value);
  }

  /** 新手指引 */
  get guideShowed(): any {
    return this.getValue(GUIDE_SHOWED);
  }
  set guideShowed(value: any) {
    this.setValue(GUIDE_SHOWED, value);
  }

  /** 客服游客提示 */
  get csTouristsContact(): string {
    return this.getValue(CS_TOURISTS_CONTACT) || '';
  }
  set csTouristsContact(value: string) {
    this.setValue(CS_TOURISTS_CONTACT, value);
  }

  //显示auth popup
  get showAuthTip(): any {
    return this.getValue(SHOWAUTHTIP) as any;
  }
  set showAuthTip(value: any) {
    this.setValue(SHOWAUTHTIP, JSON.stringify(value));
  }

  //大转盘音效
  get wheelMusic(): any {
    return this.getValue(WHEELMUSIC) as any;
  }
  set wheelMusic(value: any) {
    this.setValue(WHEELMUSIC, value);
  }
  get wheelShown(): any {
    return this.getValue(WHEELSHOWN) as any;
  }
  set wheelShown(value: any) {
    this.setValue(WHEELSHOWN, value);
  }

  /** aff参数 */
  myAffiliateSignal = signal(this.myAffiliate);
  get myAffiliate(): string | null {
    const value = this.getValue(MY_AFFILIATE);
    return value?.substring(0, 32) ?? null;
  }
  set myAffiliate(value: string | null) {
    this.myAffiliateSignal.set(value?.substring(0, 32) ?? null);
    this.setValue(MY_AFFILIATE, value);
  }

  /** 风控横幅显示 */
  get riskBanner(): any {
    return this.getValue(SHOWRISKBANNER);
  }
  set riskBanner(value: any) {
    this.setValue(SHOWRISKBANNER, value);
  }

  /** 风控表单 */
  get riskForm(): any {
    return this.getValue(RISKFORM);
  }
  set riskForm(value: any) {
    this.setValue(RISKFORM, value);
  }

  //世界杯抢先充值
  // get earlyReChargeShowed(): any { return JSON.parse(this.getValue(EARLYRECHARGE) as any) }
  // set earlyReChargeShowed(value: any) { this.setValue(EARLYRECHARGE, JSON.stringify(value)) }

  //IP地址
  get clientIp(): string | null {
    return this.getValue(IP_KEY);
  }
  set clientIp(value: string | null) {
    this.setValue(IP_KEY, value);
  }

  // Edd 弹窗是否弹起
  get eddPopup(): string | null {
    return this.getValue(EDD_POPUP);
  }

  set eddPopup(value: string | null) {
    this.setValue(EDD_POPUP, value);
  }

  // 默认语言
  get defaultLang(): string | null {
    return this.getValue(DEFAULT_LANG);
  }

  set defaultLang(value: string | null) {
    this.setValue(DEFAULT_LANG, value);
  }

  //初始进入的加载图片地址
  get globalWaitingIcon(): string | null {
    return this.getValue(GLOBAL_WAITING_ICON);
  }
  set globalWaitingIcon(value: string | null) {
    this.setValue(GLOBAL_WAITING_ICON, value);
  }

  /**
   * 获取完整的key
   *
   * @param key Gogaming localstorage key
   */
  getStorageFullKey(key: string) {
    return LocalKeyPrefix + key;
  }

  private getValue(key: string): string | null {
    return window.localStorage.getItem(LocalKeyPrefix + key);
  }

  private setValue(key: string, value: string | null) {
    localStorage.setItem(LocalKeyPrefix + key, value || '');
  }

  /**
   * ..临时使用
   *
   * @param key
   * @param _default
   * @returns //
   */
  public getValueByJsonParse(key: string, _default: any = ''): any {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : _default;
  }

  public setValueByJsonStringify(key: string, value: any) {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  /** kyc安全验证提示横幅 */
  get kycValidationBanner(): any {
    return this.getValue(SHOWKYCVALIDATIONBANNER);
  }
  set kycValidationBanner(value: any) {
    this.setValue(SHOWKYCVALIDATIONBANNER, value);
  }
}
