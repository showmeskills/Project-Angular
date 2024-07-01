export const environment = {
  production: true,
  apiUrl: '#{apiurl}#',
  version: '#{version}#',
  //@ts-ignore
  isOnline: '#{isOnline}#' == 'true', //是否为前端线上环境
  sentryDSN: 'https://9db60c84ff11df96ef13bd658da76d3e@sentry.athena25.com/9', //sentry地址

  wsHeartbeatTime: 5_000, // 心跳时间
  localNavUser: ['pp'], // 使用本地导航栏数据的账号，左侧菜单不会进行动态匹配
};
