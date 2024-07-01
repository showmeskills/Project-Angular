import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppService } from 'src/app/app.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { CountryFilterPipe } from '../../pipes/cuontry-filter.pipe';
import { CacheService } from '../../service/cache.service';

@Component({
  selector: 'app-phone-number-selecter',
  templateUrl: './phone-number-selecter.component.html',
  styleUrls: ['./phone-number-selecter.component.scss'],
})
export class PhoneNumberSelecterComponent implements OnInit {
  constructor(
    public appService: AppService,
    public dialogRef: MatDialogRef<PhoneNumberSelecterComponent>,
    private countryFilter: CountryFilterPipe,
    private cacheService: CacheService,
    private kycService: KycService
  ) {}

  countries: any = []; //根据搜索显示的列表
  allCountryData: any = []; //国家区号全部信息
  currentKey: string = ''; //当前被选中的国家区号
  searchCountry: string = ''; //搜索国家内容

  ngOnInit() {
    this.countries = this.allCountryData = this.cacheService.countries;
  }

  /**
   * Input Focus事件
   *
   * @param element
   */
  onFocus(element: any) {
    element.isFocus = true;
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlur(element: any) {
    //延迟200MS，防止clear无法点击
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }

  /**
   * 国旗class
   *
   * @param key
   */
  className(key: any) {
    const iconClassName_old = 'country-' + key.replace(/\(/g, '').replace(/\)/g, '');
    // 后台返回的国家code，含有不符合CSS样式规则， 有空格，&，逗号，小数点等。
    return iconClassName_old.replace(/\&/g, '_and_').replace(/ /g, '_').replace(/\,/g, '').replace(/\./g, '');
  }

  /**
   * 选择国家手机区号
   *
   * @param key
   * @param key.code
   * @param key.name
   * @param key.areaCode
   * @param key.iso
   * @param key.hasSms
   */
  handleSelected(key: { code: string; name: string; areaCode: string; iso: string; hasSms: boolean }) {
    this.appService.currentCountry$.next(key);
    if (key.areaCode !== '+86') {
      // 切换 不是中国时 清空 中国 表单
      this.kycService.onResetKycForm();
    }

    // 如果全名国家 切换 不清空 全名, 清空 姓 和 名 还有手机; 其他 已经 填写数据 保留
    if (this.kycService.fullNameModeCountryList.includes(key.iso)) {
      this.kycService.onResetFLName();
    } else {
      this.kycService.onResetFullName();
    }

    this.dialogRef.close();
  }

  onSearchInput() {
    if (this.searchCountry) {
      this.countries = this.countryFilter.transform(this.allCountryData, this.searchCountry);
      return;
    }
    this.countries = this.allCountryData;
  }

  /**
   * 关闭弹窗
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * 清除输入框的内容
   *
   * @param element
   */
  handleClean(element: any) {
    element.value = '';
    element.focus();
    element.dispatchEvent(new InputEvent('input'));

    if (element.timer) {
      clearTimeout(element.timer);
    }
  }
}
