import {
  countJsonCatalogReferences,
  jsonContainsCatalogId,
} from './catalog-reference.util';

describe('catalog-reference.util', () => {
  it('finds exact catalog IDs in nested snapshots', () => {
    expect(
      jsonContainsCatalogId(
        {
          design: {
            accessories: [{ id: 'accessory-1' }],
          },
        },
        'accessory-1',
      ),
    ).toBe(true);
  });

  it('does not match a partial ID embedded in user content', () => {
    expect(
      jsonContainsCatalogId(
        { note: 'Please use accessory-1 in the final design' },
        'accessory-1',
      ),
    ).toBe(false);
  });

  it('counts referenced records once even when an ID occurs repeatedly', () => {
    expect(
      countJsonCatalogReferences(
        [
          { id: 'part-1', nested: [{ id: 'part-1' }] },
          { id: 'part-2' },
          { selectedId: 'part-1' },
        ],
        'part-1',
      ),
    ).toBe(2);
  });
});
