import {
  ActionResponse,
  CollectionsResponse,
  ImportFromUrlResponse,
  Item,
  ItemsResponse,
  ManageGroupsResponse,
  ManageNotificationsResponse,
  SignInResponse,
  StashDogConfig,
  Tag,
  TagsResponse,
  UserType,
} from './types.js';

export class StashDogClient {
  private config: StashDogConfig;
  private restBaseUrl: string;
  private graphqlUrl: string;
  private authUrl: string;
  private functionsUrl: string;

  constructor(config: StashDogConfig) {
    this.config = config;
    const trimmedBase = config.supabaseUrl.replace(/\/+$/, '');
    this.restBaseUrl = `${trimmedBase}/rest/v1`;
    this.graphqlUrl = `${trimmedBase}/graphql/v1`;
    this.authUrl = `${trimmedBase}/auth/v1`;
    this.functionsUrl = `${trimmedBase}/functions/v1`;
  }

  setAuthToken(token: string) {
    this.config.authToken = token;
  }

  clearAuthToken() {
    this.config.authToken = undefined;
  }

  private buildHeaders(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extra
    };

    if (this.config.authToken) {
      headers.Authorization = `Bearer ${this.config.authToken}`;
    }

    if (this.config.anonKey) {
      headers.apikey = this.config.anonKey;
    }

