export interface MenuItem {
  title: string; // 名称，TODO: 后期需语言适配
  icon: string; // 图标，也用做id（慎改）
  page: string; // 跳转页
  showOnly?: 'h5' | 'web' | 'app'; // 仅显示在什么平台
  showOnTourist?: boolean; // 是否对游客展示
  showOnlyTourist?: boolean; // 仅对游客展示
  children?: MenuItem[]; // 子菜单
  class?: string; //额外样式
  onClick?: boolean; //被点击
  showOnlyCountry?: boolean; // 针对国家展示 true是不展示
}

export const UserCenterMenu: MenuItem[] = [
  {
    title: 'dashboard',
    icon: 'user',
    page: 'userCenter/overview',
  },
  {
    title: 'account_security',
    page: 'userCenter/security',
    icon: 'shield',
  },
  {
    title: 'member_grow',
    page: '/promotions/vip-level',
    icon: 'diamond',
  },
  {
    title: 'lat_acti',
    page: '/promotions/offer',
    icon: 'gift',
  },
  {
    title: 'settings',
    page: '/settings',
    icon: 'control',
  },
  {
    title: 'gam_moderate',
    page: '/responsible-gambling',
    icon: 'note',
    showOnlyCountry: true, //默认不展示
  },
];

export const userAssetsMenu: MenuItem[] = [
  {
    title: 'wallet_over',
    icon: 'wallet',
    page: '/wallet/overview',
  },
  {
    title: 'deposit',
    icon: 'chongzhi',
    page: '/deposit',
  },
  {
    title: 'withdraw',
    icon: 'tixian',
    page: '/withdrawal',
  },
  {
    title: 'trans',
    icon: 'duihuan',
    page: '',
  },
  {
    title: 'bc_manage',
    icon: 'bankcard',
    page: 'wallet/bankcard',
  },
  {
    title: 'dc_add_management',
    icon: 'shuzihuobi',
    page: '/wallet/address',
  },
  {
    title: 'trans_history',
    icon: 'history',
    page: '/wallet/history',
  },
];

export const orderMenu: MenuItem[] = [
  { icon: 'icon-tiyu', title: 's_order', page: 'transaction-record/deal/sport' },
  { icon: 'icon-caipiao', title: 'l_order', page: 'transaction-record/deal/lottery' },
  { icon: 'icon-yulecheng', title: 'ca_order', page: 'transaction-record/deal/casino' },
  { icon: 'icon-xxgame', title: 'che_order', page: 'transaction-record/deal/poker' },
];

export const walletMenu: MenuItem[] = [
  { icon: 'icon-wallet', title: 'wallet_over', page: 'wallet/overview' },
  { icon: 'icon-xianjin', title: 'spot_acc', page: 'wallet/main' },
];

export const TopMenu: MenuItem[][] = [
  [
    {
      title: 'dashboard',
      icon: 'user',
      page: 'userCenter/overview',
    },
    {
      title: 'wallet',
      page: '',
      icon: 'wallet',
      showOnly: 'h5',
      children: walletMenu,
    },
    {
      title: 'order',
      page: '',
      icon: 'shopping',
      showOnly: 'h5',
      children: orderMenu,
    },
    {
      title: 'account_security',
      page: 'userCenter/security',
      icon: 'shield',
    },
  ],
  [
    {
      title: 'earn_comm',
      page: 'referral',
      icon: 'users',
    },
    {
      title: 'member_grow',
      page: 'promotions/vip-level',
      icon: 'diamond',
    },
    {
      title: 'lat_acti',
      page: 'promotions/offer',
      icon: 'gift',
    },
    {
      title: 'bonus_center',
      page: 'coupon',
      icon: 'coupon',
    },
  ],
  [
    {
      title: 'gam_moderate',
      page: 'responsible-gambling',
      icon: 'note',
      showOnlyCountry: true, //默认不展示
    },
    {
      title: 'settings',
      page: 'settings',
      icon: 'control',
    },
  ],
  [
    {
      title: 'help_center',
      page: 'help-center',
      icon: 'bookmark',
    },
  ],
  [
    {
      title: 'online_cs',
      page: '',
      icon: 'kefu',
    },
  ],
  [
    {
      title: 'abount_us',
      page: 'update',
      icon: 'warning',
      showOnly: 'app',
    },
    {
      title: 'noti',
      page: 'notification-center',
      icon: 'bell',
      showOnly: 'h5',
    },
    {
      title: 'chat',
      page: '',
      icon: 'chat',
      showOnly: 'h5',
    },
    {
      class: 'has-border-top-in-web',
      title: 'logout',
      page: '',
      icon: 'exit',
    },
  ],
];
