import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const BLOTATO_API_URL = 'https://api.blotato.com/v1';
const BLOTATO_API_KEY = Deno.env.get('BLOTATO_API_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');

Deno.serve(async (req) => {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('Authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');
    
    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return Response.json({ 
        error: 'Unauthorized - Invalid or missing cron secret' 
      }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    
    // This endpoint should be called by a cron job every minute
    // Call it with: Authorization: Bearer YOUR_CRON_SECRET
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Find posts scheduled for now (with 5 minute buffer)
    const allScheduledPosts = await base44.asServiceRole.entities.SocialPost.filter({
      status: 'scheduled'
    });
    
    const postsToPublish = allScheduledPosts.filter(post => {
      if (!post.scheduled_date) return false;
      const scheduledTime = new Date(post.scheduled_date);
      return scheduledTime <= now && scheduledTime >= fiveMinutesAgo;
    });

    const results = [];

    for (const post of postsToPublish) {
      try {
        if (BLOTATO_API_KEY) {
          // Use Blotato API for real publishing
          const blotoPayload = {
            platform: post.platform,
            content: post.content,
            media_urls: post.media_urls || [],
            hashtags: post.hashtags || '',
            post_type: post.post_type || 'text',
            title: post.title
          };

          const response = await fetch(`${BLOTATO_API_URL}/posts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${BLOTATO_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(blotoPayload)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Blotato API error');
          }

          const result = await response.json();

          await base44.asServiceRole.entities.SocialPost.update(post.id, {
            status: 'published',
            blotato_post_id: result.post_id || result.id
          });

          // Create analytics entry
          await base44.asServiceRole.entities.Analytics.create({
            post_id: post.id,
            platform: post.platform,
            impressions: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            clicks: 0,
            engagement_rate: 0,
            reach: 0
          });

          results.push({
            post_id: post.id,
            status: 'success',
            title: post.title,
            blotato_post_id: result.post_id || result.id
          });

        } else {
          // Simulate publishing if no API key
          await base44.asServiceRole.entities.SocialPost.update(post.id, {
            status: 'published'
          });

          // Create analytics entry
          await base44.asServiceRole.entities.Analytics.create({
            post_id: post.id,
            platform: post.platform,
            impressions: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            clicks: 0,
            engagement_rate: 0,
            reach: 0
          });

          results.push({
            post_id: post.id,
            status: 'success (simulated)',
            title: post.title
          });
        }

        // Send notification email
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: post.created_by,
            subject: `Post Published: ${post.title}`,
            body: `Your post "${post.title}" has been successfully published to ${post.platform}!`
          });
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }

      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);
        
        // Mark as failed
        await base44.asServiceRole.entities.SocialPost.update(post.id, {
          status: 'failed'
        });

        results.push({
          post_id: post.id,
          status: 'failed',
          error: error.message,
          title: post.title
        });
      }
    }

    return Response.json({
      processed: results.length,
      results: results,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Publishing error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});