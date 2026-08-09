import { resolveCheckoutShippingMethod } from '@lego-shop/shared';

describe('resolveCheckoutShippingMethod', () => {
  it.each([
    ['Thành phố Hồ Chí Minh', 'Thành phố Thủ Đức', 'hcm_inner'],
    ['TP. Hồ Chí Minh', 'Quận 9', 'hcm_inner'],
    ['Thành phố Hồ Chí Minh', 'Huyện Hóc Môn', 'hcm_outer'],
    ['Thành phố Hồ Chí Minh', 'Huyện Nhà Bè', 'hcm_outer'],
    ['Hà Nội', 'Quận Cầu Giấy', 'nationwide'],
  ])('maps %s / %s to %s', (province, district, expected) => {
    expect(resolveCheckoutShippingMethod(province, district)).toBe(expected);
  });
});
