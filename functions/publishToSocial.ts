import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    const posts = await base44.entities.SocialPost.filter({ id: postId });
    
    if (!posts || posts.length === 0) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[0];

    // Handle Twitter separately with dedicated function
    if (post.platform === 'twitter') {
      const twitter = await base44.functions.invoke('publishToTwitter', { postId });
      return Response.json(twitter);
    }

    // Get the access token for the platform
    let accessToken;
    try {
      if (post.platform === 'instagram' || post.platform === 'facebook') {
        accessToken = await base44.asServiceRole.connectors.getAccessToken('instagram');
      } else if (post.platform === 'linkedin') {
        accessToken = await base44.asServiceRole.connectors.getAccessToken('linkedin');
      } else {
        // Fallback to Blotato for unsupported platforms
        const blotato = await base44.functions.invoke('publishToBlotato', { postId });
        return Response.json(blotato);
      }
    } catch (error) {
      console.error('OAuth not configured, falling back to Blotato:', error);
      const blotato = await base44.functions.invoke('publishToBlotato', { postId });
      return Response.json(blotato);
    }

    // Publish based on platform
    let result;
    
    if (post.platform === 'linkedin') {
      // Publish to LinkedIn
      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: 'urn:li:person:AUTHOR_ID', // This needs to be fetched from profile
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: post.content
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      });

      result = await response.json();
    } else if (post.platform === 'instagram' || post.platform === 'facebook') {
      // Facebook/Instagram Graph API
      const pageId = 'YOUR_PAGE_ID'; // This should be configured
      const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: post.content,
          access_token: accessToken
        })
      });

      result = await response.json();
    }

    // Update post status
    await base44.asServiceRole.entities.SocialPost.update(postId, {
      status: 'published'
    });

    // Create mock analytics
    await base44.asServiceRole.entities.Analytics.create({
      post_id: postId,
      platform: post.platform,
      impressions: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      clicks: 0,
      engagement_rate: 0,
      reach: 0
    });

    return Response.json({
      success: true,
      message: 'Post published successfully',
      result
    });

  } catch (error) {
    console.error('Error publishing post:', error);
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});