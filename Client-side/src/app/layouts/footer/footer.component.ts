import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ResourceApi } from 'src/app/shared/apis/resource.api';
import { SelectLangDialogComponent } from 'src/app/shared/components/dialogs/select-lang-dialog/select-lang-dialog.component';
import { LangModel } from 'src/app/shared/interfaces/country.interface';
import { FooterList, LicensePic } from 'src/app/shared/interfaces/resource.interface';
import { CountryUtilsService } from 'src/app/shared/service/country.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@UntilDestroy()
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  page!: string;
  isH5!: boolean;
  simple!: boolean;
  disclaimer!: string;
  licensePic!: LicensePic[];

  aboutUSList: FooterList = { type: 'AboutUs', name: this.localeService.getValue('abount_us'), detail: [] };
  productList: FooterList = { type: 'Product', name: this.localeService.getValue('product_title'), detail: [] };
  studyList: FooterList = { type: 'Study', name: this.localeService.getValue('study_title'), detail: [] };
  gamblingList: FooterList = {
    type: 'GamblingAddiction',
    name: this.localeService.getValue('gambling_addiction_title'),
    detail: [],
  };
  helpList: FooterList = { type: 'Help', name: this.localeService.getValue('help_title'), detail: [] };
  communityList: FooterList = { type: 'Community', name: 'Community', detail: [] };
  footerList = [
    this.aboutUSList,
    this.productList,
    this.helpList,
    this.studyList,
    this.gamblingList,
    this.communityList,
  ];
  h5SelectedIndex?: number;

  constructor(
    private layout: LayoutService,
    private appService: AppService,
    private dialog: MatDialog,
    private countryUtils: CountryUtilsService,
    private router: Router,
    private resourceApi: ResourceApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private sanitizer: DomSanitizer
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(e => {
      this.page = e;
      this.simple = ['register', 'login', 'password'].includes(e);
    });
  }

  countries!: LangModel[]; //lang全部信息
  /** 当前选中的语言 */
  selectedLang: LangModel | undefined;
  /** Footer数据缓存 */
  static footerCacheData: any;

  async ngOnInit() {
    this.appService.languages$.pipe(untilDestroyed(this)).subscribe(x => {
      this.countries = x;
      this.selectedLang = this.countries.find(y => y.code.toLowerCase() == this.appService.languageCode.toLowerCase());
    });
    const result = FooterComponent.footerCacheData ?? (await firstValueFrom(this.resourceApi.getFooter()));
    if (result?.data) {
      FooterComponent.footerCacheData = result;
      const footerData = result.data.footer[0];
      this.licensePic = result.data.license;
      this.disclaimer = this.localeService.brandNameReplace(footerData?.disclaimer?.disclaimer ?? '');
      // footerData.info.map((item: any, index: number) => {
      //   if (item.footerType == this.footerList[index]?.type) {
      //     this.footerList[index].detail = item.detail;
      //   }
      // })
      this.licensePic.forEach(x => {
        if (x.licenseType == 'Code') {
          x.resourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(x.image);
        }
      });
      footerData?.info?.forEach((a: any) => {
        this.footerList.forEach((b: any) => {
          if (a.footerType === b.type) {
            b.detail = a.detail;
          }
        });
      });
    }
  }

  selectLang() {
    if (this.isH5) {
      this.appService.h5LangSelectPop$.next(true);
    } else {
      this.dialog.open(SelectLangDialogComponent, {
        panelClass: 'selecte-lang-dialog-container',
      });
    }
  }

  /**
   * 获取当前选中国家的语言图标
   *
   * @returns
   */
  countryClassName() {
    if (!this.selectedLang) return '';
    return this.countryUtils.getcountryClassName(this.selectedLang?.code);
  }

  onSelected(i: number) {
    if (this.h5SelectedIndex === i) {
      this.h5SelectedIndex = -1;
      return;
    }
    this.h5SelectedIndex = i;
  }

  getIsLink(url: string) {
    return url.slice(0, 4) === 'http';
  }

  jumpToPage(page: string, isBlank: boolean) {
    if (page == '/online-service') {
      this.appService.toOnLineService$.next(true);
      return;
    }
    if (!page) {
      this.toast.show({ message: `${this.localeService.getValue('page_exist')}!`, type: 'fail' });
      return;
    }
    let isCode: boolean = false;
    this.countries
      .map(v => v.code)
      .forEach(e => {
        page
          .split('/')
          .filter(a => a)
          .forEach((b: any) => {
            if (e === b) {
              isCode = true;
            }
          });
      });

    const url = page
      .split('/')
      .slice(isCode ? 2 : 1)
      .join('/');

    if (isBlank) {
      window.open(`${location.origin}/${this.appService.languageCode}/` + url, '_blank');
    } else {
      this.router.navigateByUrl(`/${this.appService.languageCode}/` + url);
    }
  }
}
