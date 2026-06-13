import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.10.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Map plan names to Stripe Price IDs from environment variables
const PRICE_IDS = {
  pro: Deno.env.get("STRIPE_PRICE_ID_PRO"),
  agency: Deno.env.get("STRIPE_PRICE_ID_AGENCY")
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planName } = await req.json();
    
    // Use the price ID from environment if provided plan name
    const actualPriceId = PRICE_IDS[planName] || priceId;
    
    if (!actualPriceId) {
      return Response.json({ 
        error: 'Price ID not configured. Please set STRIPE_PRICE_ID_PRO and STRIPE_PRICE_ID_AGENCY in environment variables.' 
      }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          base44_user_email: user.email
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/subscription?success=true`,
      cancel_url: `${req.headers.get('origin')}/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_name: planName
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: planName
        }
      }
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});