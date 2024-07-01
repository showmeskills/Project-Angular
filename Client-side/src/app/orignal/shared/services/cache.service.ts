import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const VOICE = 'voice';
const HOTKEY = 'hotkey';
const FAST_BET = 'fastBet';
const ANIMATION = 'animation';
const AUTOTIPSSHOW = 'autoTipsShow';
const LOOPINFO = 'loopInfos';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {}

  private prefix: string = 'orignal.cache.';

  //自动投注内容
  get loopInfos(): any {
    return JSON.parse(this.getValue(LOOPINFO) as any);
  }
  set loopInfos(value: any) {
    this.setValue(LOOPINFO, JSON.stringify(value));
  }

  //是否打开动画 默认开启
  get autoTipsShow(): boolean {
    return this.getValue(AUTOTIPSSHOW) === 'true' ? true : false;
  }

  set autoTipsShow(value: boolean) {
    this.removeCache(AUTOTIPSSHOW);
    this.setValue(AUTOTIPSSHOW, value ? 'false' : 'true');
  }

  //是否打开动画 默认开启
  get animation(): boolean {
    return this.getValue(ANIMATION) === 'true' ? false : true;
  }

  set animation(value: boolean) {
    this.removeCache(ANIMATION);
    this.setValue(ANIMATION, value ? 'false' : 'true');
  }

  //是否打开音量 默认开启
  get voice(): boolean {
    return this.getValue(VOICE) === 'true' ? false : true;
  }

  set voice(value: boolean) {
    this.removeCache(VOICE);
    this.setValue(VOICE, value ? 'false' : 'true');
  }

  //是否打开快速投注 默认关闭
  get fastBet(): boolean {
    return this.getValue(FAST_BET) === 'true' ? true : false;
  }

  set fastBet(value: boolean) {
    this.removeCache(FAST_BET);
    this.setValue(FAST_BET, value.toString());
  }

  //是否打开热键 默认关闭
  get hotkey(): boolean {
    return this.getValue(HOTKEY) === 'true' ? true : false;
  }

  set hotkey(value: boolean) {
    this.removeCache(HOTKEY);
    this.setValue(HOTKEY, value ? 'true' : 'false');
  }

  //清理上一个版本的缓存
  private removeCache(key: string): void {
    const oldKey = this.prefix + (Number(environment.orignal.cacheKey) - 1) + key;
    localStorage.removeItem(oldKey);
  }

  private getValue(key: string): string | null {
    return window.localStorage.getItem(this.prefix + environment.orignal.cacheKey + key);
  }

  private setValue(key: string, value: string | null) {
    localStorage.setItem(this.prefix + environment.orignal.cacheKey + key, value || '');
  }
}
