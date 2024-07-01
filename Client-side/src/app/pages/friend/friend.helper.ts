import { environment } from 'src/environments/environment';

/**@appOrWebDomain 生成web或者app的域名*/
export const appOrWebDomain = (): string => {
  let domain: string;
  if (environment.isApp) {
    if (environment.isOnline) {
      domain = environment.apiUrl;
    } else {
      domain = '';
    }
  } else {
    domain = window.location.origin;
  }
  return domain;
};
