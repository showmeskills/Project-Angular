import { Pipe, PipeTransform } from '@angular/core';
import { BatchListAdjustmentProduct } from 'src/app/shared/interfaces/risk';
import { ProviderPT } from 'src/app/shared/interfaces/provider';

@Pipe({
  name: 'adjustmentProduct',
  standalone: true,
})
export class AdjustmentProductPipe implements PipeTransform {
  transform(value: BatchListAdjustmentProduct, providerList: ProviderPT[], defaultValue = ''): unknown {
    if (!value?.baseId || !value?.providerId || !value?.gameCategory || !providerList?.length) return defaultValue;

    const provider = providerList.find((e) => e.baseId === value.baseId);
    const category = provider?.details?.find((e) => e.category === value.gameCategory);
    return `${provider?.abbreviation || ''} - ${category?.categoryName || ''}`;
  }
}
