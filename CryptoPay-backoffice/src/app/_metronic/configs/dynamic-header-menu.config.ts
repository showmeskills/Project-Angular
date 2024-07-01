export const DynamicHeaderMenuConfig = {
  items: [
    {
      title: '仪表盘',
      root: true,
      icon: 'flaticon2-architecture-and-city',
      svg: './assets/media/svg/icons/Design/Layers.svg',
      page: '/dashboard',
      translate: 'MENU.DASHBOARD',
      bullet: 'dot',
    },
    // {
    //   title: '用户管理',
    //   root: true,
    //   bullet: 'dot',
    //   page: '/user',
    //   icon: 'flaticon2-browser-2',
    //   svg: './assets/media/svg/icons/Design/Cap-2.svg',
    //   submenu: [
    //     {
    //       title: '用户列表',
    //       bullet: 'dot',
    //       page: '/user/list',
    //     },
    //   ],
    // },
    {
      title: '示例页面',
      root: true,
      bullet: 'dot',
      page: '/example',
      icon: 'flaticon2-browser-2',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          title: '列表页',
          bullet: 'dot',
          page: '/example/list',
        },
        {
          title: '表单页',
          bullet: 'dot',
          page: '/example/form',
        },
      ],
    },
  ],
};
