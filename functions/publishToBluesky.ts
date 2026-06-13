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

    const handle = Deno.env.get("BLUESKY_HANDLE");
    const appPassword = Deno.env.get("BLUESKY_APP_PASSWORD");

    if (!handle || !appPassword) {
      return Response.json({ success: false, error: 'Bluesky credentials not configured' }, { status: 500 });
    }

    // Step 1: Create a session (authenticate)
    const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: handle, password: appPassword })
    });

    if (!sessionRes.ok) {
      const err = await sessionRes.text();
      console.error('Bluesky auth error:', err);
      return Response.json({ success: false, error: 'Bluesky authentication failed', details: err }, { status: 500 });
    }

    const session = await sessionRes.json();
    console.log('Bluesky session created for DID:', session.did);

    // Step 2: Build post content
    let fullText = post.content || '';
    if (post.hashtags) {
      fullText += '\n\n' + post.hashtags;
    }

    // Bluesky has a 300 character limit (graphemes), truncate if needed
    if (fullText.length > 300) {
      fullText = fullText.substring(0, 297) + '...';
    }

    const now = new Date().toISOString().replace('+00:00', 'Z');

    const record = {
      "$type": "app.bsky.feed.post",
      text: fullText,
      createdAt: now,
      langs: ["en"]
    };

    // Step 3: Parse URLs in text and add them as facets (clickable links)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const textBytes = new TextEncoder().encode(fullText);
    const facets = [];
    let match;
    while ((match = urlRegex.exec(fullText)) !== null) {
      const url = match[1];
      const beforeUrl = fullText.substring(0, match.index);
      const byteStart = new TextEncoder().encode(beforeUrl).length;
      const byteEnd = byteStart + new TextEncoder().encode(url).length;
      facets.push({
        index: { byteStart, byteEnd },
        features: [{ "$type": "app.bsky.richtext.facet#link", uri: url }]
      });
    }

    if (facets.length > 0) {
      record.facets = facets;
    }

    // Step 4: If there's an image, upload it and embed
    if (post.media_urls && post.media_urls.length > 0 && post.post_type !== 'video') {
      const images = [];
      for (const mediaUrl of post.media_urls.slice(0, 4)) { // Bluesky supports up to 4 images
        try {
          const imgRes = await fetch(mediaUrl);
          if (imgRes.ok) {
            const imgBlob = await imgRes.arrayBuffer();
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

            const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.accessJwt}`,
                'Content-Type': contentType
              },
              body: imgBlob
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              images.push({
                alt: post.title || '',
                image: uploadData.blob
              });
              console.log('Image uploaded to Bluesky');
            }
          }
        } catch (imgErr) {
          console.error('Failed to upload image:', imgErr);
        }
      }

      if (images.length > 0) {
        record.embed = {
          "$type": "app.bsky.embed.images",
          images: images
        };
      }
    }

    console.log('Bluesky post record:', JSON.stringify(record, null, 2));

    // Step 5: Create the post
    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: record
      })
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      console.error('Bluesky post error:', postRes.status, errText);
      return Response.json({ success: false, error: `Bluesky API error: ${postRes.status} - ${errText}` });
    }

    const postResult = await postRes.json();
    console.log('Bluesky post success:', JSON.stringify(postResult));

    return Response.json({
      success: true,
      platform: 'bluesky',
      status: 'published',
      uri: postResult.uri,
      cid: postResult.cid
    });

  } catch (error) {
    console.error('Bluesky publishing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});