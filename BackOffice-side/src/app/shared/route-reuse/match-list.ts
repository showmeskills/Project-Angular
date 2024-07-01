/**
 * 缓存匹配的路由数据都是对应 真实路由 数据，如要修改请对应 真实路由再进行修改
 * PS：后期进行统一缓存路由管理
 */

export const matchPathList = [
  /** 权限管理 */
  {
    curr: 'account', // 系统账号管理
    future: 'account/edit/:id', // 系统账号管理 - 编辑
  },
  {
    curr: 'role', // 角色管理
    future: 'role/edit/:id', // 角色管理 - 编辑
  },
  {
    curr: 'group', // 群组管理
    future: 'group/:id', // 群组管理 - 编辑
  },
  /** 系统管理 */
  {
    curr: 'merchants', // 商户管理
    future: 'merchants/edit/:id', // 商户管理 - 编辑
  },
  /** 内容管理 */
  {
    curr: 'announcement', // 资讯管理
    future: 'announcement/:id', // 资讯管理 - 编辑
  },
  {
    curr: 'messagestation-template', // 站内信管理 - 站内信模板
    future: 'messagestation-manage/messagestation-template/:id', // 站内信模板 - 编辑
  },
  /** 游戏管理 */
  {
    curr: 'provider', // 厂商管理
    future: 'provider/:id', // 厂商管理 - 编辑
  },
  {
    curr: 'list', // 游戏列表
    future: 'list/configuration/:id/:merchantId', // 游戏列表 - 编辑
  },
  {
    curr: 'manage', // 游戏列表（新）
    future: 'manage/:id', // 游戏列表（新） - 编辑（新）
  },
  /** 支付管理 */
  {
    curr: 'method', // 支付方式管理
    future: 'method/:id', // 支付方式管理 - 编辑
  },
  {
    curr: 'currency', // 币种配置
    future: 'currency/:merchantId/:currency', // 币种配置 - 币种配置详情
  },
  {
    curr: 'channelConfig', // 法币渠道配置
    future: 'channelConfig/:id', // 法币渠道配置 - 编辑
  },
  {
    curr: 'subChannel', // 法币子渠道配置
    future: 'subChannel/detail/:id', // 法币子渠道配置 - 详情
  },
  {
    curr: 'subChannel', // 法币子渠道配置
    future: 'subChannel/:id', // 法币子渠道配置 - 编辑
  },
  {
    curr: 'channelAllocationManagement', // 渠道分配管理
    future: 'channelAllocationManagement/log/:id', // 渠道分配管理 - 详情
  },
  {
    curr: 'companyAccountManagement', // 公司帐户管理
    future: 'companyAccountManagement/:id', // 公司帐户管理 - 编辑
  },
  /** 会员管理 */
  {
    curr: 'list', // 会员列表
    future: 'list/detail', // 会员列表 - 会员详情
  },
  /** 奖品管理*/
  {
    curr: 'prize-manage', // 奖品管理
    future: 'prize-manage/edit', // 奖品管理-查看
  },
  /** 奖品管理*/
  {
    curr: 'prize-manage', // 奖品管理
    future: 'prize-manage/query', // 奖品管理-领奖记录
  },
  /** 营销推广*/
  {
    curr: 'review', // 待审核列表
    future: 'review/:id', // 奖品管理-领奖记录
  },
  {
    curr: 'commission', // 佣金审核列表
    future: 'commission/:id', // 代理申请详情
  },
  {
    curr: 'commission', // 佣金审核列表
    future: 'commission/bill/:id', // 代理月结账单
  },
];
