import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChipDataService {
  /** 筹码 */
  chipData: {
    index: number;
    chip: number;
    value: string;
    digitalValue: string;
    img: string;
    isDisabled: boolean;
  }[] = [
    {
      index: 0,
      chip: 1,
      value: '0.01',
      digitalValue: ' 0.00000001',
      img: 'assets/orignal/images/baccarat/0.png',
      isDisabled: true,
    },
    {
      index: 1,
      chip: 10,
      value: '0.10',
      digitalValue: ' 0.00000010',
      img: 'assets/orignal/images/baccarat/1.png',
      isDisabled: true,
    },
    {
      index: 2,
      chip: 100,
      value: '1.00',
      digitalValue: ' 0.00000100',
      img: 'assets/orignal/images/baccarat/2.png',
      isDisabled: true,
    },
    {
      index: 3,
      chip: 1000,
      value: '10.00',
      digitalValue: ' 0.00001000',
      img: 'assets/orignal/images/baccarat/3.png',
      isDisabled: true,
    },
    {
      index: 4,
      chip: 10000,
      value: '100.00',
      digitalValue: ' 0.00010000',
      img: 'assets/orignal/images/baccarat/4.png',
      isDisabled: true,
    },
    {
      index: 5,
      chip: 100000,
      value: '1000.00',
      digitalValue: ' 0.00100000',
      img: 'assets/orignal/images/baccarat/5.png',
      isDisabled: true,
    },
    {
      index: 6,
      chip: 1000000,
      value: '10000.00',
      digitalValue: ' 0.01000000',
      img: 'assets/orignal/images/baccarat/6.png',
      isDisabled: true,
    },
    {
      index: 7,
      chip: 10000000,
      value: '100000.00',
      digitalValue: ' 0.10000000',
      img: 'assets/orignal/images/baccarat/7.png',
      isDisabled: true,
    },
    {
      index: 8,
      chip: 100000000,
      value: '1000000.00',
      digitalValue: ' 1.00000000',
      img: 'assets/orignal/images/baccarat/8.png',
      isDisabled: true,
    },
    {
      index: 9,
      chip: 1000000000,
      value: '10000000.00',
      digitalValue: ' 10.00000000',
      img: 'assets/orignal/images/baccarat/9.png',
      isDisabled: true,
    },
    {
      index: 10,
      chip: 10000000000,
      value: '100000000.00',
      digitalValue: ' 100.00000000',
      img: 'assets/orignal/images/baccarat/10.png',
      isDisabled: true,
    },
    {
      index: 11,
      chip: 100000000000,
      value: '1000000000.00',
      digitalValue: ' 1000.00000000',
      img: 'assets/orignal/images/baccarat/11.png',
      isDisabled: true,
    },
    {
      index: 12,
      chip: 1000000000000,
      value: '10000000000.00',
      digitalValue: ' 10000.00000000',
      img: 'assets/orignal/images/baccarat/12.png',
      isDisabled: true,
    },
  ];
}
