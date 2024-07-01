import { commonEnvironment } from './environment.common';
import { orignalEnvironmentPord } from './orignal/orignal-environment.prod';

const apiUrl = window.location.origin;

export const environment = {
  production: true,
  common: {
    tenant: '#{tenantId}#',
    ...commonEnvironment,
  },
  version: '#{version}#',
  /**是否为prod环境 */
  //@ts-ignore
  isOnline: '#{isOnline}#' == 'true',
  /**是否是sit环境 */
  //@ts-ignore
  isSit: '#{isSit}#' == 'true',
  /**是否是uat环境 */
  //@ts-ignore
  isUat: '#{isUat}#' == 'true',
  apiUrl: apiUrl,
  resourceUrl: '#{resourceUrl}#',
  signalrUrl: apiUrl + '/ws',
  chatSignalrUrl: apiUrl + '/im/ws',
  rsaPublicKey: '#{rsaPublicKey}#',
  /**原创相关 */
  orignal: orignalEnvironmentPord,
  cacheKey: '#{cacheKey}#',
  /**是否为App */
  isApp: false,
  translateUrl: '#{translateUrl}#',
  configUrls: '#{configUrls}#',
  sentryDsn: 'https://dff2ed5deeb9e10164ae35ec4a082539@sentry.athena25.com/2',
  /**是否为欧洲版 */
  //@ts-ignore
  isEur: '#{isEur}#' == 'true',
};
