import { gql } from 'graphql-request';

// Queries
export const GET_ITEM = gql`
  query GetItem($id: String!) {
    getItem(id: $id) {
      id
      name
      notes
      tags
      isStorage
      isClassified
      isFavorited
      containerId
      container {
        id
        name
        isStorage
      }
      containedItems {
        id
        name
        notes
        isStorage
        isClassified
        isFavorited
      }
      images {
        id
        url
        path
        createdAt
        lastModified
      }
      customFields {
        name
        type
        value
      }
      permissions {
        id
        userId
        permissionLevel
      }
    }
  }
`;

export const GET_ITEMS = gql`
  query GetItems($limit: Int, $offset: Int, $search: String, $tags: [String!]) {
    getItems(limit: $limit, offset: $offset, search: $search, tags: $tags) {
      items {
        id
        name
        notes
        tags
        isStorage
        isFavorited
        images {
          id
          url
          path
        }
        customFields {
          name
          type
          value
        }
      }
      totalCount
    }
  }
`;

export const GET_COLLECTIONS = gql`
  query GetCollections($includeDeleted: Boolean) {
    collections(includeDeleted: $includeDeleted) {
      id
      name
      description
      coverImageUrl
      visibility
      userId
      createdAt
      updatedAt
    }
  }
`;

export const GET_COLLECTION = gql`
  query GetCollection($id: ID!) {
    collection(id: $id) {
      id
      name
      description
      coverImageUrl
      visibility
      userId
      createdAt
      updatedAt
    }
  }
`;

export const GET_COLLECTION_ITEMS = gql`
  query GetCollectionItems($collectionId: ID!) {
    collectionItems(collectionId: $collectionId) {
      id
      collectionId
      itemId
      position
      addedAt
      addedBy
      item {
        id
        name
        notes
        tags
        isStorage
        images {
          id
          url
          path
        }
      }
    }
  }
`;

export const GET_ALL_TAGS = gql`
  query GetAllTags {
    getAllTags {
      id
      name
      usageCount
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_TAGS = gql`
  query SearchTags($query: String!) {
    searchTags(query: $query) {
      id
      name
      usageCount
    }
  }
