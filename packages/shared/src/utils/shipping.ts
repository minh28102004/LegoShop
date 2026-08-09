import type { CheckoutShippingMethod } from '../contracts/cart.contract';

const HCM_OUTER_DISTRICTS = [
  'binh chanh',
  'can gio',
  'cu chi',
  'hoc mon',
  'nha be',
] as const;

function normalizeAddressPart(value?: string | null) {
  return (value ?? '')
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Resolves the supported delivery tier from a structured Vietnamese address.
 * The shop origin is FPT University in Thu Duc City (former District 9).
 */
export function resolveCheckoutShippingMethod(
  province?: string | null,
  district?: string | null,
): CheckoutShippingMethod {
  const normalizedProvince = normalizeAddressPart(province);
  const normalizedDistrict = normalizeAddressPart(district);
  const isHoChiMinhCity =
    normalizedProvince.includes('ho chi minh') ||
    normalizedProvince === 'hcm' ||
    normalizedProvince === 'tp hcm' ||
    normalizedProvince === 'tphcm';

  if (!isHoChiMinhCity) return 'nationwide';

  const isOuterDistrict = HCM_OUTER_DISTRICTS.some((name) =>
    normalizedDistrict.includes(name),
  );
  return isOuterDistrict ? 'hcm_outer' : 'hcm_inner';
}
