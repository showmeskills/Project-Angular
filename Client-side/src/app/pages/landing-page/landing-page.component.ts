import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  constructor(public appService: AppService, public router: Router) {}

  casinoImg: string = '';
  sportImg: string = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  local: any = {};

  localZHCN = {
    bannerTitle: '更明智地下注',
    registerNow: '立即注册',
    casino: {
      title: '娱乐城',
      subTitle: '发挥您的运气：进入加密货币赌场革命',
      desc: '欢迎来到我们尖端的加密货币赌场，这里等待着您刺激的娱乐和丰厚的赢利！在这里，您将体验到终极在线真人赌场的无与伦比的兴奋。与真实的荷官实时互动，玩转轮盘、二十一点、扑克和百家乐等游戏，享受快速、安全和匿名的交易。现在加入我们，抓住赌博的未来，获得惊人的胜利和无尽的兴奋！',
      btn: '前往娱乐城',
    },
    sport: {
      title: '体育',
      subTitle: '最佳加密货币投注平台：免费直播体育赛事，顶级返现和独家 VIP 计划等您来！',
      desc: '欢迎来到终极在线加密货币体育博彩平台！以前所未有的方式体验现场体育比赛的刺激，免费直播您最喜爱的比赛。现在加入我们，我们提供无与伦比的返现优惠和独家 VIP 计划。让您感受全新的界面与操作享受极佳体育博彩体验。',
      btn: '前往体育博彩',
    },
    more: '了解更多',
    cypto: {
      title: '没有加密货币？没问题。',
      btn: '购买加密货币',
    },
  };

  localENUS = {
    bannerTitle: 'Play Better',
    registerNow: 'Register Now',
    casino: {
      title: 'Casino',
      subTitle: 'Unleash Your Luck: Enter the Cryptocurrency Casino Revolution',
      desc: 'Welcome to our cutting-edge crypto casino, where thrilling entertainment and massive wins await! Engage with real dealers in real-time, play thrilling games like roulette, blackjack, poker, and baccarat, and enjoy fast, secure, and anonymous transactions. Join us now and seize the future of gambling for incredible wins and endless excitement!',
      btn: 'Visit Casino',
    },
    sport: {
      title: 'Sports',
      subTitle: 'Elevate Your Betting: Free Live Sports Streaming, TOP Cashback, and Exclusive VIP Program Await!',
      desc: 'Welcome to the ultimate online crypto sports betting destination! Experience the thrill of live sports action like never before, with free live streaming of your favorite matches. Get in on the winning game with our unbeatable cashback offers and exclusive VIP program. Join us now and elevate your sports betting journey with unrivaled rewards and unparalleled excitement!',
      btn: 'Visit Sportsbook',
    },
    more: 'Learn More',
    cypto: {
      title: 'No Crypto? No problem.',
      btn: 'Buy Crypto',
    },
  };

  ngOnInit(): void {
    if (this.router.url.includes('zh-cn')) {
      this.local = this.localZHCN;
      this.casinoImg = 'assets/images/landing-page/yulecheng.png';
      this.sportImg = 'assets/images/landing-page/tiyu.png';
    } else {
      this.local = this.localENUS;
      this.casinoImg = 'assets/images/landing-page/yulecheng_en.png';
      this.sportImg = 'assets/images/landing-page/tiyu_en.png';
    }
  }
}
