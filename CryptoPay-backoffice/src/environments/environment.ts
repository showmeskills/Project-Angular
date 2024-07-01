// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true, // 是否开启调试模式 目前用于控制台打印请求
  version: '1.0.0',
  isOnline: false, // 是否为前端线上环境
  sentryDSN: 'https://110a5ab64617492e89296b3bd25f8d47@sentry.athena25.com/21', //sentry地址
  env: 'local', // 环境变量

  /** SIT */
  apiUrl: 'http://20.198.224.251:8001/api/v1',
  /** UAT */

  localNavUser: ['Super001', 'pp'], // 显示所有导航的测试账号，导航不会匹配接口
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
