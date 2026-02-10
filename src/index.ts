#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { StashDogClient } from './client.js';
import { 
  parseItemRequest, 
  parseCollectionRequest, 
  extractUrls,
  generateResponseMessage,
  formatItemsForDisplay,
  formatCollectionsForDisplay
} from './nlp-utils.js';
import { 
  AIResponse,
  CollectionsResponse,
  ImportFromUrlResponse,
  ItemsResponse,
  NotificationStatus,
  SignInResponse,
  TagsResponse,
  UserType,
  ManageNotificationsResponse,
  ManageGroupsResponse
} from './types.js';

// Load environment variables
dotenv.config();

const server = new Server(
  {
    name: 'stashdog-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize StashDog client
const SUPABASE_URL = process.env.STASHDOG_SUPABASE_URL || process.env.STASHDOG_API_URL || 'http://localhost:54321';
const AUTH_TOKEN = process.env.STASHDOG_AUTH_TOKEN;
const SUPABASE_ANON_KEY = process.env.STASHDOG_SUPABASE_ANON_KEY;

const client = new StashDogClient({
  supabaseUrl: SUPABASE_URL,
  authToken: AUTH_TOKEN,
  anonKey: SUPABASE_ANON_KEY
});

// Tool definitions
const tools = [
  {
    name: 'manage_inventory_items',
    description: 'Add, update, search, delete, or manage inventory items using natural language instructions. Supports complex operations like adding items with tags, notes, custom fields, and organizing them in containers.',
    inputSchema: {
      type: 'object',
      properties: {
        instruction: {
          type: 'string',
          description: 'Natural language instruction for the item operation. Examples: "Add a new laptop with tags electronics, work", "Search for items tagged with kitchen", "Update item abc123 to add note about warranty", "Delete item xyz789"'
        }
      },
      required: ['instruction']
    }
  },
  {
    name: 'manage_collections',
    description: 'Create, update, delete collections or manage items within collections using natural language instructions.',
    inputSchema: {
      type: 'object',
      properties: {
        instruction: {
          type: 'string',
          description: 'Natural language instruction for collection operations. Examples: "Create a new collection called Kitchen Appliances", "Add items abc123, def456 to collection xyz789", "Delete collection old-stuff"'
        }
      },
      required: ['instruction']
    }
  },
  {
    name: 'import_from_url',
    description: 'Import items from URLs (e.g., product pages, images) into the inventory.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to import from (product pages, images, etc.)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'manage_tags',
    description: 'Create, search, rename, or delete tags using natural language instructions.',
    inputSchema: {
      type: 'object',
      properties: {
        instruction: {
          type: 'string',
          description: 'Natural language instruction for tag operations. Examples: "Create tag electronics", "Search for tags containing kitchen", "Rename tag old-name to new-name", "Delete tag unused-tag"'
        }
      },
      required: ['instruction']
    }
  },
  {
    name: 'get_inventory_stats',
    description: 'Get statistics about your inventory including item count, collection count, and tag count.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'authenticate',
    description: 'Authenticate with StashDog using email and password.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address'
        },
        password: {
          type: 'string',
          description: 'Password'
        }
      },
      required: ['email', 'password']
    }
  },
  {
    name: 'smart_search',
    description: 'Perform intelligent searches across your inventory with natural language queries that can include multiple criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query. Examples: "Show me all electronics in the office", "Find kitchen items that are favorited", "List storage containers with more than 5 items"'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'manage_users',
    description: 'Manage users including fetching user details.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user to fetch details for.'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'manage_notifications',
    description: 'Fetch user notifications.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter notifications by status (e.g., UNREAD, READ).'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of notifications to fetch.'
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination.'
        }
      },
      required: []
    }
  },
  {
    name: 'manage_groups',
    description: 'Fetch user groups.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'manage_subscriptions',
    description: 'Manage subscriptions including fetching details and creating subscriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'Country code for subscription pricing.'
        },
        currencyCode: {
          type: 'string',
          description: 'Currency code for subscription pricing.'
        }
      },
      required: ['countryCode', 'currencyCode']
    }
  }
];

