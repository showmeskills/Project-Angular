export type GameRule = {
  providerId: string;
  gameId?: string;
  rule?: {
    h5: string;
    web: string;
    app: string;
  };
  iosRule?: {
    h5: string;
    web: string;
    app: string;
  };
  androidRule?: {
    h5: string;
    web: string;
    app: string;
  };
}[];

export const PROVIDER_CATEGORY_TYPE = {
  SportsBook: 1,
  Esports: 2,
  Lottery: 3,
  LiveCasino: 4,
  SlotGame: 5,
  Chess: 6,
};

export const GAME_ID_MAP: { [key: string]: string } = {
  /**IM 电竞 */
  'IMESport-2': 'ESPORTSBULL',
  /**RG 不传id */
  '40016-2': '',
  /**OB彩票 不传id */
  'OBLottery-3': '',
};

export const GAME_RULE: GameRule = [
  {
    providerId: 'SaBaSport-1', // 沙巴体育
    rule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'PinnacleSport-1', // 平博体育
    iosRule: {
      h5: 'window',
      web: 'window',
      app: 'system',
    },
  },
  {
    providerId: 'PinnacleSport-1', // 平博电竞
    gameId: 'e-sports',
    iosRule: {
      h5: 'window',
      web: 'window',
      app: 'system',
    },
  },
  {
    providerId: 'AGSlot-4', // Ag
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'AGSlot-5', // Ag
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'AGSlot-6', // Ag
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'IMSport-1', // IM体育
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'VRLottery-3', // VR彩票
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'SGLottery-3', // 双赢彩票
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
  {
    providerId: 'GPIGame-3', // GPI彩票
    iosRule: {
      h5: 'window',
      web: 'iframe',
      app: 'system',
    },
  },
];
