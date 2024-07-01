Number.prototype.toDecimal = function (decimal = 2): string {
  let num = toNonExponential(this);
  const index = num.indexOf('.');
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1);
  } else {
    num = num.substring(0);
  }
  return parseFloat(num).toFixed(decimal);
};
//加法
Number.prototype.add = function (n) {
  const o = floatCalc(this, n);
  return (o.a + o.b) / Math.pow(10, o.num);
};
//减法
Number.prototype.minus = function (n) {
  const o = floatCalc(this, n);
  return (o.a - o.b) / Math.pow(10, o.num);
};
//乘法
Number.prototype.subtract = function (n) {
  const o = floatCalc(this, n);
  return (o.a * o.b) / Math.pow(10, o.num * 2);
};
//除法
Number.prototype.divide = function (n) {
  const o = floatCalc(this, n);
  return o.a / o.b;
};
//四则运算化成整数计算方法
var floatCalc = function (a: any, b: any) {
  (a = toNonExponential(a) + ''), (b = toNonExponential(b) + '');
  let aNum = a.indexOf('.'),
    bNum = b.indexOf('.'),
    aSum,
    bSum,
    resultNum,
    inta,
    intb;
  aSum = aNum < 0 ? 0 : a.split('.')[1].length;
  bSum = bNum < 0 ? 0 : b.split('.')[1].length;
  resultNum = aSum > bSum ? aSum : bSum;

  inta =
    aNum < 0
      ? Number(a + (Math.pow(10, resultNum) + '').replace('1', ''))
      : (function () {
          a = a.replace('.', '');
          a = resultNum == aSum ? a : a + (Math.pow(10, resultNum - aSum) + '').replace('1', '');
          return Number(a);
        })();

  intb =
    bNum < 0
      ? Number(b + (Math.pow(10, resultNum) + '').replace('1', ''))
      : (function () {
          b = b.replace('.', '');
          b = resultNum == bSum ? b : b + (Math.pow(10, resultNum - bSum) + '').replace('1', '');
          return Number(b);
        })();

  return {
    a: inta,
    b: intb,
    num: resultNum,
  };
};

/**
 *
 * @param num
 */
function toNonExponential(num: any) {
  const m = num?.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}

//组合函数C(n,m) 返回count
Number.prototype.combination = function (n: number, m: number) {
  return factorial1(n, m) / factorial1(m, m);
};
//
var factorial1 = (n: number, m: number) => {
  let num = 1;
  let count = 0;
  for (let i = n; i > 0; i--) {
    if (count == m) {
      break;
    }
    num = num * i;
    count++;
  }
  return num;
};

//组合函数C(n,m) 返回组合的数组集合
Number.prototype.combinationBack = (arr: any[], m: number) => {
  const r: any[] = [];
  _([], arr, m);
  return r;
  /**
   *
   * @param t
   * @param a
   * @param m
   */
  function _(t: any[], a: any[], m: number) {
    //t:临时数组 a:目标数组 m：多少个数进行组合
    if (m === 0) {
      r[r.length] = t; //相当于push
      return;
    }
    for (let i = 0; i <= a.length - m; i++) {
      //从0开始 到n-m
      //将t赋值给b 不能用=赋值，使用slice会形成新的数组赋值
      const b = t.slice();
      b.push(a[i]);
      _(b, a.slice(i + 1), m - 1);
    }
  }
};

Number.prototype.toDecimal2NoZero = function (n: number) {
  const f = Math.round(n * 100) / 100;
  return f;
};

export {};
