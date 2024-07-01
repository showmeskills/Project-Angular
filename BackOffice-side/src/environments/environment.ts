// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  version: '1.0.0',
  isOnline: false, //是否为前端线上环境
  sentryDSN: 'https://9db60c84ff11df96ef13bd658da76d3e@sentry.athena25.com/9', //sentry地址

  /** SIT */
  apiUrl: 'http://20.198.251.181/api/v1',
  /** UAT */
  // apiUrl: 'http://gbd-uat-alb-1644329973.ap-northeast-1.elb.amazonaws.com:5012/api/v1',

  wsHeartbeatTime: 5_000, // 心跳时间
  localNavUser: ['ff', 'pp', 'Test001'], // 显示所有导航的测试账号，导航不会匹配接口
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
