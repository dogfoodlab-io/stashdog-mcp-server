# StashDog MCP Server

A Model Context Protocol (MCP) server that provides natural language tools for managing your StashDog inventory. This server enables AI assistants to interact with your StashDog inventory through intuitive natural language commands.

## 🚀 Features

- **Natural Language Interface**: Use plain English to manage your inventory
- **Comprehensive Item Management**: Add, update, search, delete, and organize items
- **Collection Management**: Create and manage collections with ease
- **Smart Search**: Intelligent search across your inventory with complex queries
- **Tag Management**: Create, rename, and organize tags
- **URL Import**: Import items directly from URLs
- **Authentication**: Secure authentication with your StashDog account
- **Rich Formatting**: Beautiful, formatted responses with emojis and structured data

## 🛠️ Installation

1. **Clone or download** this MCP server to your local machine:
   ```bash
   git clone <repository-url>
   cd stashdog-mcp-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the server**:
   ```bash
   npm run build
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your StashDog API configuration
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# StashDog API Configuration
STASHDOG_API_URL=http://localhost:3000/graphql
STASHDOG_AUTH_TOKEN=your_auth_token_here

# Optional: Pre-configured credentials
STASHDOG_EMAIL=your_email@example.com
STASHDOG_PASSWORD=your_password
```

### MCP Client Configuration

Add this server to your `.cursor/mcp.json` or similar MCP client configuration:

```json
{
  "mcpServers": {
    "stashdog": {
      "command": "node",
      "args": ["/path/to/stashdog-mcp-server/dist/index.js"],
      "env": {
        "STASHDOG_API_URL": "http://localhost:3000/graphql",
        "STASHDOG_AUTH_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 🔧 Available Tools

### 1. `authenticate`
Authenticate with your StashDog account.

**Example:**
```
authenticate with email: user@example.com and password: mypassword
```

### 2. `manage_inventory_items`
Add, update, search, delete, or manage inventory items using natural language.

**Examples:**
- `"Add a new MacBook Pro with tags electronics, work, expensive"`
- `"Search for items tagged with kitchen"`
- `"Update item abc123 to add note about warranty expiring soon"`
- `"Delete item xyz789"`
- `"Find all storage containers"`
- `"Add item called 'Wireless Mouse' with notes 'Logitech MX Master 3' and tags office, electronics"`

### 3. `manage_collections`
Create, update, delete collections or manage items within collections.

**Examples:**
- `"Create a new collection called 'Kitchen Appliances'"`
- `"Add items abc123, def456 to collection xyz789"`
- `"Delete collection old-stuff"`
- `"Update collection xyz789 to change name to 'Home Office'"`

### 4. `import_from_url`
Import items from URLs (product pages, images, etc.).

**Example:**
```
import_from_url: https://example.com/product/laptop
```

### 5. `manage_tags`
Create, search, rename, or delete tags.

**Examples:**
- `"Create tag electronics"`
- `"Search for tags containing kitchen"`
- `"Rename tag old-name to new-name"`
- `"Delete tag unused-tag"`

### 6. `get_inventory_stats`
Get statistics about your inventory.

**Example:**
```
get_inventory_stats
```

### 7. `smart_search`
Perform intelligent searches with natural language queries.

**Examples:**
- `"Show me all electronics in the office"`
- `"Find kitchen items that are favorited"`
- `"List storage containers with more than 5 items"`

## 📝 Usage Examples

### Adding Items

```
Add a new item called "Gaming Keyboard" with notes "Mechanical switches, RGB lighting" and tags gaming, electronics, desk-setup
```

### Searching Items

```
Find all items tagged with electronics that are in storage containers
```

### Managing Collections

```
Create a new collection called "Home Office Setup" with description "Everything needed for working from home"
```

### Complex Operations

```
Search for items with tags kitchen, appliances limit 10
```

## 🎯 Natural Language Parsing

The server includes sophisticated natural language parsing that understands:

- **Actions**: add, create, update, modify, delete, remove, search, find, favorite, etc.
- **Tags**: Supports `#hashtag` format and comma-separated lists
- **Item IDs**: Automatically detects UUIDs in various formats
- **Custom Fields**: Parses `field_name: value` patterns
- **Storage Indicators**: Recognizes storage/container keywords
- **Quotes**: Handles quoted names and descriptions
- **Limits and Offsets**: Understands pagination keywords

## 🔐 Authentication

The server supports multiple authentication methods:

1. **Environment Token**: Set `STASHDOG_AUTH_TOKEN` in your environment
2. **Runtime Authentication**: Use the `authenticate` tool to log in
3. **Auto-login**: Configure `STASHDOG_EMAIL` and `STASHDOG_PASSWORD` for automatic authentication

## 📊 Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "message": "✅ Successfully added item 'Gaming Keyboard' with ID: abc123",
  "data": {
    "id": "abc123",
    "name": "Gaming Keyboard",
    "tags": ["gaming", "electronics", "desk-setup"]
  }
}
```

## 🐛 Error Handling

The server provides detailed error messages for common scenarios:

- Missing required parameters
- Authentication failures
- Network connectivity issues
- GraphQL errors
- Validation errors

## 📁 Project Structure

```
stashdog-mcp-server/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── client.ts             # GraphQL client wrapper
│   ├── types.ts              # TypeScript types
│   ├── nlp-utils.ts          # Natural language processing
│   └── graphql/
│       └── operations.ts     # GraphQL queries and mutations
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 Development

### Running in Development Mode

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that your StashDog API is running and accessible
2. Verify your authentication credentials
3. Check the server logs for detailed error messages
4. Ensure all dependencies are properly installed

## 🎉 Examples in Action

### Complete Workflow Example

```
# Authenticate
authenticate with email: user@example.com and password: mypassword

# Add some items
Add a new MacBook Pro with tags electronics, work, laptop and notes "16-inch, M2 chip, 32GB RAM"

# Create a collection
Create a new collection called "Work Equipment" with description "All items for remote work"

# Search for items
Find all items tagged with electronics

# Get stats
get_inventory_stats

# Import from URL
import_from_url: https://example.com/product/wireless-mouse

# Smart search
Show me all work-related items that are favorited
```

This MCP server makes managing your StashDog inventory as easy as having a conversation with an AI assistant!