`;

export const GET_USER_STATS = gql`
  query GetUserStats {
    getUserStats {
      itemsCount
      collectionsCount
      tagsCount
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: String!) {
    getUser(userId: $userId) {
      id
      email
      displayName
      isAdmin
      createdAt
      lastSignIn
      pushTokens
      subscriptionTier
      isPremium
      subscriptionId
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetUserNotifications($status: String, $limit: Float, $offset: Float) {
    getUserNotifications(status: $status, limit: $limit, offset: $offset) {
      id
      userId
      type
      title
      message
      entityId
      entityType
      status
      createdAt
      updatedAt
      isDeleted
      metadata
    }
  }
`;

export const GET_GROUPS = gql`
  query MyGroups {
    myGroups {
      id
      name
      description
      ownerId
      organizationId
      maxMembers
      avatarUrl
      createdAt
      updatedAt
      deletedAt
      memberCount
      isOwner
      userRole
    }
  }
`;

export const GET_SUBSCRIPTION_DETAILS = gql`
  query GetSubscriptionDetailsWithPricing($countryCode: String!, $currencyCode: String!) {
    getSubscriptionDetailsWithPricing(countryCode: $countryCode, currencyCode: $currencyCode) {
      subscription {
        id
        tier
        status
        isActive
        isPremium
      }
      plan {
        id
        name
        price
        currency
        interval
        features
      }
      pricing {
        basePrice
        finalPrice
        promotionalDiscount
        promotionName
      }
    }
  }
`;

// Mutations
export const ADD_ITEM = gql`
  mutation AddItem(
    $name: String!
    $notes: String!
    $tags: [String!]!
    $isStorage: Boolean!
    $containerId: String
    $customFields: [CustomFieldInput!]
    $isClassified: Boolean
  ) {
    addItem(
      name: $name
      notes: $notes
      tags: $tags
      isStorage: $isStorage
      containerId: $containerId
      customFields: $customFields
      isClassified: $isClassified
    ) {
      id
      uploadUrls
      uploadPaths
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem(
    $id: String!
    $name: String
    $notes: String
    $tags: [String!]
    $isStorage: Boolean
    $containerId: String
    $customFields: [CustomFieldInput!]
    $isClassified: Boolean
    $isFavorite: Boolean
  ) {
    updateItem(
      id: $id
      name: $name
      notes: $notes
      tags: $tags
      isStorage: $isStorage
      containerId: $containerId
      customFields: $customFields
      isClassified: $isClassified
      isFavorite: $isFavorite
    ) {
      id
      name {
        success
        error
      }
      notes {
        success
        error
      }
      tags {
        success
        error
      }
      isStorage {
        success
        error
      }
      containerId {
        success
        error
      }
      customFields {
        success
        error
      }
      isClassified {
        success
        error
      }
      isFavorite {
        success
        error
      }
    }
  }
`;

export const DISCARD_ITEM = gql`
  mutation DiscardItem($id: String!) {
    discardItem(id: $id)
  }
`;

export const IMPORT_FROM_URL = gql`
  mutation ImportFromUrl($url: String!) {
    importFromUrl(url: $url) {
      id
      uploadUrls
      uploadPaths
    }
  }
`;

export const FAVORITE_ITEM = gql`
  mutation FavoriteItem($itemId: String!) {
    favoriteItem(itemId: $itemId)
  }
`;

export const UNFAVORITE_ITEM = gql`
  mutation UnfavoriteItem($itemId: String!) {
    unfavoriteItem(itemId: $itemId)
  }
`;

// Collection mutations
export const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
      description
      coverImageUrl
      visibility
      userId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COLLECTION = gql`
  mutation UpdateCollection($input: UpdateCollectionInput!) {
    updateCollection(input: $input) {
      id
      name
      description
      coverImageUrl
      visibility
      userId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id)
  }
`;

export const ADD_ITEMS_TO_COLLECTION = gql`
  mutation AddItemsToCollection($input: AddItemsToCollectionInput!) {
    addItemsToCollection(input: $input)
  }
`;

export const REMOVE_ITEMS_FROM_COLLECTION = gql`
  mutation RemoveItemsFromCollection($input: RemoveItemsFromCollectionInput!) {
    removeItemsFromCollection(input: $input)
  }
`;

// Tag mutations
export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name)
  }
`;

export const RENAME_TAG = gql`
  mutation RenameTag($id: ID!, $name: String!) {
    renameTag(id: $id, name: $name)
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

// Image mutations
export const UPLOAD_ITEM_IMAGE = gql`
  mutation UploadItemImage(
    $itemId: String!
    $imageData: String!
    $fileName: String!
  ) {
    uploadItemImage(
      itemId: $itemId
      imageData: $imageData
      fileName: $fileName
    ) {
      success
      imageUrl
      imagePath
    }
  }
`;

export const REMOVE_ITEM_IMAGE = gql`
  mutation RemoveItemImage($itemId: String!, $imageUrl: String!) {
    removeItemImage(itemId: $itemId, imageUrl: $imageUrl) {
      success
      message
    }
  }
`;

// Sharing mutations
export const SHARE_ITEM = gql`
  mutation ShareItem(
    $itemId: String!
    $targetUserId: String!
    $permissionLevel: String!
    $excludedItemIds: [String!]
  ) {
    shareItem(
      itemId: $itemId
      targetUserId: $targetUserId
      permissionLevel: $permissionLevel
      excludedItemIds: $excludedItemIds
    ) {
      id
      itemId
      userId
      permissionLevel
      createdAt
      updatedAt
    }
  }
`;

export const REVOKE_ACCESS = gql`
  mutation RevokeAccess($itemId: String!, $targetUserId: String!) {
    revokeAccess(itemId: $itemId, targetUserId: $targetUserId)
  }
`;

// Authentication
export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      id
      email
      authToken
      displayName
    }
  }
`;

// New mutations for updated schema
export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) {
      id
      userId
      stripeCustomerId
      stripeSubscriptionId
      stripePriceId
      status
      tier
      currentPeriodStart
      currentPeriodEnd
      isActive
      isPremium
    }
  }
`;