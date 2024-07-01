///左侧菜单
import { CodeName } from 'src/app/shared/interfaces/base.interface';

export interface MenuItem {
  name?: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];

  [key: string]: any;
}

/** 接口返回的导航菜单 */
export interface Menu {
  code: string;
  hidden: boolean;
  name: string;
  parentID: number;
  permissions: CodeName[];
  state: string; //'Enabled',
  subMenus: Menu[];
}
