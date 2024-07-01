/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Number {
    toDecimal(n?: number): string;
    /**
     * 加法
     */
    add(n: any): number;
    /**
     * 减法
     */
    minus(n: any): number;
    /**
     * 乘法
     */
    subtract(n: any): number;
    /**
     * 除法
     */
    divide(n: any): number;
    /**
     * 组合C(n,m)
     *
     * @param n
     * @param m
     * n个号码 m为一组  得出可组合多少个号码
     */
    combination(n: number, m: number): number;
    /**
     * 组合C(n,m)
     *
     * @param n
     * @param m
     * n个号码 m为一组  返回组合的所有数组
     */
    combinationBack(n: any[], m: number): any[];

    /**
     * 整数保留整数，小数最多保留2位数
     *
     * @param n
     */
    toDecimal2NoZero(n: number): number;
  }
  interface Window {
    /**Google埋点 */
    dataLayer?: { push: (data: { event: string; [key: string]: any }) => void };
    /**版本号 */
    version: string;
    /**设置hotjar用户信息 */
    setHotjarUser: () => void;
    /**重建angular应用 */
    reBuild: () => any;
    /**重建后需要执行的事务列表 */
    eventBank: any[];
    /**当前语言 */
    languageCode: string;
    /**是否支持webp图片格式 */
    isSupportWebp: boolean;
    /**用于生成iovationBlackbox的对象 */
    IGLOO: { getBlackbox: () => any; loader: { version: string; subkey: string } };
    /**zendDesk 对象 */
    zE: any;
    /**检查语言情况，判断是否跳转 */
    checkLangSupport: (code: string, list: string[]) => void;
  }
}
export {};
