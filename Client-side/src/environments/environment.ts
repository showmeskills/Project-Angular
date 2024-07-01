import { commonEnvironment } from './environment.common';
import { orignalEnvironment } from './orignal/orignal-environment';

// sit分支本地调试使用这个，注释另一个
const apiUrl = 'https://sit-newplatform.mxsyl.com';
const tenant = '1';
// uat分支本地调试使用这个，注释另一个
// const apiUrl = 'https://uat-newplatform.mxsyl.com';
// const tenant = '1';

export const environment = {
  production: false,
  common: {
    tenant: tenant,
    ...commonEnvironment,
  },
  version: '1.0.0',
  /**是否为prod环境 */
  isOnline: false,
  /**是否是sit环境 */
  isSit: false,
  /**是否是uat环境 */
  isUat: false,
  apiUrl: apiUrl,
  signalrUrl: apiUrl + '/ws',
  chatSignalrUrl: apiUrl + '/im/ws',
  rsaPublicKey:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1lcU5lRpSOqdLicIimSso8wSCTDWdtv3BXGeixALS+bcqOMmV2Tm5F5O3sOAku/a+XxeC+yXkaVrCXpgsl0LEPGVnqO5XoVs4LTeo0zwCJQ+H7TN1ZlqkpfFCL7Mn1+dUXvy+N2p5ijlTZiFsfetc+Jr/JH2Zj62nnc/Vpxne0RsKLwh4Mwp6i/BSv2H9xurablJpz3GPb0qoTniCuxzXvCR9h2tFfbCNacrdpOFVW/A8g27g5em+uqjVB5xAhM1pj0b5PlgR6Oyn5c5mmK1waBx/P+NZJRmGrDbHZMq07v3ma9LTOCGGoG90ReYHxVFRSlAzfl5NGF9nrkfZW4skQIDAQAB',
  resourceUrl: 'https://d16j89jl5zb4v5.cloudfront.net',
  cacheKey: '3',
  /**原创相关 */
  orignal: orignalEnvironment,
  /**是否为App */
  isApp: false,
  translateUrl: `${apiUrl}/configs3/LanguageTranslate/Web/[lang].json,${apiUrl}/configs2/LanguageTranslate/Web/[lang].json,${apiUrl}/configs/LanguageTranslate/Web/[lang].json`,
  configUrls: `${apiUrl}/configs3/web-[tenant].json,${apiUrl}/configs2/web-[tenant].json,${apiUrl}/configs/web-[tenant].json`,
  sentryDsn: 'https://dff2ed5deeb9e10164ae35ec4a082539@sentry.athena25.com/2',
  /**是否为欧洲版 */
  isEur: false,
};

// uat使用sit的翻译，调试需要解除此注释
// environment.translateUrl = `https://sit-newplatform.mxsyl.com/configs3/LanguageTranslate/Web/[lang].json,https://sit-newplatform.mxsyl.com/configs2/LanguageTranslate/Web/[lang].json,https://sit-newplatform.mxsyl.com/configs/LanguageTranslate/Web/[lang].json`;

// 解除注释临时使用prod的部分接口进行调试，请勿滥用！
// environment.apiUrl = 'https://api.gogamingapi1.com';
// environment.signalrUrl = 'https://ws.gogamingapi1.com';
// environment.rsaPublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoTgcVORkxBPRQJimRKTUHrSS+vTBzbAm8l6bwaFqr1Mya/pjsHrUPCErJnchMfmfgEBFrsfX5/FLGfXvKFT//F949jgcl3My2oGCOk4dTh+zpp16q8e0qoOG5JtKmQjs2W+s2sAp2Xsk4hMfRY9ZzxsSORjS6YYvgLb0TwbLXZ1GAHhwJSVJS38AUqJH2Z0ng7xzDAklEqLfcP+99PBVau0iqRBEypUsJqcTPXTJMQw0wZg3Frci0SuOhTexmG7NzVhHZIV0cp07czo8lp8+2YvC14iaPwn2xB4dVXNtIILQFXorfNS9U+IO5uL0Y432GeWax1tVXrl6jowihrd1nwIDAQAB';