    return headers;
  }

  private decodeUserIdFromToken() {
    if (!this.config.authToken) {
      return undefined;
    }

    const parts = this.config.authToken.split('.');
    if (parts.length !== 3) {
      return undefined;
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { sub?: string };
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  private async requestJson<T>(url: string, options: RequestInit) {
    const response = await fetch(url, options);
    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message = data?.message || data?.error_description || data?.error || response.statusText;
      throw new Error(message);
    }

    return { data: data as T, response };
  }

  private mapItem(record: any): Item {
    return {
      id: record.id,
      name: record.name,
      notes: record.description ?? undefined,
      tags: record.tags ?? [],
      isStorage: record.isStorage ?? false,
      isClassified: record.isClassified ?? false,
      isFavorited: record.isFavorited ?? false,
      containerId: record.containerId ?? undefined,
      container: undefined,
      containedItems: [],
      images: record.images ?? [],
      customFields: record.customFields ?? [],
      permissions: []
    };
  }

  private mapCollection(record: any) {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      coverImageUrl: record.cover_image_url ?? undefined,
      visibility: (record.visibility || 'private').toUpperCase(),
      userId: record.user_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }

  private mapTag(record: any): Tag {
    return {
      id: record.id,
      name: record.name,
      usageCount: record.usageCount ?? record.usage_count ?? 0,
      createdAt: record.createdAt ?? record.created_at ?? '',
      updatedAt: record.updatedAt ?? record.updated_at ?? ''
    };
  }

  // Authentication
  async signIn(email: string, password: string) {
    const url = `${this.functionsUrl}/login_with_userpass`;
    const { data } = await this.requestJson<any>(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ email, password })
    });

    return {
      user: {
        id: data.user?.id || data.userId,
        email: data.user?.email || data.email,
        displayName: data.user?.displayName || data.displayName
      },
      accessToken: data.accessToken || data.access_token
    } as SignInResponse;
  }

  // Items
  async getItem(id: string) {
    const url = new URL(`${this.restBaseUrl}/items`);
    url.searchParams.set('select', 'id,name,description,tags,isStorage,isClassified,isFavorited,containerId,customFields,images');
    url.searchParams.set('id', `eq.${id}`);

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return data[0] ? this.mapItem(data[0]) : null;
  }

  async getItems(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    tags?: string[];
  }) {
    const url = new URL(`${this.restBaseUrl}/items`);
    url.searchParams.set('select', 'id,name,description,tags,isStorage,isClassified,isFavorited,containerId,customFields,images');
    url.searchParams.set('order', 'createdAt.desc');

    if (params?.search) {
      const query = params.search.trim();
      if (query.length > 0) {
        url.searchParams.set('or', `(name.ilike.*${query}*,description.ilike.*${query}*)`);
      }
    }

    if (params?.tags && params.tags.length > 0) {
      url.searchParams.set('tags', `cs.{${params.tags.join(',')}}`);
    }

    if (typeof params?.limit === 'number') {
      url.searchParams.set('limit', String(params.limit));
    }

    if (typeof params?.offset === 'number') {
      url.searchParams.set('offset', String(params.offset));
    }

    const headers = this.buildHeaders({ Prefer: 'count=exact' });
    
    const { data, response } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: headers
    });

    const contentRange = response.headers.get('content-range') || '';
    const totalCountMatch = contentRange.match(/\/(\d+)$/);
    const totalCount = totalCountMatch ? Number(totalCountMatch[1]) : data.length;

    return {
      items: data.map((record) => this.mapItem(record)),
      totalCount
    } as ItemsResponse;
  }

  async searchItems(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    tags?: string[];
  }) {
    const url = `${this.functionsUrl}/search-items`;
    
    const body: Record<string, any> = {};
    if (params?.search) {
      body.query = params.search;
    }
    if (params?.tags && params.tags.length > 0) {
      body.tags = params.tags;
    }
    if (typeof params?.limit === 'number') {
      body.limit = params.limit;
    }
    if (typeof params?.offset === 'number') {
      body.offset = params.offset;
    }

    const { data } = await this.requestJson<any>(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body)
    });

    return {
      items: (data.items || []).map((record: any) => this.mapItem(record)),
      totalCount: data.totalCount || data.items?.length || 0
    } as ItemsResponse;
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
    const url = `${this.restBaseUrl}/items`;
    const body = {
      name,
      description: notes,
      tags,
      isStorage,
      containerId,
      customFields,
      isClassified
    };

    const { data } = await this.requestJson<any[]>(url, {
      method: 'POST',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body)
    });

    return data[0] ? this.mapItem(data[0]) : null;
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
    const { id, name, notes, tags, isStorage, containerId, customFields, isClassified, isFavorite } = params;
    const url = new URL(`${this.restBaseUrl}/items`);
    url.searchParams.set('id', `eq.${id}`);

    const body: Record<string, any> = {};
    if (typeof name !== 'undefined') body.name = name;
    if (typeof notes !== 'undefined') body.description = notes;
    if (typeof tags !== 'undefined') body.tags = tags;
    if (typeof isStorage !== 'undefined') body.isStorage = isStorage;
    if (typeof containerId !== 'undefined') body.containerId = containerId;
    if (typeof customFields !== 'undefined') body.customFields = customFields;
    if (typeof isClassified !== 'undefined') body.isClassified = isClassified;
    if (typeof isFavorite !== 'undefined') body.isFavorited = isFavorite;

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'PATCH',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body)
    });

    return data[0] ? this.mapItem(data[0]) : null;
  }

  async deleteItem(id: string) {
    const url = new URL(`${this.restBaseUrl}/items`);
    url.searchParams.set('id', `eq.${id}`);

    await this.requestJson(url.toString(), {
      method: 'PATCH',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({ isDeleted: true })
    });

    return { success: true } as ActionResponse;
  }

  async favoriteItem(itemId: string) {
    return this.updateItem({ id: itemId, isFavorite: true });
  }

  async unfavoriteItem(itemId: string) {
    return this.updateItem({ id: itemId, isFavorite: false });
  }

  async importFromUrl(url: string) {
    const endpoint = `${this.functionsUrl}/import-from-url`;
    const { data } = await this.requestJson<ImportFromUrlResponse>(endpoint, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ url })
    });

    return data;
  }

  // Collections
  async getCollections(includeDeleted = false) {
    const url = new URL(`${this.restBaseUrl}/collections`);
    url.searchParams.set('select', 'id,name,description,cover_image_url,visibility,user_id,created_at,updated_at,deleted_at');
    url.searchParams.set('order', 'created_at.desc');

    if (!includeDeleted) {
      url.searchParams.set('deleted_at', 'is.null');
    }

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return {
      collections: data.map((record) => this.mapCollection(record))
    } as CollectionsResponse;
  }

  async getCollection(id: string) {
    const url = new URL(`${this.restBaseUrl}/collections`);
    url.searchParams.set('select', 'id,name,description,cover_image_url,visibility,user_id,created_at,updated_at,deleted_at');
    url.searchParams.set('id', `eq.${id}`);

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return data[0] ? this.mapCollection(data[0]) : null;
  }

  async getCollectionItems(collectionId: string) {
    const url = new URL(`${this.restBaseUrl}/collection_items`);
    url.searchParams.set('select', 'id,collection_id,item_id,position,added_at,added_by,item:items(id,name,description,tags,isStorage,isClassified,isFavorited,containerId,customFields,images)');
    url.searchParams.set('collection_id', `eq.${collectionId}`);

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return data.map((record) => ({
      id: record.id,
      collectionId: record.collection_id,
      itemId: record.item_id,
      position: record.position,
      addedAt: record.added_at,
      addedBy: record.added_by,
      item: record.item ? this.mapItem(record.item) : null
    }));
  }

  async createCollection(input: {
    name: string;
    description?: string;
    coverImageUrl?: string;
    visibility?: 'PRIVATE' | 'SHARED';
  }) {
    const url = `${this.restBaseUrl}/collections`;
    const userId = this.decodeUserIdFromToken();
    const body = {
      name: input.name,
      description: input.description,
      cover_image_url: input.coverImageUrl,
      visibility: input.visibility ? input.visibility.toLowerCase() : 'private',
      user_id: userId
    };

    const { data } = await this.requestJson<any[]>(url, {
      method: 'POST',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body)
    });

    return data[0] ? this.mapCollection(data[0]) : null;
  }

  async updateCollection(input: {
    id: string;
    name?: string;
    description?: string;
    coverImageUrl?: string;
    visibility?: 'PRIVATE' | 'SHARED';
  }) {
    const url = new URL(`${this.restBaseUrl}/collections`);
    url.searchParams.set('id', `eq.${input.id}`);

    const body: Record<string, any> = {};
    if (typeof input.name !== 'undefined') body.name = input.name;
    if (typeof input.description !== 'undefined') body.description = input.description;
    if (typeof input.coverImageUrl !== 'undefined') body.cover_image_url = input.coverImageUrl;
    if (typeof input.visibility !== 'undefined') body.visibility = input.visibility.toLowerCase();

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'PATCH',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body)
    });

    return data[0] ? this.mapCollection(data[0]) : null;
  }

  async deleteCollection(id: string) {
    const url = new URL(`${this.restBaseUrl}/collections`);
    url.searchParams.set('id', `eq.${id}`);

    await this.requestJson(url.toString(), {
      method: 'PATCH',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({ deleted_at: new Date().toISOString() })
    });

    return { success: true } as ActionResponse;
  }

  async addItemsToCollection(collectionId: string, itemIds: string[]) {
    const url = `${this.restBaseUrl}/collection_items`;
    const addedBy = this.decodeUserIdFromToken();

    const body = itemIds.map((itemId, index) => ({
      collection_id: collectionId,
      item_id: itemId,
      position: index,
      added_by: addedBy
    }));

    await this.requestJson(url, {
      method: 'POST',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body)
    });

    return { success: true } as ActionResponse;
  }

  async removeItemsFromCollection(collectionId: string, itemIds: string[]) {
    const url = new URL(`${this.restBaseUrl}/collection_items`);
    url.searchParams.set('collection_id', `eq.${collectionId}`);
    url.searchParams.set('item_id', `in.(${itemIds.join(',')})`);

    await this.requestJson(url.toString(), {
      method: 'DELETE',
      headers: this.buildHeaders()
    });

    return { success: true } as ActionResponse;
  }

  // Tags
  async getAllTags() {
    const url = new URL(`${this.restBaseUrl}/tags`);
    url.searchParams.set('select', 'id,name,usageCount,createdAt,updatedAt');
    url.searchParams.set('order', 'usageCount.desc');

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return { tags: data.map((record) => this.mapTag(record)) } as TagsResponse;
  }

  async searchTags(query: string) {
    const url = new URL(`${this.restBaseUrl}/tags`);
    url.searchParams.set('select', 'id,name,usageCount,createdAt,updatedAt');
    url.searchParams.set('name', `ilike.*${query}*`);
    url.searchParams.set('order', 'usageCount.desc');

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return { tags: data.map((record) => this.mapTag(record)) } as TagsResponse;
  }

  async createTag(name: string) {
    const url = `${this.restBaseUrl}/tags`;
    const userId = this.decodeUserIdFromToken();

    const { data } = await this.requestJson<any[]>(url, {
      method: 'POST',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({ name, userId })
    });

    return data[0] ? this.mapTag(data[0]) : null;
  }

  async renameTag(id: string, name: string) {
    const url = new URL(`${this.restBaseUrl}/tags`);
    url.searchParams.set('id', `eq.${id}`);

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'PATCH',
      headers: this.buildHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify({ name })
    });

    return data[0] ? this.mapTag(data[0]) : null;
  }

  async deleteTag(id: string) {
    const url = new URL(`${this.restBaseUrl}/tags`);
    url.searchParams.set('id', `eq.${id}`);

    await this.requestJson(url.toString(), {
      method: 'DELETE',
      headers: this.buildHeaders()
    });

    return { success: true } as ActionResponse;
  }

  // Stats
  async getUsageMetrics() {
    const url = new URL(`${this.restBaseUrl}/user_usage_stats_read_model`);
    url.searchParams.set('select', 'item_count,collection_count,storage_used,shared_item_count');

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return data[0] || null;
  }

  async getUser(userId: string) {
    const url = new URL(`${this.restBaseUrl}/users_read_model`);
    url.searchParams.set('select', 'id,email,displayName,createdAt,lastLoginAt,push_tokens');
    url.searchParams.set('id', `eq.${userId}`);

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    const record = data[0];
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      email: record.email,
      displayName: record.displayName ?? record.display_name ?? undefined,
      isAdmin: false,
      createdAt: record.createdAt ?? record.created_at,
      lastSignIn: record.lastLoginAt ?? record.last_login_at,
      pushTokens: record.push_tokens ?? [],
      subscriptionTier: 'FREE',
      isPremium: false,
      subscriptionId: undefined
    } as UserType;
  }

  async getNotifications(params?: { status?: string; limit?: number; offset?: number }) {
    const url = new URL(`${this.restBaseUrl}/notifications`);
    url.searchParams.set('select', 'id,user_id,type,title,message,entity_id,entity_type,status,created_at,updated_at,is_deleted,metadata');
    url.searchParams.set('order', 'created_at.desc');

    if (params?.status) {
      url.searchParams.set('status', `eq.${params.status}`);
    }

    if (typeof params?.limit === 'number') {
      url.searchParams.set('limit', String(params.limit));
    }

    if (typeof params?.offset === 'number') {
      url.searchParams.set('offset', String(params.offset));
    }

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return {
      notifications: data.map((record) => ({
        id: record.id,
        userId: record.user_id,
        type: record.type,
        title: record.title,
        message: record.message,
        entityId: record.entity_id ?? undefined,
        entityType: record.entity_type ?? undefined,
        status: record.status,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        isDeleted: record.is_deleted,
        metadata: record.metadata ? JSON.stringify(record.metadata) : undefined
      }))
    } as ManageNotificationsResponse;
  }

  async getGroups() {
    const url = new URL(`${this.restBaseUrl}/groups`);
    url.searchParams.set('select', 'id,name,description,owner_id,organization_id,max_members,avatar_url,created_at,updated_at,deleted_at');
    url.searchParams.set('order', 'created_at.desc');

    const { data } = await this.requestJson<any[]>(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders()
    });

    return {
      groups: data.map((record) => ({
        id: record.id,
        name: record.name,
        description: record.description ?? undefined,
        ownerId: record.owner_id,
        organizationId: record.organization_id ?? undefined,
        maxMembers: record.max_members,
        avatarUrl: record.avatar_url ?? undefined,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        deletedAt: record.deleted_at ?? undefined,
        memberCount: 0,
        isOwner: false,
        userRole: ''
      }))
    } as ManageGroupsResponse;
  }
}