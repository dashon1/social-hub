import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ACCOUNT_ID_MAP = {
  instagram: "BLOTATO_INSTAGRAM_ACCOUNT_ID",
  facebook: "BLOTATO_FACEBOOK_ACCOUNT_ID",
  twitter: "BLOTATO_TWITTER_ACCOUNT_ID",
  linkedin: "BLOTATO_LINKEDIN_ACCOUNT_ID",
  tiktok: "BLOTATO_TIKTOK_ACCOUNT_ID",
  youtube: "BLOTATO_YOUTUBE_ACCOUNT_ID",
  pinterest: "BLOTATO_PINTEREST_ACCOUNT_ID",
  bluesky: "BLOTATO_BLUESKY_ACCOUNT_ID",
};

function buildTarget(platform, post) {
  switch (platform) {
    case 'twitter':
      return { targetType: 'twitter' };
    case 'linkedin':
      return { targetType: 'linkedin' };
    case 'facebook':
      return { targetType: 'facebook', pageId: Deno.env.get("BLOTATO_FACEBOOK_ACCOUNT_ID") };
    case 'instagram':
      return { targetType: 'instagram' };
    case 'tiktok':
      return {
        targetType: 'tiktok',
        privacyLevel: 'PUBLIC_TO_EVERYONE',
        disabledComments: false,
        disabledDuet: false,
        disabledStitch: false,
        isBrandedContent: false,
        isYourBrand: false,
        isAiGenerated: false,
      };
    case 'youtube':
      return {
        targetType: 'youtube',
        title: post.title || 'Untitled',
        privacyStatus: 'public',
        shouldNotifySubscribers: true,
      };
    case 'pinterest':
      return { targetType: 'pinterest', boardId: '' }; // User needs to set boardId
    case 'bluesky':
      return { targetType: 'bluesky' };
    default:
      return { targetType: platform };
  }
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
      return Response.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await base44.entities.SocialPost.get(postId);

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.created_by !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized to publish this post' }, { status: 403 });
    }

    const apiKey = Deno.env.get("BLOTATO_API_KEY");

    // Determine which platforms to publish to
    const platformsToPublish = post.platforms && post.platforms.length > 0
      ? post.platforms
      : post.platform ? [post.platform] : [];

    if (platformsToPublish.length === 0) {
      return Response.json({ success: false, error: 'No platforms selected for publishing' }, { status: 400 });
    }

    if (!apiKey) {
      console.log('No Blotato API key found, simulating publish...');

      await base44.entities.SocialPost.update(postId, { status: 'published' });

      for (const platform of platformsToPublish) {
        await base44.entities.Analytics.create({
          post_id: postId, platform,
          impressions: 0, likes: 0, shares: 0, comments: 0, clicks: 0, engagement_rate: 0, reach: 0
        });
      }

      try {
        await base44.integrations.Core.SendEmail({
          to: post.created_by,
          subject: `Post Published: ${post.title}`,
          body: `Your post "${post.title}" has been published to ${platformsToPublish.join(', ')} (simulated). Connect Blotato API for real publishing.`
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      return Response.json({ success: true, message: 'Post published (simulated)', postId, platforms: platformsToPublish });
    }

    // Build the full post text with hashtags
    let fullText = post.content || '';
    if (post.hashtags) {
      fullText += '\n\n' + post.hashtags;
    }

    const results = [];

    // Platforms with direct API connections (no Blotato needed)
    const directApiPlatforms = ['linkedin', 'bluesky', 'twitter'];

    // Publish to each selected platform
    for (const platform of platformsToPublish) {

      // Route to direct API if available
      if (directApiPlatforms.includes(platform)) {
        console.log(`Publishing to ${platform} via direct API...`);
        try {
          const directResult = await base44.functions.invoke(`publishTo${platform.charAt(0).toUpperCase() + platform.slice(1)}`, { postId });
          console.log(`Direct API result for ${platform}:`, JSON.stringify(directResult));
          
          if (directResult.success) {
            results.push({ platform, status: 'published', submissionId: directResult.postUrn || '' });
            await base44.entities.Analytics.create({
              post_id: postId, platform,
              impressions: 0, likes: 0, shares: 0, comments: 0, clicks: 0, engagement_rate: 0, reach: 0
            });
          } else {
            results.push({ platform, status: 'failed', error: directResult.error || 'Direct API error' });
          }
        } catch (directErr) {
          console.error(`Direct API error for ${platform}:`, directErr);
          results.push({ platform, status: 'failed', error: directErr.message || 'Direct API error' });
        }
        continue;
      }

      // Fall back to Blotato for other platforms
      const accountIdEnvVar = ACCOUNT_ID_MAP[platform];
      const accountId = accountIdEnvVar ? Deno.env.get(accountIdEnvVar) : null;

      if (!accountId) {
        console.error(`No account ID for platform: ${platform}`);
        results.push({ platform, status: 'failed', error: `No account ID configured for ${platform}` });
        continue;
      }

      const payload = {
        post: {
          accountId,
          content: {
            text: fullText,
            mediaUrls: post.media_urls || [],
            platform,
          },
          target: buildTarget(platform, post),
        },
      };

      if (post.scheduled_date) {
        payload.scheduledTime = new Date(post.scheduled_date).toISOString();
      }

      console.log(`Publishing to ${platform} via Blotato:`, JSON.stringify(payload, null, 2));

      const response = await fetch('https://backend.blotato.com/v2/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'blotato-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch { errorData = { message: `HTTP ${response.status}` }; }
        console.error(`Blotato error for ${platform}:`, JSON.stringify(errorData));
        results.push({ platform, status: 'failed', error: errorData.message || 'API error' });
      } else {
        const result = await response.json();
        console.log(`Blotato success for ${platform}:`, JSON.stringify(result));
        results.push({ platform, status: 'published', submissionId: result.postSubmissionId });

        await base44.entities.Analytics.create({
          post_id: postId, platform,
          impressions: 0, likes: 0, shares: 0, comments: 0, clicks: 0, engagement_rate: 0, reach: 0
        });
      }
    }

    const allFailed = results.every(r => r.status === 'failed');
    const someFailed = results.some(r => r.status === 'failed');

    await base44.entities.SocialPost.update(postId, {
      status: allFailed ? 'failed' : 'published',
      publish_results: results,
    });

    const successPlatforms = results.filter(r => r.status === 'published').map(r => r.platform);
    const failedPlatforms = results.filter(r => r.status === 'failed').map(r => r.platform);

    try {
      let emailBody = `Your post "${post.title}" publishing results:\n\n`;
      if (successPlatforms.length > 0) emailBody += `✅ Published to: ${successPlatforms.join(', ')}\n`;
      if (failedPlatforms.length > 0) emailBody += `❌ Failed on: ${failedPlatforms.join(', ')}\n`;

      await base44.integrations.Core.SendEmail({
        to: post.created_by,
        subject: `Post ${allFailed ? 'Failed' : 'Published'}: ${post.title}`,
        body: emailBody,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    return Response.json({
      success: !allFailed,
      message: allFailed ? 'All platforms failed' : someFailed ? 'Published to some platforms' : 'Published to all platforms',
      postId,
      results,
    });

  } catch (error) {
    console.error('Publishing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});