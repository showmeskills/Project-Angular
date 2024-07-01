import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AssetsLinkPipe } from './assets-link.pipe';
import { AvatarDefaultPipe } from './avatar-default.pipe';
import { ConversionCurrencyPipe } from './conversion-currency.pipe';
import { CountryFilterPipe } from './cuontry-filter.pipe';
import { CurrencyIconPipe } from './currency-icon.pipe';
import { CurrencyValuePipe } from './currency-value.pipe';
import { DecimalDigitPipe } from './decimal-digit.pipe';
import { TransToDefaultCurrencyPipe } from './default-currency.pipe';
import { ElegantDisplayPipe } from './elegant-display.pipe';
import { FilterByFactorPipe } from './filter-by-factor.pipe';
import { FilterByKeyValuePipe } from './filter-by-key-value.pipe';
import { FilterByTextPipe } from './filter-by-text.pipe';
import { FirstLetterPipe } from './first-letter.pipe';
import { FriendlyTimePipe } from './friendly-time.pipe';
import { GetFileNamePipe } from './get-file-name.pipe';
import { HtmlPipe } from './help-center-content.pipe';
import { LinkClickAblePipe } from './link-click-able.pipe';
import { MomentDatePipe } from './moment-date.pipe';
import { PluckPipe } from './pluck.pipe';
import { PreferWebpPipe } from './prefer-webp.pipe';
import { ProviderCategoryNamePipe } from './provider-category-name.pipe';
import { ReplacePipe } from './replace.pipe';
import { RouterActivePipe } from './router-active.pipe';
import { SafePipe } from './safe-url.pipe';
import { SliceArrayPipe } from './slice-array.pipe';
import { SliceSymbolStr } from './slice-symbol-str.pipe';
import { TextOverflowPipe } from './text-overflow.pipe';
import { TostringPipe } from './tostring.pipe';
import { TranslatePipe } from './translate.pipe';
import { UnshiftPipe } from './unshift.pipe';
import { UsdChangeToUsdtPipe } from './usd-change-to-usdt.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    FirstLetterPipe,
    CountryFilterPipe,
    FilterByTextPipe,
    FilterByFactorPipe,
    DecimalDigitPipe,
    TextOverflowPipe,
    FilterByKeyValuePipe,
    UnshiftPipe,
    SliceArrayPipe,
    SafePipe,
    CurrencyIconPipe,
    UsdChangeToUsdtPipe,
    CurrencyValuePipe,
    ElegantDisplayPipe,
    TranslatePipe,
    ReplacePipe,
    HtmlPipe,
    GetFileNamePipe,
    MomentDatePipe,
    SliceSymbolStr,
    AssetsLinkPipe,
    RouterActivePipe,
    ProviderCategoryNamePipe,
    AvatarDefaultPipe,
    TostringPipe,
    ConversionCurrencyPipe,
    PreferWebpPipe,
    TransToDefaultCurrencyPipe,
    FriendlyTimePipe,
    LinkClickAblePipe,
    PluckPipe,
  ],
  exports: [
    FirstLetterPipe,
    CountryFilterPipe,
    FilterByTextPipe,
    FilterByFactorPipe,
    DecimalDigitPipe,
    TextOverflowPipe,
    FilterByKeyValuePipe,
    UnshiftPipe,
    SliceArrayPipe,
    SafePipe,
    CurrencyIconPipe,
    UsdChangeToUsdtPipe,
    CurrencyValuePipe,
    ElegantDisplayPipe,
    TranslatePipe,
    ReplacePipe,
    HtmlPipe,
    GetFileNamePipe,
    MomentDatePipe,
    SliceSymbolStr,
    AssetsLinkPipe,
    RouterActivePipe,
    ProviderCategoryNamePipe,
    AvatarDefaultPipe,
    TostringPipe,
    ConversionCurrencyPipe,
    PreferWebpPipe,
    TransToDefaultCurrencyPipe,
    FriendlyTimePipe,
    LinkClickAblePipe,
    PluckPipe,
  ],
})
export class PipesModule {}
