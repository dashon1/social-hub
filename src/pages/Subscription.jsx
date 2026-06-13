import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building2, Loader2, Rocket, Sparkles } from "lucide-react";
import { createCheckout } from "@/functions/createCheckout";
import { createPortalSession } from "@/functions/createPortalSession";

const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    period: "30 days",
    icon: Zap,
    color: "from-slate-500 to-slate-600",
    limitedTime: true,
    features: [
      "1 social account",
      "6 posts total",
      "30 days trial",
      "Basic analytics",
      "Email support"
    ],
    priceId: null
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "per month",
    icon: Crown,
    color: "from-blue-500 to-purple-600",
    popular: true,
    features: [
      "3 social media accounts",
      "Post 3 times daily",
      "90 posts per month",
      "Advanced analytics",
      "AI content generation",
      "Priority support"
    ],
    priceId: "price_pro"
  },
  {
    id: "elite",
    name: "Elite",
    price: "$99",
    period: "per month",
    icon: Rocket,
    color: "from-purple-500 to-pink-600",
    features: [
      "4 social media accounts",
      "Post 4 times daily",
      "120 posts per month",
      "Premium analytics",
      "AI content generation",
      "Team collaboration",
      "White-label reports",
      "Priority support"
    ],
    priceId: "price_elite"
  },
  {
    id: "agency",
    name: "Agency",
    price: "$199",
    period: "per month",
    icon: Building2,
    color: "from-orange-500 to-red-600",
    features: [
      "6 different platforms",
      "Post 5 times daily",
      "150 posts per month",
      "Full analytics suite",
      "AI content generation",
      "Multi-team collaboration",
      "Client management",
      "White-label reports",
      "API access",
      "Dedicated account manager"
    ],
    priceId: "price_agency"
  }
];

export default function Subscription() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUser();
    }, 2000);
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      alert('Subscription successful! Your plan has been activated.');
    } else if (params.get('canceled') === 'true') {
      alert('Subscription canceled. You can try again anytime.');
    }
    
    return () => clearTimeout(timer);
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.id === "free") {
      setProcessingPlan(plan.id);
      try {
        const { data } = await createPortalSession();
        window.location.href = data.url;
      } catch (error) {
        console.error("Portal error:", error);
        alert("Failed to open billing portal. Please try again.");
      } finally {
        setProcessingPlan(null);
      }
      return;
    }

    setProcessingPlan(plan.id);
    try {
      const { data } = await createCheckout({
        priceId: plan.priceId,
        planName: plan.id
      });
      
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
      setProcessingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setProcessingPlan('manage');
    try {
      const { data } = await createPortalSession();
      window.location.href = data.url;
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal. Please try again.");
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentPlan = currentUser?.subscription_plan || "free";
  const isCurrentPlan = (planId) => currentPlan === planId;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 text-amber-800 px-5 py-2 rounded-full mb-6 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold tracking-wide uppercase">🚀 Early Access Pricing — Lock in These Rates Today!</span>
          <Sparkles className="w-4 h-4" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Scale your social media management with plans designed for every need.
          <span className="text-amber-700 font-medium"> Prices will increase after early access — subscribe now to keep your rate forever.</span>
        </p>
      </div>

      {currentUser && (
        <div className="text-center space-y-3">
          <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
            Current Plan: {currentPlan.toUpperCase()}
          </Badge>
          {currentPlan !== 'free' && (
            <div>
              <Button 
                variant="outline" 
                onClick={handleManageBilling}
                disabled={processingPlan === 'manage'}
              >
                {processingPlan === 'manage' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                ) : (
                  'Manage Billing'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const isProcessing = processingPlan === plan.id;
          
          return (
            <Card 
              key={plan.id}
              className={`relative border-2 ${isCurrent ? 'border-blue-500 shadow-xl' : 'border-slate-200'} ${plan.popular ? 'ring-4 ring-purple-100' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.priceId && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5">
                    Early Access
                  </Badge>
                </div>
              )}
              {plan.limitedTime && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 animate-pulse">
                    ⏰ Limited Time Offer
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full ${
                    isCurrent 
                      ? 'bg-slate-300' 
                      : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                  }`}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-slate-700 mb-6">
            For enterprises with specific needs, we offer custom plans with dedicated support, 
            advanced security features, and tailored integrations.
          </p>
          <Button size="lg" variant="outline" className="bg-white">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}