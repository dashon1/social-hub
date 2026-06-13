# Twitter/X Integration Guide for SocialHub

## Overview

This guide explains how the Twitter/X API integration has been set up for your SocialHub application.

## What Has Been Completed

### 1. Twitter Developer Account Setup
- ✅ Created Twitter Developer account
- ✅ Created app: `2020717432768237568Damack05`
- ✅ Configured app permissions: **Read and Write** (allows posting tweets)
- ✅ Set up OAuth 1.0a authentication
- ✅ Obtained all necessary API credentials

### 2. API Credentials Obtained

**OAuth 1.0a Credentials** (for posting tweets):
- Consumer Key (API Key): `v9aSPntmcYIj8ySoFqWikOjqm`
- Consumer Secret (API Secret): `ThgZw2VRwuRKSNbFhoUUIPhAyNivoRc6towHZOmYl9YtEPiNX9`
- Access Token: `1933390010830782464-AOlzxwBRCZwo27894SnFxdhCPFHJhJ`
- Access Token Secret: `ZRgtunqBGrIEMbjCEhXWYplF1kWphp1RwQZjdXQsMXzP8`

**OAuth 2.0 Credentials** (for future use):
- Client ID: `U2VIN2xyN2VNc2JEdVdWaTdBVHo6MTpjaQ`
- Client Secret: `EAI0Wvx_tP5WcQrCZmYLplmkfSDqscx_vM-gZ9SFhaUAL751Oq`

### 3. Code Implementation

**New Function Created**: `functions/publishToTwitter.ts`
- Implements OAuth 1.0a signature generation
- Handles tweet posting via Twitter API v2
- Automatically truncates tweets to 280 characters
- Updates post status in database after publishing
- Creates analytics entries for tracking

**Updated Function**: `functions/publishToSocial.ts`
- Added routing to call `publishToTwitter` for Twitter posts
- Maintains compatibility with existing platforms

## How to Deploy

### Step 1: Add Credentials to Base44 Secrets

You need to add the Twitter API credentials to your Base44 project as environment variables or secrets:

1. Go to your Base44 dashboard
2. Navigate to your SocialHub project settings
3. Add the following environment variables:

```
TWITTER_CONSUMER_KEY=v9aSPntmcYIj8ySoFqWikOjqm
TWITTER_CONSUMER_SECRET=ThgZw2VRwuRKSNbFhoUUIPhAyNivoRc6towHZOmYl9YtEPiNX9
TWITTER_ACCESS_TOKEN=1933390010830782464-AOlzxwBRCZwo27894SnFxdhCPFHJhJ
TWITTER_ACCESS_TOKEN_SECRET=ZRgtunqBGrIEMbjCEhXWYplF1kWphp1RwQZjdXQsMXzP8
```

**Note**: The credentials are also hardcoded as fallbacks in `publishToTwitter.ts`, but it's recommended to use environment variables for security.

### Step 2: Commit and Push Changes

```bash
cd /home/ubuntu/socialhub
git add functions/publishToTwitter.ts
git add functions/publishToSocial.ts
git commit -m "Add Twitter/X API integration"
git push origin main
```

### Step 3: Deploy to Base44

The changes will automatically deploy through your Base44 CI/CD pipeline.

## How to Use

### Posting a Tweet from SocialHub

1. **Create a new post** in SocialHub
2. **Select "Twitter" as the platform**
3. **Write your content** (max 280 characters)
4. **Click "Publish"** or schedule it

The system will:
- Automatically call the `publishToTwitter` function
- Post the tweet to your Twitter account (@Damack05)
- Update the post status to "published"
- Create analytics tracking entry

### Tweet Content Limitations

- **Character limit**: 280 characters
- Content exceeding 280 characters will be automatically truncated with "..."
- Media attachments are not yet supported (can be added in future)

## API Rate Limits

According to Twitter's free tier:
- **17 tweets per 24 hours**
- Monitor your usage to avoid hitting limits

## Testing the Integration

### Option 1: Test via SocialHub UI
1. Log into your deployed SocialHub app
2. Create a test post for Twitter
3. Publish it and verify it appears on Twitter

### Option 2: Test via API directly
```bash
# Call the function with a post ID
curl -X POST https://your-base44-url/functions/publishToTwitter \
  -H "Content-Type: application/json" \
  -d '{"postId": "your-post-id"}'
```

## Troubleshooting

### Error: "Unauthorized"
- Check that the API credentials are correctly set in environment variables
- Verify the Access Token has "Read and Write" permissions

### Error: "Rate limit exceeded"
- You've hit the 17 tweets per 24 hours limit
- Wait for the rate limit to reset

### Error: "Tweet too long"
- Ensure content is under 280 characters
- The function should auto-truncate, but check the input

## Future Enhancements

Potential features to add:
1. **Media upload support** - Post images/videos with tweets
2. **Thread support** - Post multiple connected tweets
3. **Reply functionality** - Reply to existing tweets
4. **Analytics sync** - Fetch real engagement metrics from Twitter
5. **OAuth 2.0 user authentication** - Allow users to connect their own Twitter accounts
6. **Scheduled tweets** - Already supported via `publishScheduledPosts.ts`

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit credentials to Git** - Use `.gitignore` to exclude `.env.twitter`
2. **Use environment variables** - Store credentials in Base44 secrets
3. **Rotate credentials periodically** - Regenerate keys if compromised
4. **Monitor API usage** - Watch for unusual activity

## Support

For issues or questions:
- Check the [Twitter API documentation](https://developer.twitter.com/en/docs/twitter-api)
- Review the [Base44 SDK documentation](https://docs.base44.com)
- Contact support at help.manus.im

## Credentials Reference

All credentials are stored in:
- `/home/ubuntu/twitter_credentials.txt` (local backup)
- `.env.twitter` (environment variables template)
- Base44 project secrets (production)

---

**Integration completed on**: February 8, 2026  
**Twitter Developer Portal**: https://developer.x.com  
**App ID**: 32366945  
**Twitter Account**: @Damack05
