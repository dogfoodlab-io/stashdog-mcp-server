export interface StashDogConfig {
  apiUrl: string;
  authToken?: string;
}

export interface Item {
  id: string;
  name: string;
  notes?: string;
  tags: string[];
  isStorage: boolean;
  isClassified: boolean;
  isFavorited: boolean;
  containerId?: string;
  container?: Item;
  containedItems: Item[];
  images: ItemImage[];
  customFields: CustomField[];
  permissions: ItemPermission[];
}

export interface ItemImage {
  id: string;
  url: string;
  path: string;
  createdAt: string;
  lastModified: string;
}

export interface CustomField {
  name: string;
  type: string;
  value: string;
}

export interface ItemPermission {
  id: string;
  userId: string;
  permissionLevel: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  visibility: 'PRIVATE' | 'SHARED';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  itemId: string;
  position: number;
  addedAt: string;
  addedBy: string;
  item: Item;
}

export interface Tag {
  id: string;
  name: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  itemsCount: number;
  collectionsCount: number;
  tagsCount: number;
}

export interface SearchFilters {
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  coverImageUrl?: string;
  visibility?: 'PRIVATE' | 'SHARED';
}

export interface UpdateCollectionInput {
  id: string;
  name?: string;
  description?: string;
  coverImageUrl?: string;
  visibility?: 'PRIVATE' | 'SHARED';
}

export interface CustomFieldInput {
  name: string;
  type: string;
  value: string;
}

export interface AddItemInput {
  name: string;
  notes?: string;
  tags?: string[];
  isStorage?: boolean;
  containerId?: string;
  customFields?: CustomFieldInput[];
  isClassified?: boolean;
}

export interface UpdateItemInput {
  id: string;
  name?: string;
  notes?: string;
  tags?: string[];
  isStorage?: boolean;
  containerId?: string;
  customFields?: CustomFieldInput[];
  isClassified?: boolean;
  isFavorite?: boolean;
}

// Natural language processing types
export interface ParsedItemRequest {
  action: 'add' | 'update' | 'search' | 'delete' | 'favorite' | 'unfavorite';
  itemName?: string;
  itemId?: string;
  notes?: string;
  tags?: string[];
  isStorage?: boolean;
  containerId?: string;
  customFields?: CustomFieldInput[];
  searchQuery?: string;
  filters?: SearchFilters;
}

export interface ParsedCollectionRequest {
  action: 'create' | 'update' | 'delete' | 'add_items' | 'remove_items';
  collectionName?: string;
  collectionId?: string;
  description?: string;
  visibility?: 'PRIVATE' | 'SHARED';
  itemIds?: string[];
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}