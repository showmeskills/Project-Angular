// sit分支本地调试使用这个，注释另一个
const apiUrl = 'https://sit-newplatform.mxsyl.com';
// uat分支本地调试使用这个，注释另一个
// const apiUrl = 'https://uat-newplatform.mxsyl.com;

export const orignalEnvironment = {
  version: '1.0.0',
  apiUrl: apiUrl + '/neworiginal/api',
  newRandomUrl: apiUrl + '/neworiginal/api',
  orignalNewWsUrl: apiUrl.replace('https', 'wss') + '/neworiginal/api',
  cacheKey: '1',
  originalRsaPublicKey:
    '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt0+SX4tNLAb+fqU+EQeSD9ss5IJM3WJ2wGbcjP8ONl8yNTYTmFNtD0vh1ovFjbM+vb73MCbBYzvk6dBwnudGF2xudhy17emonq2V2X5P3Um1SEQzRWIUjSrb0D9R0SgM2lgcDs9h3SZJWv/a3v2NaUN8mkqPDvV0/GAnPSTNAnAx3GRlViFcdyk4KA5uWC4wq2YkxG6wEHQFbJjlVc2NSvAgO+gCV2tEEApLcdZyilG3iD+jiOL3f/awktpJDIO+qvV1TYh67erfq8KvVRV2Y9ZZmwFpFc3LJl2AYAYfIxHxUSS4ta/+I6+ZUoSmH7IKGZJj4UQI1KOwBhZHn7Tm3QIDAQAB-----END PUBLIC KEY-----',
};
