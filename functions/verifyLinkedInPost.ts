import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postUrn } = await req.json();

    const accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");

    // Get the LinkedIn user profile
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();
    console.log('LinkedIn profile:', JSON.stringify(profile));

    // Try to fetch the specific post if URN provided
    if (postUrn) {
      const encodedUrn = encodeURIComponent(postUrn);
      const postRes = await fetch(`https://api.linkedin.com/v2/ugcPosts/${encodedUrn}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (postRes.ok) {
        const postData = await postRes.json();
        console.log('Post data:', JSON.stringify(postData));
        return Response.json({ 
          success: true, 
          verified: true,
          post: postData,
          profile: { name: profile.name, sub: profile.sub }
        });
      } else {
        const errText = await postRes.text();
        console.log('Post fetch error:', postRes.status, errText);
        return Response.json({ 
          success: true, 
          verified: false, 
          status: postRes.status,
          error: errText,
          profile: { name: profile.name, sub: profile.sub }
        });
      }
    }

    // If no URN, just return profile info
    return Response.json({ 
      success: true, 
      profile: { name: profile.name, email: profile.email, sub: profile.sub }
    });

  } catch (error) {
    console.error('Verify error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});