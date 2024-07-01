export const environment = {
  production: true,
  version: '#{version}#',
  apiUrl: '#{apiurl}#',
  env: '#{env}#', // 环境变量

  //@ts-ignore
  isOnline: '#{isOnline}#' == 'true', //是否为前端线上环境
  sentryDSN: 'https://110a5ab64617492e89296b3bd25f8d47@sentry.athena25.com/21', //sentry地址

  localNavUser: [], // 使用本地导航栏数据的账号，左侧菜单不会进行动态匹配
};
