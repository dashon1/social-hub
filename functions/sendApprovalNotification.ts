import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();
    
    if (!postId) {
      return Response.json({ error: 'Post ID required' }, { status: 400 });
    }

    // Get the post
    const post = await base44.entities.SocialPost.get(postId);
    
    // Get all admin users
    const allUsers = await base44.asServiceRole.entities.User.list();
    const adminUsers = allUsers.filter(u => u.role === 'admin');

    // Send email to each admin
    const emailPromises = adminUsers.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `Approval Needed: ${post.title}`,
        body: `
          A new post requires your approval:
          
          Title: ${post.title}
          Platform: ${post.platform}
          Created by: ${post.created_by}
          
          Content:
          ${post.content}
          
          Please log in to SocialHub to review and approve this post.
        `
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true,
      notified: adminUsers.length
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});