import { Injectable } from '@angular/core';
import { PokerInfor } from 'src/app/orignal/shared/interfaces/hilo-info.interface';

@Injectable({
  providedIn: 'root',
})
export class HiloService {
  // 0黑桃A、1红桃A、 2梅花A、3方块A
  // 4黑桃2、5红桃2、 6梅花2、7方块2
  // 8黑桃3、9红桃3、10梅花3、11方块3
  CARD_DATA: PokerInfor[] = [
    { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
    { index: 1, num: 'A', color: 'hearts', cnColor: '♥', higher: '92.31%', lower: '7.69%' },
    { index: 2, num: 'A', color: 'clubs', cnColor: '♣', higher: '92.31%', lower: '7.69%' },
    { index: 3, num: 'A', color: 'diamonds', cnColor: '♦', higher: '92.31%', lower: '7.69%' },

    { index: 4, num: '2', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '15.38%' },
    { index: 5, num: '2', color: 'hearts', cnColor: '♥', higher: '92.31%', lower: '15.38%' },
    { index: 6, num: '2', color: 'clubs', cnColor: '♣', higher: '92.31%', lower: '15.38%' },
    { index: 7, num: '2', color: 'diamonds', cnColor: '♦', higher: '92.31%', lower: '15.38%' },

    { index: 8, num: '3', color: 'spades', cnColor: '♠', higher: '84.62%', lower: '23.07%' },
    { index: 9, num: '3', color: 'hearts', cnColor: '♥', higher: '84.62%', lower: '23.07%' },
    { index: 10, num: '3', color: 'clubs', cnColor: '♣', higher: '84.62%', lower: '23.07%' },
    { index: 11, num: '3', color: 'diamonds', cnColor: '♦', higher: '84.62%', lower: '23.07%' },

    { index: 12, num: '4', color: 'spades', cnColor: '♠', higher: '76.92%', lower: '30.76%' },
    { index: 13, num: '4', color: 'hearts', cnColor: '♥', higher: '76.92%', lower: '30.76%' },
    { index: 14, num: '4', color: 'clubs', cnColor: '♣', higher: '76.92%', lower: '30.76%' },
    { index: 15, num: '4', color: 'diamonds', cnColor: '♦', higher: '76.92%', lower: '30.76%' },

    { index: 16, num: '5', color: 'spades', cnColor: '♠', higher: '69.23%', lower: '38.46%' },
    { index: 17, num: '5', color: 'hearts', cnColor: '♥', higher: '69.23%', lower: '38.46%' },
    { index: 18, num: '5', color: 'clubs', cnColor: '♣', higher: '69.23%', lower: '38.46%' },
    { index: 19, num: '5', color: 'diamonds', cnColor: '♦', higher: '69.23%', lower: '38.46%' },

    { index: 20, num: '6', color: 'spades', cnColor: '♠', higher: '61.54%', lower: '46.15%' },
    { index: 21, num: '6', color: 'hearts', cnColor: '♥', higher: '61.54%', lower: '46.15%' },
    { index: 22, num: '6', color: 'clubs', cnColor: '♣', higher: '61.54%', lower: '46.15%' },
    { index: 23, num: '6', color: 'diamonds', cnColor: '♦', higher: '61.54%', lower: '46.15%' },

    { index: 24, num: '7', color: 'spades', cnColor: '♠', higher: '53.85%', lower: '53.85%' },
    { index: 25, num: '7', color: 'hearts', cnColor: '♥', higher: '53.85%', lower: '53.85%' },
    { index: 26, num: '7', color: 'clubs', cnColor: '♣', higher: '53.85%', lower: '53.85%' },
    { index: 27, num: '7', color: 'diamonds', cnColor: '♦', higher: '53.85%', lower: '53.85%' },

    { index: 28, num: '8', color: 'spades', cnColor: '♠', higher: '46.15%', lower: '61.53%' },
    { index: 29, num: '8', color: 'hearts', cnColor: '♥', higher: '46.15%', lower: '61.53%' },
    { index: 30, num: '8', color: 'clubs', cnColor: '♣', higher: '46.15%', lower: '61.53%' },
    { index: 31, num: '8', color: 'diamonds', cnColor: '♦', higher: '46.15%', lower: '61.53%' },

    { index: 32, num: '9', color: 'spades', cnColor: '♠', higher: '38.46%', lower: '69.23%' },
    { index: 33, num: '9', color: 'hearts', cnColor: '♥', higher: '38.46%', lower: '69.23%' },
    { index: 34, num: '9', color: 'clubs', cnColor: '♣', higher: '38.46%', lower: '69.23%' },
    { index: 35, num: '9', color: 'diamonds', cnColor: '♦', higher: '38.46%', lower: '69.23%' },

    { index: 36, num: '10', color: 'spades', cnColor: '♠', higher: '30.77%', lower: '76.92%' },
    { index: 37, num: '10', color: 'hearts', cnColor: '♥', higher: '30.77%', lower: '76.92%' },
    { index: 38, num: '10', color: 'clubs', cnColor: '♣', higher: '30.77%', lower: '76.92%' },
    { index: 39, num: '10', color: 'diamonds', cnColor: '♦', higher: '30.77%', lower: '76.92%' },

    { index: 40, num: 'J', color: 'spades', cnColor: '♠', higher: '23.08%', lower: '84.61%' },
    { index: 41, num: 'J', color: 'hearts', cnColor: '♥', higher: '23.08%', lower: '84.61%' },
    { index: 42, num: 'J', color: 'clubs', cnColor: '♣', higher: '23.08%', lower: '84.61%' },
    { index: 43, num: 'J', color: 'diamonds', cnColor: '♦', higher: '23.08%', lower: '84.61%' },

    { index: 44, num: 'Q', color: 'spades', cnColor: '♠', higher: '15.38%', lower: '92.31%' },
    { index: 45, num: 'Q', color: 'hearts', cnColor: '♥', higher: '15.38%', lower: '92.31%' },
    { index: 46, num: 'Q', color: 'clubs', cnColor: '♣', higher: '15.38%', lower: '92.31%' },
    { index: 47, num: 'Q', color: 'diamonds', cnColor: '♦', higher: '15.38%', lower: '92.31%' },

    { index: 48, num: 'K', color: 'spades', cnColor: '♠', higher: '7.69%', lower: '92.31%' },
    { index: 49, num: 'K', color: 'hearts', cnColor: '♥', higher: '7.69%', lower: '92.31%' },
    { index: 50, num: 'K', color: 'clubs', cnColor: '♣', higher: '7.69%', lower: '92.31%' },
    { index: 51, num: 'K', color: 'diamonds', cnColor: '♦', higher: '7.69%', lower: '92.31%' },
  ];
}
