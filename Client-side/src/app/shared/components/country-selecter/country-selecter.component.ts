import { Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { Country } from '../../interfaces/country.interface';
import { CacheService } from '../../service/cache.service';
import { LocaleService } from '../../service/locale.service';
import { PopupService } from '../../service/popup.service';
import { StandardPopupComponent } from '../standard-popup/standard-popup.component';

@Component({
  selector: 'app-country-selecter',
  templateUrl: './country-selecter.component.html',
  styleUrls: ['./country-selecter.component.scss'],
})
export class CountrySelecterComponent implements OnInit, OnChanges {
  constructor(
    private appService: AppService,
    private cacheService: CacheService,
    private popupService: PopupService,
    private kycService: KycService,
    private localeService: LocaleService,
    private destroyRef: DestroyRef,
  ) {}
  /** kyc的H5首页 */
  @Input() isH5Kyc?: boolean = false;
  @Input() isOpen?: boolean = false;
  /** 是否来自dialog页面 */
  @Input() isFromDialog?: boolean = false;
  @Input() isShowSearch?: boolean = false;
  /** 国家ISO */
  @Input() countryISO: string = '';
  /** 是否禁用状态 ，不可选择国家 */
  @Input() disabled: boolean = false;
  /** 小size下拉选框 */
  @Input() smallSize?: boolean = false;
  /**true:全部国家和地区都可选择； false：根据IP或者手机区域选择 */
  @Input() fullCountry?: boolean = true;
  /** 国家列表 */
  countries: Country[] = [];
  /** 被选中的国家区号 */
  currentAreaCode: string = '';
  /** 搜索国家内容 */
  searchCuntry: string = '';
  /** 搜索不到 */
  isEmpty: boolean = false;
  /** 当前国家class */
  fogClassName = '';
  /** 国家名称 */
  countryName = '';
  /** 搜索国家内容 */
  searchCountry: string = '';
  /**当前用户是否为亚洲 */
  isEurope: boolean = false;

  /** countryLoading */
  countryLoading: boolean = false;
  ngOnInit() {
    //获取国家区号
    this.countries = this.cacheService.countries;
    //获取当前选择的电话区号
    this.appService.currentCountry$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(x => x),
      )
      .subscribe(x => {
        if (!this.countryISO) {
          const { areaCode, code, name } = x;
          this.currentAreaCode = areaCode;
          this.fogClassName = this.className(code);
          this.countryName = name;
        }
      });
    if (!this.fullCountry) {
      this.appService.userInfo$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(x => {
        if (x) {
          this.isEurope = x.isEurope;
        }
      });
    }
  }

  ngOnChanges(_: SimpleChanges): void {
    //如果有传入的ISO，将优先使用传入的
    if (this.countryISO) {
      const country = this.cacheService.countries.find(x => x.iso.toLowerCase() == this.countryISO.toLowerCase());
      if (country) {
        this.appService.currentCountry$.next(country);
        this.currentAreaCode = country.areaCode;
        this.countryName = country.name;
        this.fogClassName = this.className(country.code);
      }
    }
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

  /**
   * 选择国家手机区号
   *
   * @param key
   */
  handleSelected(key: any) {
    // 只能选择亚洲或者欧洲
    if (!this.fullCountry) {
      //选择国家是用户信息同一个区域
      if (!this.isEurope === this.kycService.fullNameModeCountryList.includes(key.iso)) {
        this.appService.currentCountry$.next(key);
        this.openDropDown();
      } else {
        this.noticePopup();
      }
    } else {
      this.appService.currentCountry$.next(key);
      this.openDropDown();
    }
  }

  openDropDown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  /**
   * 手机号规则验证
   *
   * @param element 手机号输入框
   */
  onSearchInput(element: any) {
    this.searchCountry = element.value;
    element.isValid = this.searchCountry.length > 0;
  }

  /**提示弹框 */
  noticePopup() {
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: this.localeService.getValue('rem'),
        buttons: [
          { text: this.localeService.getValue('sure_btn'), primary: false },
          { text: this.localeService.getValue('cs_text'), primary: true },
        ],
        description: this.localeService.getValue('country_selecter_notice'),
        callback: () => {
          //打开客服
          this.appService.toOnLineService$.next(true);
          return;
        },
        closeIcon: true,
      },
      disableClose: true,
    });
  }
}
