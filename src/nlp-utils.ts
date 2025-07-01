import { ParsedItemRequest, ParsedCollectionRequest, SearchFilters, CustomFieldInput } from './types.js';

/**
 * Parse natural language instructions for item operations
 */
export function parseItemRequest(instruction: string): ParsedItemRequest {
  const lower = instruction.toLowerCase();
  
  // Determine action
  let action: ParsedItemRequest['action'] = 'search';
  
  if (lower.includes('add') || lower.includes('create') || lower.includes('new')) {
    action = 'add';
  } else if (lower.includes('update') || lower.includes('modify') || lower.includes('edit') || lower.includes('change')) {
    action = 'update';
  } else if (lower.includes('delete') || lower.includes('remove') || lower.includes('discard')) {
    action = 'delete';
  } else if (lower.includes('favorite') || lower.includes('like')) {
    action = 'favorite';
  } else if (lower.includes('unfavorite') || lower.includes('unlike')) {
    action = 'unfavorite';
  }

  const result: ParsedItemRequest = { action };

  // Extract item name for add/update operations
  if (action === 'add') {
    const nameMatches = [
      /(?:add|create|new)\s+(?:item\s+)?(?:called\s+|named\s+)?['""]([^'"'"]+)['""]/.exec(lower),
      /(?:add|create|new)\s+(?:item\s+)?(.+?)(?:\s+with|\s+that|\s+in|\s*$)/.exec(lower)
    ];
    
    for (const match of nameMatches) {
      if (match && match[1]) {
        result.itemName = match[1].trim();
        break;
      }
    }
  }

  // Extract item ID for update/delete operations
  if (action === 'update' || action === 'delete' || action === 'favorite' || action === 'unfavorite') {
    const idMatch = /(?:item\s+)?(?:id\s+)?([a-f0-9-]{36}|[a-f0-9]{32})/.exec(lower);
    if (idMatch) {
      result.itemId = idMatch[1];
    }
  }

  // Extract notes/description
  const notesMatches = [
    /(?:notes?|description|details?)\s*[:\-]?\s*['""]([^'"'"]+)['""]/.exec(lower),
    /(?:with notes?|with description|described as)\s+['""]([^'"'"]+)['""]/.exec(lower),
    /notes?\s*[:\-]\s*(.+?)(?:\s+tag|$)/.exec(lower)
  ];
  
  for (const match of notesMatches) {
    if (match && match[1]) {
      result.notes = match[1].trim();
      break;
    }
  }

  // Extract tags
  const tagMatches = [
    /tags?\s*[:\-]\s*([^,\n]+)/.exec(instruction),
    /(?:tag|tagged|with tags?)\s+(.+?)(?:\s+in|\s+as|\s*$)/.exec(instruction),
    /#(\w+)/g
  ];

  const tags: string[] = [];
  
  // Handle hashtag extraction
  let hashtagMatch;
  while ((hashtagMatch = /#(\w+)/g.exec(instruction)) !== null) {
    tags.push(hashtagMatch[1]);
  }

  // Handle other tag patterns
  for (const match of tagMatches.slice(0, 2)) {
    if (match && Array.isArray(match) && match[1]) {
      const tagList = match[1].split(/[,\s]+/).filter((tag: string) => tag.trim().length > 0 && !tag.startsWith('#'));
      tags.push(...tagList);
      break;
    }
  }

  if (tags.length > 0) {
    result.tags = [...new Set(tags)]; // Remove duplicates
  }

  // Determine if it's storage
  if (lower.includes('storage') || lower.includes('container') || lower.includes('box') || lower.includes('shelf')) {
    result.isStorage = true;
  }

  // Extract container ID
  const containerMatch = /(?:in|inside|container)\s+([a-f0-9-]{36}|[a-f0-9]{32})/.exec(lower);
  if (containerMatch) {
    result.containerId = containerMatch[1];
  }

  // Extract custom fields
  const customFields: CustomFieldInput[] = [];
  const fieldMatches = instruction.match(/(\w+)\s*:\s*([^,\n]+)/g);
  if (fieldMatches) {
    for (const fieldMatch of fieldMatches) {
      const [, name, value] = fieldMatch.match(/(\w+)\s*:\s*(.+)/) || [];
      if (name && value && !['notes', 'tags', 'tag', 'description'].includes(name.toLowerCase())) {
        customFields.push({
          name: name.trim(),
          type: 'text',
          value: value.trim()
        });
      }
    }
  }

  if (customFields.length > 0) {
    result.customFields = customFields;
  }

  // For search operations, extract search query and filters
  if (action === 'search') {
    result.searchQuery = instruction.replace(/^(?:search|find|show|get|list)\s+/i, '');
    
    const filters: SearchFilters = {};
    
    // Extract limit
    const limitMatch = /(?:limit|max|first)\s+(\d+)/.exec(lower);
    if (limitMatch) {
      filters.limit = parseInt(limitMatch[1]);
    }

    // Extract offset
    const offsetMatch = /(?:offset|skip)\s+(\d+)/.exec(lower);
    if (offsetMatch) {
      filters.offset = parseInt(offsetMatch[1]);
    }

    if (result.tags && result.tags.length > 0) {
      filters.tags = result.tags;
    }

    if (Object.keys(filters).length > 0) {
      result.filters = filters;
    }
  }

  return result;
}

/**
 * Parse natural language instructions for collection operations
 */
export function parseCollectionRequest(instruction: string): ParsedCollectionRequest {
  const lower = instruction.toLowerCase();
  
  // Determine action
  let action: ParsedCollectionRequest['action'] = 'create';
  
  if (lower.includes('update') || lower.includes('modify') || lower.includes('edit') || lower.includes('change')) {
    action = 'update';
  } else if (lower.includes('delete') || lower.includes('remove')) {
    action = 'delete';
  } else if (lower.includes('add') && (lower.includes('item') || lower.includes('to collection'))) {
    action = 'add_items';
  } else if (lower.includes('remove') && lower.includes('item')) {
    action = 'remove_items';
  }

  const result: ParsedCollectionRequest = { action };

  // Extract collection name
  const nameMatches = [
    /(?:collection\s+)?(?:called\s+|named\s+)?['""]([^'"'"]+)['""]/.exec(instruction),
    /(?:create|new)\s+collection\s+(.+?)(?:\s+with|\s+that|\s*$)/.exec(lower)
  ];
  
  for (const match of nameMatches) {
    if (match && match[1]) {
      result.collectionName = match[1].trim();
      break;
    }
  }

  // Extract collection ID
  const idMatch = /(?:collection\s+)?(?:id\s+)?([a-f0-9-]{36}|[a-f0-9]{32})/.exec(lower);
  if (idMatch) {
    result.collectionId = idMatch[1];
  }

  // Extract description
  const descMatch = /(?:description|details?)\s*[:\-]?\s*['""]([^'"'"]+)['""]/.exec(instruction);
  if (descMatch) {
    result.description = descMatch[1];
  }

  // Extract visibility
  if (lower.includes('private')) {
    result.visibility = 'PRIVATE';
  } else if (lower.includes('shared') || lower.includes('public')) {
    result.visibility = 'SHARED';
  }

  // Extract item IDs for add/remove operations
  const itemIdMatches = instruction.match(/[a-f0-9-]{36}|[a-f0-9]{32}/g);
  if (itemIdMatches && (action === 'add_items' || action === 'remove_items')) {
    result.itemIds = itemIdMatches;
  }

  return result;
}

/**
 * Extract URLs from text for import operations
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  const matches = text.match(urlRegex);
  return matches || [];
}

/**
 * Generate a user-friendly response message
 */
export function generateResponseMessage(operation: string, success: boolean, data?: any, error?: string): string {
  if (!success && error) {
    return `❌ Failed to ${operation}: ${error}`;
  }

  switch (operation) {
    case 'add_item':
      return `✅ Successfully added item "${data?.name || 'item'}" with ID: ${data?.id}`;
    case 'update_item':
      return `✅ Successfully updated item`;
    case 'delete_item':
      return `✅ Successfully deleted item`;
    case 'search_items':
      const count = data?.totalCount ?? data?.items?.length ?? 0;
      return `🔍 Found ${count} item(s) matching your search`;
    case 'favorite_item':
      return `⭐ Successfully favorited item`;
    case 'unfavorite_item':
      return `✅ Successfully unfavorited item`;
    case 'create_collection':
      return `📁 Successfully created collection "${data?.name}" with ID: ${data?.id}`;
    case 'add_to_collection':
      return `✅ Successfully added items to collection`;
    case 'import_from_url':
      return `📥 Successfully imported item from URL with ID: ${data?.id}`;
    default:
      return success ? `✅ Operation completed successfully` : `❌ Operation failed`;
  }
}

/**
 * Format items for display
 */
export function formatItemsForDisplay(items: any[]): string {
  if (!items || items.length === 0) {
    return 'No items found.';
  }

  return items.map(item => {
    const tags = item.tags?.length > 0 ? ` #${item.tags.join(' #')}` : '';
    const favorite = item.isFavorited ? ' ⭐' : '';
    const storage = item.isStorage ? ' 📦' : '';
    const imageCount = item.images?.length > 0 ? ` (${item.images.length} image${item.images.length > 1 ? 's' : ''})` : '';
    
    return `• ${item.name}${favorite}${storage}${imageCount}${tags}\n  ID: ${item.id}${item.notes ? `\n  Notes: ${item.notes}` : ''}`;
  }).join('\n\n');
}

/**
 * Format collections for display
 */
export function formatCollectionsForDisplay(collections: any[]): string {
  if (!collections || collections.length === 0) {
    return 'No collections found.';
  }

  return collections.map(collection => {
    const visibility = collection.visibility === 'SHARED' ? ' 🔗' : ' 🔒';
    return `• ${collection.name}${visibility}\n  ID: ${collection.id}${collection.description ? `\n  Description: ${collection.description}` : ''}`;
  }).join('\n\n');
}