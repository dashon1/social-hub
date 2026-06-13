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
      return Response.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await base44.entities.SocialPost.get(postId);
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.created_by !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized to publish this post' }, { status: 403 });
    }

    // Get LinkedIn access token via app connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");

    // Step 1: Get the LinkedIn user profile to get the person URN
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!profileRes.ok) {
      const err = await profileRes.text();
      console.error('LinkedIn profile error:', err);
      return Response.json({ error: 'Failed to get LinkedIn profile', details: err }, { status: 500 });
    }

    const profile = await profileRes.json();
    const personUrn = `urn:li:person:${profile.sub}`;
    console.log('LinkedIn person URN:', personUrn);

    // Step 2: Build post content
    let fullText = post.content || '';
    if (post.hashtags) {
      fullText += '\n\n' + post.hashtags;
    }

    // Step 3: Build the LinkedIn post payload
    const linkedInPayload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: fullText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // If there are media URLs, add them as articles (links with thumbnails)
    if (post.media_urls && post.media_urls.length > 0) {
      linkedInPayload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      linkedInPayload.specificContent['com.linkedin.ugc.ShareContent'].media = post.media_urls.map(url => ({
        status: 'READY',
        originalUrl: url,
      }));
    }

    console.log('LinkedIn payload:', JSON.stringify(linkedInPayload, null, 2));

    // Step 4: Publish the post
    const publishRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(linkedInPayload)
    });

    if (!publishRes.ok) {
      const errText = await publishRes.text();
      console.error('LinkedIn publish error:', publishRes.status, errText);
      return Response.json({ 
        success: false, 
        platform: 'linkedin',
        status: 'failed',
        error: `LinkedIn API error: ${publishRes.status} - ${errText}`
      });
    }

    const publishResult = await publishRes.json();
    console.log('LinkedIn publish success:', JSON.stringify(publishResult));

    return Response.json({
      success: true,
      platform: 'linkedin',
      status: 'published',
      postUrn: publishResult.id,
    });

  } catch (error) {
    console.error('LinkedIn publishing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});