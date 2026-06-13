import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHmac } from 'node:crypto';

// OAuth 1.0a signature generation
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // Generate signature
  const signature = createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
}

// Generate OAuth 1.0a header
function generateOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string,
  additionalParams: Record<string, string> = {}
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...additionalParams
  };

  const signature = generateOAuthSignature(method, url, oauthParams, consumerSecret, accessTokenSecret);
  oauthParams.oauth_signature = signature;

  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return authHeader;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();
    
    if (!postId) {
      return Response.json({ error: 'postId is required' }, { status: 400 });
    }

    // Fetch the post
    const post = await base44.entities.SocialPost.get(postId);
    
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.created_by !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized to publish this post' }, { status: 403 });
    }

    // Get Twitter credentials from environment variables
    const TWITTER_CONSUMER_KEY = Deno.env.get('TWITTER_CONSUMER_KEY');
    const TWITTER_CONSUMER_SECRET = Deno.env.get('TWITTER_CONSUMER_SECRET');
    const TWITTER_ACCESS_TOKEN = Deno.env.get('TWITTER_ACCESS_TOKEN');
    const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET');

    if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
      return Response.json({ success: false, error: 'Twitter API credentials not configured' }, { status: 500 });
    }

    // Prepare tweet content (Twitter has a 280 character limit)
    let tweetText = post.content;
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...';
    }

    // Twitter API v2 endpoint for creating tweets
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';

    // Generate OAuth header
    const authHeader = generateOAuthHeader(
      method,
      url,
      TWITTER_CONSUMER_KEY,
      TWITTER_CONSUMER_SECRET,
      TWITTER_ACCESS_TOKEN,
      TWITTER_ACCESS_TOKEN_SECRET
    );

    // Make request to Twitter API
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: tweetText
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twitter API error:', result);
      return Response.json({
        error: 'Failed to publish to Twitter',
        details: result,
        success: false
      }, { status: response.status });
    }

    return Response.json({
      success: true,
      platform: 'twitter',
      status: 'published',
      tweetId: result.data?.id,
      tweetText: result.data?.text
    });

  } catch (error) {
    console.error('Error publishing to Twitter:', error);
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});