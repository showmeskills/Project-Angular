import { environment } from 'src/environments/environment';

/**
 * code 为匹配后台接口的字段 -> 有code会进行加权限的一个判断没有code则无限制
 * submenu 为第1级子菜单
 * thirdmenu 为第2级子菜单
 */
export const DynamicAsideMenuConfig = {
  items: [
    {
      title: '仪表盘',
      root: true,
      svg: './assets/images/svg/admin-menu.svg',
      page: '/dashboard/analysis',
      translate: 'MENU.DASHBOARD',
      bullet: 'dot',
      permission: 'dashboard.analysis',
      // code: '1',
      key: 'nav.dashBoard',
    },
    {
      title: '财务管理',
      root: true,
      bullet: 'dot',
      page: '/platform',
      permission: 'Platform.CoinOpen.View',
      code: '2',
      key: 'nav.FinancialManagement',
      submenu: [
        {
          title: '付款申请',
          page: '/proxy/budget-apply',
          code: '201',
          key: 'nav.paymentRequest',
        },
        {
          title: '付款审批',
          page: '/proxy/budget-approval',
          code: '202',
          key: 'nav.paymentApproval',
        },
        {
          title: '存提款列表',
          page: '/money/transactionList',
          code: '203',
          key: 'nav.depositWithdrawalList',
        }
      ],
    },
    {
      title: '支付管理',
      root: true,
      bullet: 'dot',
      page: '/channel',
      permission: 'Money.CoinOpen.View',
      code: '3',
      key: 'nav.paymentManagement',
      submenu: [
        {
          title: '币种配置',
          // bullet: 'dot',
          page: '/pay/currency',
          permission: 'Platform.CoinOpen.View',
          code: '204',
          key: 'nav.currencyConfiguration',
        },
        {
          title: '支付方式配置',
          // bullet: 'dot',
          page: '/system/paymentMethodManagement',
          permission: 'Platform.CoinOpen.View',
          code: '205',
          key: 'nav.paymentMethodConfiguration',
        },
        {
          title: '法币渠道配置',
          bullet: 'dot',
          page: '/money/channelConfig',
          permission: 'Money.CoinOpen.View',
          code: '206',
          key: 'nav.fiatCurrencyChannelConfig',
        },
        {
          title: '法币子渠道配置',
          bullet: 'dot',
          page: '/money/subChannel',
          permission: 'Money.CoinOpen.View',
          code: '207',
          key: 'nav.fiatCurrencyConfiguration',
        },
        {
          title: '渠道分配管理',
          bullet: 'dot',
          page: '/money/channelAllocationManagement',
          permission: 'Money.CoinOpen.View',
          code: '208',
          key: 'nav.channeAllocationManagement',
        },
        {
          title: '公司帐户管理',
          bullet: 'dot',
          page: '/money/companyAccountManagement',
          permission: 'Money.CoinOpen.View',
          code: '209',
          key: 'nav.companyAccountManagement',
        },
        {
          title: '汇率管理',
          page: '/system/exchange',
          code: '210',
          key: 'nav.exchangeRateManagement',
        },
        {
          title: '银行列表配置',
          // bullet: 'dot',
          page: '/money/bank',
          permission: 'Platform.CoinOpen.View',
          code: '211',
          key: 'nav.bankListConfiguration',
        },
        {
          title: '银行映射配置',
          // bullet: 'dot',
          page: '/money/bank-map',
          permission: 'Platform.CoinOpen.View',
          code: '212',
          key: 'nav.bankMappingConfiguration',
        },
        {
          title: '商户资产',
          // bullet: 'dot',
          page: '/money/merchant-money',
          permission: 'Platform.CoinOpen.View',
          code: '213',
          key: 'nav.merchantMoney',
        },
        {
          title: '兑换记录',
          // bullet: 'dot',
          page: '/pay/exchange-record',
          permission: 'Platform.CoinOpen.View',
          code: '226',
          key: 'nav.exchangeRecord',
        },
        {
          title: 'PSP分配设置',
          // bullet: 'dot',
          page: '/pay/psp-routing',
          permission: 'Platform.CoinOpen.View',
          code: '228',
          key: 'nav.pspRouting',
        },
      ],
    },
    {
      title: '钱包管理',
      root: true,
      bullet: 'dot',
      page: '/wallet',
      permission: 'Platform.CoinOpen.View',
      code: '7',
      key: 'nav.walletManagement',
      submenu: [
        {
          title: '冷钱包',
          page: '/wallet/cold',
          code: '221',
          key: 'nav.coldWallet',
        },
        {
          title: '热钱包',
          page: '/wallet/hot',
          code: '223',
          key: 'nav.hotWallet',
        },
        {
          title: '用户钱包',
          page: '/wallet/encrypt',
          code: '222',
          key: 'nav.balanceStatistics',
        },
        {
          title: '兑换列表',
          page: '/wallet/conversion',
          code: '225',
          key: 'nav.flushSwap',
        },
      ],
    },
    {
      title: '风控管理',
      root: true,
      bullet: 'dot',
      page: '/risk',
      permission: 'Platform.CoinOpen.View',
      key: 'nav.riskManage',
      code: '4',
      submenu: [
        {
          title: '审核列表',
          page: '/risk/review',
          code: '214',
          key: 'nav.reviewList',
        },
      ],
    },
    {
      title: '权限管理',
      root: true,
      bullet: 'dot',
      page: '/authority',
      permission: 'Platform.CoinOpen.View',
      code: '5',
      key: 'nav.authorityManagement',
      submenu: [
        {
          title: '系统账号管理',
          page: '/authority/account-manage',
          code: '215',
          key: 'nav.systemAccountManagement',
        },
        {
          title: '角色管理',
          page: '/authority/role',
          code: '216',
          key: 'nav.roleManagement',
        },
        {
          title: '群组管理',
          page: '/authority/group',
          code: '217',
          key: 'nav.groupManagement',
        },
      ],
    },
    {
      title: '系统管理',
      root: true,
      bullet: 'dot',
      page: '/system',
      permission: 'Platform.CoinOpen.View',
      code: '6',
      key: 'nav.systemManagement',
      submenu: [
        {
          title: '商户管理',
          page: '/system/merchants',
          code: '219',
          key: 'nav.merchantManagement',
        },
        {
          title: '商户IP白名单',
          page: '/system/mw-ip',
          code: '227',
          key: 'nav.merchantWhiteIP',
        },
        {
          title: '操作日志',
          page: '/system/log',
          code: '220',
          key: 'nav.operationlog',
        },
      ],
    },
  ],
};
