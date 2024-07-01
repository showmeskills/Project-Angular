import { BaseInterface, ThemeType } from 'src/app/shared/interfaces/base.interface';

export interface StatusService<T = string> extends BaseInterface {
  name?: string;
  value?: T;
  type?: ThemeType;
  lang?: string[];
  langArgs?: {};
}

export interface TypeLangService<T = string> extends BaseInterface {
  name?: string;
  value?: T;
  type?: ThemeType;
  lang?: string;
  langArgs?: {};
}
