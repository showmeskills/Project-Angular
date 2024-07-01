const apiUrl = window.location.origin;

export const orignalEnvironmentPord = {
  version: '#{orignalVersion}#',
  apiUrl: apiUrl + '/neworiginal/api',
  cacheKey: '#{orignalCacheKey}#',
  originalRsaPublicKey: '#{originalRsaPublicKey}#',
  newRandomUrl: apiUrl + '/neworiginal/api',
  orignalNewWsUrl: apiUrl.replace('https', 'wss') + '/neworiginal/api',
};
