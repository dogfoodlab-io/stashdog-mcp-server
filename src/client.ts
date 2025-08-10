import { GraphQLClient } from 'graphql-request';
import { StashDogConfig } from './types.js';
import * as operations from './graphql/operations.js';

// Fixed missing import for SubscriptionTier
type SubscriptionTier = import('./types').SubscriptionTier;

export class StashDogClient {
  private client: GraphQLClient;
  private config: StashDogConfig;

  constructor(config: StashDogConfig) {
    this.config = config;
    this.client = new GraphQLClient(config.apiUrl, {
      headers: config.authToken ? {
        'Authorization': `Bearer ${config.authToken}`
      } : {}
    });
  }

  setAuthToken(token: string) {
    this.config.authToken = token;
    this.client.setHeader('Authorization', `Bearer ${token}`);
  }

  clearAuthToken() {
    this.config.authToken = undefined;
    this.client.setHeader('Authorization', '');
  }

  // Authentication
  async signIn(email: string, password: string) {
    return this.client.request(operations.SIGN_IN, { email, password });
  }

  // Items
  async getItem(id: string) {
    return this.client.request(operations.GET_ITEM, { id });
  }

  async getItems(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    tags?: string[];
  }) {
    return this.client.request(operations.GET_ITEMS, params);
  }

  async addItem(params: {
    name: string;
    notes?: string;
    tags?: string[];
    isStorage?: boolean;
    containerId?: string;
    customFields?: Array<{ name: string; type: string; value: string }>;
    isClassified?: boolean;
  }) {
    const { name, notes = '', tags = [], isStorage = false, containerId, customFields, isClassified = false } = params;
    return this.client.request(operations.ADD_ITEM, {
      name,
      notes,
      tags,
      isStorage,
      containerId,
      customFields,
      isClassified
    });
  }

  async updateItem(params: {
    id: string;
    name?: string;
    notes?: string;
    tags?: string[];
    isStorage?: boolean;
    containerId?: string;
    customFields?: Array<{ name: string; type: string; value: string }>;
    isClassified?: boolean;
    isFavorite?: boolean;
  }) {
    return this.client.request(operations.UPDATE_ITEM, params);
  }

  async deleteItem(id: string) {
    return this.client.request(operations.DISCARD_ITEM, { id });
  }

  async favoriteItem(itemId: string) {
    return this.client.request(operations.FAVORITE_ITEM, { itemId });
  }

  async unfavoriteItem(itemId: string) {
    return this.client.request(operations.UNFAVORITE_ITEM, { itemId });
  }

  async importFromUrl(url: string) {
    return this.client.request(operations.IMPORT_FROM_URL, { url });
  }

  // Collections
  async getCollections(includeDeleted = false) {
    return this.client.request(operations.GET_COLLECTIONS, { includeDeleted });
  }

  async getCollection(id: string) {
    return this.client.request(operations.GET_COLLECTION, { id });
  }

  async getCollectionItems(collectionId: string) {
    return this.client.request(operations.GET_COLLECTION_ITEMS, { collectionId });
  }

  async createCollection(input: {
    name: string;
    description?: string;
    coverImageUrl?: string;
    visibility?: 'PRIVATE' | 'SHARED';
  }) {
    return this.client.request(operations.CREATE_COLLECTION, { input });
  }

  async updateCollection(input: {
    id: string;
    name?: string;
    description?: string;
    coverImageUrl?: string;
    visibility?: 'PRIVATE' | 'SHARED';
  }) {
    return this.client.request(operations.UPDATE_COLLECTION, { input });
  }

  async deleteCollection(id: string) {
    return this.client.request(operations.DELETE_COLLECTION, { id });
  }

  async addItemsToCollection(collectionId: string, itemIds: string[]) {
    return this.client.request(operations.ADD_ITEMS_TO_COLLECTION, {
      input: { collectionId, itemIds }
    });
  }

  async removeItemsFromCollection(collectionId: string, itemIds: string[]) {
    return this.client.request(operations.REMOVE_ITEMS_FROM_COLLECTION, {
      input: { collectionId, itemIds }
    });
  }

  // Tags
  async getAllTags() {
    return this.client.request(operations.GET_ALL_TAGS);
  }

  async searchTags(query: string) {
    return this.client.request(operations.SEARCH_TAGS, { query });
  }

  async createTag(name: string) {
    return this.client.request(operations.CREATE_TAG, { name });
  }

  async renameTag(id: string, name: string) {
    return this.client.request(operations.RENAME_TAG, { id, name });
  }

  async deleteTag(id: string) {
    return this.client.request(operations.DELETE_TAG, { id });
  }

  // Images
  async uploadItemImage(itemId: string, imageData: string, fileName: string) {
    return this.client.request(operations.UPLOAD_ITEM_IMAGE, {
      itemId,
      imageData,
      fileName
    });
  }

  async removeItemImage(itemId: string, imageUrl: string) {
    return this.client.request(operations.REMOVE_ITEM_IMAGE, {
      itemId,
      imageUrl
    });
  }

  // Sharing
  async shareItem(itemId: string, targetUserId: string, permissionLevel: string, excludedItemIds?: string[]) {
    return this.client.request(operations.SHARE_ITEM, {
      itemId,
      targetUserId,
      permissionLevel,
      excludedItemIds
    });
  }

  async revokeAccess(itemId: string, targetUserId: string) {
    return this.client.request(operations.REVOKE_ACCESS, {
      itemId,
      targetUserId
    });
  }

  // Stats
  async getUserStats() {
    return this.client.request(operations.GET_USER_STATS);
  }

  // Added new methods for updated GraphQL operations

  async getUser(userId: string) {
    return this.client.request(operations.GET_USER, { userId });
  }

  async getNotifications(params?: { status?: string; limit?: number; offset?: number }) {
    return this.client.request(operations.GET_NOTIFICATIONS, params);
  }

  async createSubscription(input: {
    stripePriceId: string;
    tier: SubscriptionTier;
    paymentMethodId?: string;
    couponId?: string;
  }) {
    return this.client.request(operations.CREATE_SUBSCRIPTION, { input });
  }

  async getGroups() {
    return this.client.request(operations.GET_GROUPS);
  }

  async getSubscriptionDetails(countryCode: string, currencyCode: string) {
    return this.client.request(operations.GET_SUBSCRIPTION_DETAILS, { countryCode, currencyCode });
  }
}