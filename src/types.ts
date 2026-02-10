export interface StashDogConfig {
  supabaseUrl: string;
  authToken?: string;
  anonKey?: string;
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
export interface SearchFilters {
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
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
export interface SignInResponse {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
  accessToken: string;
}

export interface ItemsResponse {
  items: Item[];
  totalCount: number;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
}

export interface ImportFromUrlResponse {
  success: boolean;
  items?: Item[];
  message?: string;
}

export interface CollectionsResponse {
  collections: Collection[];
}

export interface TagsResponse {
  tags: Tag[];
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

export interface GetUserResponse {
  user: UserType;
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