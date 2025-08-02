import { SEOTool, PricingPlan } from '../types';

export const SEO_TOOLS: SEOTool[] = [
  {
    id: '1',
    name: 'Meta Tag Analyzer',
    description: 'Analyze and optimize your meta tags for better SEO performance',
    icon: 'Tags',
    category: 'analysis'
  },
  {
    id: '2',
    name: 'Keyword Density Checker',
    description: 'Check keyword density and optimize content for target keywords',
    icon: 'Search',
    category: 'analysis'
  },
  {
    id: '3',
    name: 'Sitemap Checker',
    description: 'Validate and analyze your XML sitemap for SEO issues',
    icon: 'Map',
    category: 'analysis'
  },
  {
    id: '4',
    name: 'Robots.txt Generator',
    description: 'Generate and validate robots.txt files for search engines',
    icon: 'Bot',
    category: 'utilities'
  },
  {
    id: '5',
    name: 'Google Index Checker',
    description: 'Check if your pages are indexed by Google search engine',
    icon: 'Globe',
    category: 'tracking'
  },
  {
    id: '6',
    name: 'Keyword Suggestion',
    description: 'Discover new keyword opportunities for your content',
    icon: 'Lightbulb',
    category: 'optimization'
  },
  {
    id: '7',
    name: 'Position Checker',
    description: 'Track your website rankings for target keywords',
    icon: 'TrendingUp',
    category: 'tracking'
  },
  {
    id: '8',
    name: 'Backlink Finder',
    description: 'Discover and analyze backlinks to your website',
    icon: 'Link',
    category: 'analysis'
  },
  {
    id: '9',
    name: 'Domain Age Checker',
    description: 'Check the age and history of any domain name',
    icon: 'Calendar',
    category: 'utilities'
  },
  {
    id: '10',
    name: 'Plagiarism Checker',
    description: 'Check content originality and detect duplicate content',
    icon: 'Shield',
    category: 'analysis'
  },
  {
    id: '11',
    name: 'Page Speed Checker',
    description: 'Analyze website loading speed and performance metrics',
    icon: 'Zap',
    category: 'optimization'
  },
  {
    id: '12',
    name: 'Ping Website',
    description: 'Ping search engines to index your website faster',
    icon: 'Radio',
    category: 'utilities'
  },
  {
    id: '13',
    name: 'URL Shortener',
    description: 'Create short URLs with tracking and analytics',
    icon: 'Scissors',
    category: 'utilities'
  },
  {
    id: '14',
    name: 'Visitor Analytics',
    description: 'Track website visitors and analyze user behavior',
    icon: 'BarChart3',
    category: 'tracking'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 SEO Projects',
      '10 Directory Submissions/month',
      'Basic SEO Tools',
      'Email Support'
    ],
    limits: {
      projects: 5,
      submissions: 10,
      tools: false
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    features: [
      '25 SEO Projects',
      '100 Directory Submissions/month',
      'All SEO Tools',
      'Priority Email Support',
      'Submission Reports'
    ],
    limits: {
      projects: 25,
      submissions: 100,
      tools: true
    },
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    features: [
      'Unlimited SEO Projects',
      'Unlimited Directory Submissions',
      'All SEO Tools + API Access',
      '24/7 Priority Support',
      'Advanced Analytics',
      'White-label Reports'
    ],
    limits: {
      projects: -1,
      submissions: -1,
      tools: true
    }
  }
];