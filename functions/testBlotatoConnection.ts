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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { platform } = await req.json();

    if (!platform || !ACCOUNT_ID_MAP[platform]) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const apiKey = Deno.env.get("BLOTATO_API_KEY");
    if (!apiKey) {
      return Response.json({
        connected: false,
        message: "No Blotato API Key configured. Set the BLOTATO_API_KEY environment variable."
      });
    }

    const envVar = ACCOUNT_ID_MAP[platform];
    const accountId = Deno.env.get(envVar);

    if (!accountId) {
      return Response.json({
        connected: false,
        message: `No Account ID configured for ${platform}. Set the ${envVar} environment variable.`
      });
    }

    // Try to verify by calling Blotato's accounts endpoint
    try {
      const response = await fetch('https://backend.blotato.com/v2/accounts', {
        method: 'GET',
        headers: {
          'blotato-api-key': apiKey,
        },
      });

      if (!response.ok) {
        return Response.json({
          connected: false,
          message: `API key is invalid or Blotato returned an error (HTTP ${response.status}).`
        });
      }

      const accounts = await response.json();

      // Check if the account ID exists in the returned accounts
      const found = Array.isArray(accounts)
        ? accounts.some(a => a.id === accountId || a.accountId === accountId)
        : false;

      if (found) {
        return Response.json({
          connected: true,
          message: `${platform} is connected and verified with Blotato.`
        });
      } else {
        // Account ID is set but not found - could still work if API structure differs
        return Response.json({
          connected: true,
          message: `Account ID is configured. API key is valid. (Could not verify account ID in account list - it may still work.)`
        });
      }
    } catch (fetchError) {
      // Network error reaching Blotato
      return Response.json({
        connected: false,
        message: `Could not reach Blotato API: ${fetchError.message}`
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});