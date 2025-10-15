# AI Token Usage System

## Overview
This system implements a token-based limitation for AI usage in the dashboard. Each user gets a limited number of tokens that are consumed when using AI features.

## Components Created

### 1. Database Model (`models/aiUsage.ts`)
- Tracks token usage per store/user
- Default: 1000 tokens per user
- Stores usage history
- Validates token consumption

### 2. API Endpoints
- `GET /api/ai-usage?storeId=xxx` - Get token usage info
- `POST /api/ai-usage` - Add tokens to user account
- `POST /api/ai-usage/consume` - Consume tokens
- `POST /api/ai-usage/initialize` - Initialize tokens for new users

### 3. Service Layer (`lib/aiTokenService.ts`)
- `getTokenUsage()` - Fetch user's token info
- `hasEnoughTokens()` - Check if user has sufficient tokens
- `consumeTokens()` - Consume tokens after AI usage
- `getEstimatedTokens()` - Get estimated tokens per request (5)

### 4. Modified Components

#### DeepSeekClient (`lib/DeepSeekClient.ts`)
- Now requires `storeId` and `feature` parameters
- Checks tokens before API call
- Consumes tokens after successful response
- Throws error if insufficient tokens

#### AIBlogGenerator (`app/components/AIBlogGenerator.tsx`)
- Shows token display
- Checks tokens before generation
- Disables button if insufficient tokens
- Updates token count after usage

#### AIDescriptionGenerator (`app/components/AIDescriptionGenerator.tsx`)
- Shows token display
- Validates tokens before generation
- Handles token errors gracefully

### 5. UI Components

#### TokenDisplay (`app/components/TokenDisplay.tsx`)
- Shows remaining tokens
- Progress bar visualization
- Warning when tokens are low (<20%)

#### TokenManagement (`app/components/TokenManagement.tsx`)
- Admin panel for token management
- Add tokens functionality
- Usage history display
- Token statistics overview

## Usage

### For AI Features
```typescript
// Before using AI
const storeId = localStorage.getItem("storeId");
const content = await DeepSeekClient.sendPrompt(prompt, storeId, "blog-generation");
```

### Token Management
- Users start with 1000 tokens
- Each AI request consumes 50 tokens
- Admins can add more tokens via the management panel
- Token usage is tracked with history

### Integration
- Automatically initializes tokens for new users
- Token display appears in AI components
- Menu item added to Settings > "مدیریت توکن های AI"

## Features
- ✅ Token limitation system
- ✅ Usage tracking and history
- ✅ Visual token display
- ✅ Admin token management
- ✅ Automatic user initialization
- ✅ Error handling for insufficient tokens
- ✅ Persian language support

## Token Costs
- Blog Generation: 5 tokens
- Product Description: 5 tokens
- Default allocation: 1000 tokens per user

## Error Messages
- "توکن کافی ندارید" - Insufficient tokens
- Shows remaining token count
- Prevents AI usage when tokens are depleted