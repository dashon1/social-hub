import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Plan and visualize your entire content strategy across all platforms in one unified calendar view."
  },
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description: "Generate engaging posts, suggest hashtags, and optimize posting times with advanced AI assistance."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance metrics, engagement rates, and ROI with comprehensive analytics dashboards."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Collaborate seamlessly with approval workflows, comments, and role-based permissions."
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "Schedule posts across multiple platforms and let AI suggest optimal posting times for maximum reach."
  },
  {
    icon: Target,
    title: "Campaign Management",
    description: "Organize content into campaigns, track performance, and measure success against your goals."
  }
];

const platforms = [
  { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { name: "Twitter", icon: Twitter, color: "text-sky-500" },
  { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { name: "YouTube", icon: Youtube, color: "text-red-600" },
  { name: "TikTok", icon: MessageSquare, color: "text-slate-900" }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    content: "SocialHub transformed how we manage our social media. The AI features save us hours every week!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Social Media Manager",
    company: "GrowthAgency",
    content: "The approval workflows and team collaboration features are game-changers for our agency.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Content Creator",
    company: "CreativeStudio",
    content: "Best social media tool I've used. The analytics and scheduling features are incredibly powerful.",
    rating: 5
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 posts per month",
      "2 social accounts",
      "Basic analytics",
      "Email support"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    popular: true,
    features: [
      "Unlimited posts",
      "10 social accounts",
      "Advanced analytics",
      "AI content generation",
      "Team collaboration",
      "Priority support"
    ]
  },
  {
    name: "Agency",
    price: "$99",
    period: "per month",
    features: [
      "Everything in Pro",
      "Unlimited social accounts",
      "White-label reports",
      "Client management",
      "API access",
      "Dedicated support"
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const user = await User.me();
      if (user) {
        // User is logged in, redirect to dashboard
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      // User is not logged in, show landing page
      setIsCheckingAuth(false);
    }
  };

  const handleGetStarted = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">SocialHub</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <Button variant="outline" onClick={handleGetStarted}>Sign In</Button>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Social Media Management
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Manage All Your Social Media
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> in One Place</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Plan, create, schedule, and analyze your social media content across all platforms. 
              Save time with AI-powered assistance and grow your audience faster.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Platform Icons */}
          <div className="mt-20 flex items-center justify-center gap-8 flex-wrap">
            <p className="text-slate-500 font-medium w-full text-center mb-4">Trusted on all major platforms</p>
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.name} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                  <Icon className={`w-8 h-8 ${platform.color}`} />
                  <span className="text-xs text-slate-600">{platform.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700">Features</Badge>
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you create better content and grow your audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700">Testimonials</Badge>
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Loved by Marketing Teams</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what our customers have to say about SocialHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-sm text-slate-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Pricing</Badge>
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that's right for you. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`border-2 ${plan.popular ? 'border-blue-500 shadow-2xl scale-105' : 'border-slate-200 shadow-lg'} relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">/{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Social Media?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of marketers who trust SocialHub to manage their social media presence
          </p>
          <Button size="lg" onClick={handleGetStarted} className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8 py-6">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SocialHub</span>
              </div>
              <p className="text-slate-400">
                The complete social media management platform for modern marketers.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SocialHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}