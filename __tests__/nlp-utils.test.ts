import {
  formatItemsForDisplay,
  parseCollectionRequest,
  parseItemRequest
} from '../src/nlp-utils.js';

describe('nlp-utils', () => {
  test('parseItemRequest handles add with tags, notes, and storage', () => {
    const result = parseItemRequest(
      "Add a new item called 'Toolbox' with notes 'Red metal' with tags tools, garage"
    );

    expect(result.action).toBe('add');
    expect(result.itemName).toBe('toolbox');
    expect(result.notes).toBe('red metal');
    expect(result.tags).toEqual(expect.arrayContaining(['tools', 'garage']));
  });

  test('parseItemRequest extracts search filters', () => {
    const result = parseItemRequest('Search for kitchen items limit 5 offset 10');

    expect(result.action).toBe('search');
    expect(result.searchQuery).toBe('for kitchen items limit 5 offset 10');
    expect(result.filters).toEqual({ limit: 5, offset: 10 });
  });

  test('parseCollectionRequest identifies collection actions', () => {
    const result = parseCollectionRequest(
      'Add items to collection 22222222-2222-2222-2222-222222222222 with 11111111-1111-1111-1111-111111111111'
    );

    expect(result.action).toBe('add_items');
    expect(result.collectionId).toBe('22222222-2222-2222-2222-222222222222');
    expect(result.itemIds).toEqual([
      '11111111-1111-1111-1111-111111111111'
    ]);
  });

  test('formatItemsForDisplay renders item list', () => {
    const output = formatItemsForDisplay([
      {
        id: 'item-1',
        name: 'Camera',
        notes: 'Wide lens',
        tags: ['photo'],
        isStorage: false,
        isFavorited: true,
        images: []
      }
    ]);

    expect(output).toContain('Camera');
    expect(output).toContain('item-1');
    expect(output).toContain('Wide lens');
  });
});