// Helper function to create AI response
function createAIResponse(success: boolean, message: string, data?: any, error?: string): AIResponse {
  return { success, message, data, error };
}

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'authenticate': {
        const { email, password } = args as { email: string; password: string };
        
        try {
          const result = await client.signIn(email, password) as SignInResponse;
          if (result.accessToken) {
            client.setAuthToken(result.accessToken);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(createAIResponse(true, `Successfully authenticated as ${result.user.email}`, {
                    userId: result.user.id,
                    email: result.user.email,
                    displayName: result.user.displayName
                  }))
                }
              ]
            };
          } else {
            throw new Error('Authentication failed - no token received');
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, 'Authentication failed', null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'manage_inventory_items': {
        const { instruction } = args as { instruction: string };
        const parsed = parseItemRequest(instruction);

        try {
          let result: any;
          let operation = '';

          switch (parsed.action) {
            case 'add':
              if (!parsed.itemName) {
                throw new Error('Item name is required for adding items');
              }
              
              result = await client.addItem({
                name: parsed.itemName,
                notes: parsed.notes,
                tags: parsed.tags || [],
                isStorage: parsed.isStorage || false,
                containerId: parsed.containerId,
                customFields: parsed.customFields,
                isClassified: false
              });
              operation = 'add_item';
              break;

            case 'update':
              if (!parsed.itemId) {
                throw new Error('Item ID is required for updating items');
              }
              
              result = await client.updateItem({
                id: parsed.itemId,
                name: parsed.itemName,
                notes: parsed.notes,
                tags: parsed.tags,
                isStorage: parsed.isStorage,
                containerId: parsed.containerId,
                customFields: parsed.customFields
              });
              operation = 'update_item';
              break;

            case 'delete':
              if (!parsed.itemId) {
                throw new Error('Item ID is required for deleting items');
              }
              
              result = await client.deleteItem(parsed.itemId);
              operation = 'delete_item';
              break;

            case 'favorite':
              if (!parsed.itemId) {
                throw new Error('Item ID is required for favoriting items');
              }
              
              result = await client.favoriteItem(parsed.itemId);
              operation = 'favorite_item';
              break;

            case 'unfavorite':
              if (!parsed.itemId) {
                throw new Error('Item ID is required for unfavoriting items');
              }
              
              result = await client.unfavoriteItem(parsed.itemId);
              operation = 'unfavorite_item';
              break;

            case 'search':
            default:
              result = await client.getItems({
                search: parsed.searchQuery,
                tags: parsed.filters?.tags,
                limit: parsed.filters?.limit || 20,
                offset: parsed.filters?.offset || 0
              }) as ItemsResponse;
              operation = 'search_items';
              break;
          }

          const message = generateResponseMessage(operation, true, result);
          let displayData = result;

          if (operation === 'search_items' && result.items) {
            displayData = {
              ...result,
              formattedItems: formatItemsForDisplay(result.items)
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, displayData))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage(parsed.action, false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'manage_collections': {
        const { instruction } = args as { instruction: string };
        const parsed = parseCollectionRequest(instruction);

        try {
          let result: any;
          let operation = '';

          switch (parsed.action) {
            case 'create':
              if (!parsed.collectionName) {
                throw new Error('Collection name is required for creating collections');
              }
              
              result = await client.createCollection({
                name: parsed.collectionName,
                description: parsed.description,
                visibility: parsed.visibility || 'PRIVATE'
              });
              operation = 'create_collection';
              break;

            case 'update':
              if (!parsed.collectionId) {
                throw new Error('Collection ID is required for updating collections');
              }
              
              result = await client.updateCollection({
                id: parsed.collectionId,
                name: parsed.collectionName,
                description: parsed.description,
                visibility: parsed.visibility
              });
              operation = 'update_collection';
              break;

            case 'delete':
              if (!parsed.collectionId) {
                throw new Error('Collection ID is required for deleting collections');
              }
              
              result = await client.deleteCollection(parsed.collectionId);
              operation = 'delete_collection';
              break;

            case 'add_items':
              if (!parsed.collectionId || !parsed.itemIds || parsed.itemIds.length === 0) {
                throw new Error('Collection ID and item IDs are required for adding items to collections');
              }
              
              result = await client.addItemsToCollection(parsed.collectionId, parsed.itemIds);
              operation = 'add_to_collection';
              break;

            case 'remove_items':
              if (!parsed.collectionId || !parsed.itemIds || parsed.itemIds.length === 0) {
                throw new Error('Collection ID and item IDs are required for removing items from collections');
              }
              
              result = await client.removeItemsFromCollection(parsed.collectionId, parsed.itemIds);
              operation = 'remove_from_collection';
              break;

            default:
              // List collections
                result = await client.getCollections() as CollectionsResponse;
              operation = 'list_collections';
              break;
          }

          const message = generateResponseMessage(operation, true, result);
          let displayData = result;

          if (operation === 'list_collections' && result.collections) {
            displayData = {
              collections: result.collections,
              formattedCollections: formatCollectionsForDisplay(result.collections)
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, displayData))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage(parsed.action, false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'import_from_url': {
        const { url } = args as { url: string };

        try {
          const result = await client.importFromUrl(url) as ImportFromUrlResponse;
          const message = generateResponseMessage('import_from_url', true, result);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, result))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('import_from_url', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'manage_tags': {
        const { instruction } = args as { instruction: string };
        const lower = instruction.toLowerCase();

        try {
          let result: any;
          let operation = '';

          if (lower.includes('create') || lower.includes('add')) {
            const nameMatch = /(?:create|add)\s+tag\s+(.+)$/i.exec(instruction);
            if (!nameMatch || !nameMatch[1]) {
              throw new Error('Tag name is required for creating tags');
            }
            
            result = await client.createTag(nameMatch[1].trim());
            operation = 'create_tag';
          } else if (lower.includes('search') || lower.includes('find')) {
            const queryMatch = /(?:search|find)\s+(.+)$/i.exec(instruction);
            const query = queryMatch ? queryMatch[1] : '';
            
            result = await client.searchTags(query) as TagsResponse;
            operation = 'search_tags';
          } else if (lower.includes('rename')) {
            const renameMatch = /rename\s+tag\s+([a-f0-9-]+)\s+to\s+(.+)$/i.exec(instruction);
            if (!renameMatch || !renameMatch[1] || !renameMatch[2]) {
              throw new Error('Tag ID and new name are required for renaming tags');
            }
            
            result = await client.renameTag(renameMatch[1], renameMatch[2].trim());
            operation = 'rename_tag';
          } else if (lower.includes('delete') || lower.includes('remove')) {
            const idMatch = /(?:delete|remove)\s+tag\s+([a-f0-9-]+)$/i.exec(instruction);
            if (!idMatch || !idMatch[1]) {
              throw new Error('Tag ID is required for deleting tags');
            }
            
            result = await client.deleteTag(idMatch[1]);
            operation = 'delete_tag';
          } else {
            // List all tags
            result = await client.getAllTags() as TagsResponse;
            operation = 'list_tags';
          }

          const message = generateResponseMessage(operation, true, result);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, result))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('manage_tags', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'get_inventory_stats': {
        try {
          const result = await client.getUsageMetrics() as {
            item_count: number;
            collection_count: number;
            storage_used: number;
            shared_item_count: number;
          };
          const message = `📊 Inventory Stats: ${result.item_count} items, ${result.collection_count} collections, ${result.storage_used} bytes used, ${result.shared_item_count} shared items`;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, result))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('get_stats', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'smart_search': {
        const { query, limit } = args as { query: string; limit?: number };

        try {
          // Parse the query for different search criteria
          const parsed = parseItemRequest(query);
          
          // Use provided limit, default to 20
          const finalLimit = typeof limit === 'number' ? limit : 20;
          
          // Search with the query (or empty if no search term extracted)
          const searchResult = await client.getItems({
            search: parsed.searchQuery || undefined,
            tags: parsed.tags,
            limit: finalLimit,
            offset: 0
          }) as ItemsResponse;

          const message = generateResponseMessage('search_items', true, searchResult);
          const displayData = {
            ...searchResult,
            formattedItems: formatItemsForDisplay(searchResult.items)
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, displayData))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('smart_search', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'manage_users': {
        const { userId } = args as { userId: string };

        try {
          const result = await client.getUser(userId) as UserType;
          const message = `User details for ${result.email}`;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, result))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('manage_users', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'manage_notifications': {
        const { status, limit, offset } = args as { status?: NotificationStatus; limit?: number; offset?: number };

        try {
          const result = await client.getNotifications({ status, limit, offset }) as ManageNotificationsResponse;
          const message = `Fetched ${result.notifications.length} notifications`;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, result.notifications))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('manage_notifications', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      case 'manage_groups': {
        try {
          const result = await client.getGroups() as ManageGroupsResponse;
          const message = `Fetched ${result.groups.length} groups`;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(true, message, result.groups))
              }
            ]
          };

        } catch (error) {
          const message = generateResponseMessage('manage_groups', false, null, error instanceof Error ? error.message : 'Unknown error');
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(createAIResponse(false, message, null, error instanceof Error ? error.message : 'Unknown error'))
              }
            ]
          };
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${request.params.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('StashDog MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});