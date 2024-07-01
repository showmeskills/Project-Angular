import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class OddsFormatService {

  private factionList = [
    { Name: '3/100', Value: '1/33' },
    { Name: '3/50', Value: '1/18' },
    { Name: '7/100', Value: '1/14' },
    { Name: '2/25', Value: '1/12' },
    { Name: '9/100', Value: '1/11' },
    { Name: '11/100', Value: '1/9' },
    { Name: '3/25', Value: '1/8' },
    { Name: '13/100', Value: '2/15' },
    { Name: '7/50', Value: '1/7' },
    { Name: '3/20', Value: '2/13' },
    { Name: '4/25', Value: '2/13' },
    { Name: '17/100', Value: '1/6' },
    { Name: '9/50', Value: '2/11' },
    { Name: '11/50', Value: '2/9' },
    { Name: '29/100', Value: '2/7' },
    { Name: '33/100', Value: '1/3' },
    { Name: '67/100', Value: '4/6' }
  ];

  constructor(
  ) {
  }

  formOdds(oddObj: any, oddsType: string): string {
    let oddsFixId = '';
    let returnValue = '';

    if (oddObj.hasOwnProperty('GLSpBetGroupOptionGUID')) { // from  滚球
      oddsFixId = oddObj.GLSpBetGroupOptionGUID;
    } else if (oddObj.hasOwnProperty('GroupOptionGUID')) { // from  滚球
      oddsFixId = oddObj.GroupOptionGUID;
    } else if (oddObj.hasOwnProperty('GID')) { // from 日程/熱門
      oddsFixId = oddObj.GID;
    } else if (oddObj.hasOwnProperty('GOG')) {
      oddsFixId = oddObj.GOG
    }

    returnValue = this.getRate(oddsType, Number(oddObj.OptionRate), oddsFixId);

    return returnValue;
  }

  // rateId = GroupOptionGUID | VGID
  getRate(oddsType: string, rate: number, rateId: string): string {
    if (rate === undefined || rate === null || rate.toString() === '0') {
      return '';
    }
    return this.getNewRate(oddsType, rate);
  }

  private getNewRate(oddsType: string, rate: number) {
    let returnRate = 0;
    switch (oddsType) {
      case '00006': // 小數式
      case '00001': // 歐洲盤
        returnRate = rate;
        break;
      case '00003': // 馬來盤
        if (1 < rate && rate < 2) {
          returnRate = rate - 1;
        } else if (rate >= 2) {
          returnRate = -1 / (rate - 1);
        }
        break;
      case '00008': // 美式
      case '00004': // 美國盤
        if (1 < rate && rate <= 2) {
          const adjRate: string = this.formatDecimal((-100 / (rate - 1)), 2);
          returnRate = Math.floor(Number(adjRate) * -1) * -1;
        } else if (rate > 2) {
          returnRate = ((rate - 1) * 100);
        }
        // 美國盤不顯示小數點後兩位，先return
        // 美國盤正數要顯示加號
        if (Number(returnRate) > 0) {
          return '+' + (Number(returnRate).toFixed(0));
        }
        else {
          return Number(returnRate).toFixed(0);
        }
      case '00005': // 印尼盤
        if (1 < rate && rate <= 2) {
          returnRate = (-1 / (rate - 1));
        } else if (rate > 2) {
          returnRate = (rate - 1);
        }
        break;
      case '00007': // 分數式
        const fracKey: string = this.getFractionKey(rate);
        // if (fracKey in this.factionList) {
        //   returnRate = Number(this.factionList[fracKey]);
        // }
        return fracKey;
        break;
      case '00002': // 香港盤
      default:
        returnRate = rate - 1;
        break;
    }
    // //console.log(typeof Number(returnRate));
    return Number(returnRate).toFixed(2);
    // return this.formatDecimal(Number(returnRate), 2);
  }

  formatDecimal(num: any, decimal: any): string {
    num = num.toString()
    let index = num.indexOf('.')
    if (index !== -1) {
      num = num.substring(0, decimal + index + 1)
    } else {
      num = num.substring(0)
    }
    return parseFloat(num).toFixed(decimal)
  }

  private getFractionKey(rate: number): string {
    const numerator = (Number(rate).minus(1)).subtract(100);
    const denominator = 100;
    let temp;
    let a = numerator;
    let b = denominator;
    //alert(a % b);
    while (b != 0) {
      temp = a % b; //求 a,b 相除後的餘數
      a = b; //將被除數 a 換成除數 b
      b = temp; //將除數b換成a,b相除後的餘數
    }
    var rtnResult = (numerator / a).toString() + '/' + (denominator / a).toString();
    for (var i = 0; i < this.factionList.length; i++) {
      var item = this.factionList[i];
      if (item.Name == rtnResult) {
        rtnResult = item.Value;
        break;
      }
    }
    return rtnResult;

  }
  public toDeci(fraction: any) {
    fraction = fraction.toString();
    let result, wholeNum: any = 0, frac, deci = 0;
    if (fraction.search('/') >= 0) {
      if (fraction.search('-') >= 0) {
        wholeNum = fraction.split('-');
        frac = wholeNum[1];
        wholeNum = parseInt((wholeNum as any), 10);
      } else {
        frac = fraction;
      }
      if (fraction.search('/') >= 0) {
        frac = frac.split('/');
        deci = parseInt(frac[0], 10) / parseInt(frac[1], 10);
      }
      result = wholeNum + deci;
    } else {
      result = fraction
    }
    return result;
  }
}
