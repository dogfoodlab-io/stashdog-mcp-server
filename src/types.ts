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

// GraphQL Response Types
export interface SignInResponse {
  signIn: {
    id: string;
    email: string;
    displayName: string;
    authToken: string;
  };
}

export interface GetItemsResponse {
  getItems: {
    items: Item[];
    totalCount: number;
    hasMore: boolean;
  };
}

export interface AddItemResponse {
  addItem: Item;
}

export interface UpdateItemResponse {
  updateItem: Item;
}

export interface DeleteItemResponse {
  discardItem: {
    success: boolean;
    message: string;
  };
}

export interface FavoriteItemResponse {
  favoriteItem: Item;
}

export interface UnfavoriteItemResponse {
  unfavoriteItem: Item;
}

export interface ImportFromUrlResponse {
  importFromUrl: {
    success: boolean;
    items: Item[];
    message: string;
  };
}

export interface GetCollectionsResponse {
  collections: Collection[];
}

export interface CreateCollectionResponse {
  createCollection: Collection;
}

export interface UpdateCollectionResponse {
  updateCollection: Collection;
}

export interface DeleteCollectionResponse {
  deleteCollection: {
    success: boolean;
    message: string;
  };
}

export interface AddItemsToCollectionResponse {
  addItemsToCollection: {
    success: boolean;
    message: string;
    collection: Collection;
  };
}

export interface RemoveItemsFromCollectionResponse {
  removeItemsFromCollection: {
    success: boolean;
    message: string;
    collection: Collection;
  };
}

export interface GetAllTagsResponse {
  allTags: Tag[];
}

export interface SearchTagsResponse {
  searchTags: Tag[];
}

export interface CreateTagResponse {
  createTag: Tag;
}

export interface RenameTagResponse {
  renameTag: Tag;
}

export interface DeleteTagResponse {
  deleteTag: {
    success: boolean;
    message: string;
  };
}

export interface GetUserStatsResponse {
  getUserStats: UserStats;
}

// Added new TypeScript interfaces for updated schema
export interface UserType {
  id: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt: string;
  lastSignIn?: string;
  pushTokens: string[];
  subscriptionTier: SubscriptionTier;
  isPremium: boolean;
  subscriptionId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  metadata?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  organizationId?: string;
  maxMembers: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  memberCount: number;
  isOwner: boolean;
  userRole: string;
}

export interface SubscriptionDetailsWithPricing {
  subscription: SubscriptionType;
  plan: SubscriptionPlanType;
  pricing: SubscriptionPricingType;
}

export interface SubscriptionType {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isActive: boolean;
  isPremium: boolean;
}

export interface SubscriptionPlanType {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
}

export interface SubscriptionPricingType {
  basePrice: number;
  finalPrice: number;
  promotionalDiscount: number;
  promotionName?: string;
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum NotificationType {
  SHARE_INVITATION_CREATED = 'SHARE_INVITATION_CREATED',
  SHARE_INVITATION_ACCEPTED = 'SHARE_INVITATION_ACCEPTED',
  SHARE_INVITATION_DECLINED = 'SHARE_INVITATION_DECLINED',
  SHARE_REVOKED = 'SHARE_REVOKED',
  ITEM_SHARED = 'ITEM_SHARED',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

export enum BillingInterval {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum SubscriptionStatus {
  INCOMPLETE = 'INCOMPLETE',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
}

// Added missing exports for response types
export interface GetUserResponse {
  getUser: UserType;
}

export interface ManageUsersResponse {
  users: UserType[];
}

export interface ManageNotificationsResponse {
  notifications: Notification[];
}

export interface ManageGroupsResponse {
  groups: Group[];
}

export interface ManageSubscriptionsResponse {
  subscriptionDetails: SubscriptionDetailsWithPricing;
}