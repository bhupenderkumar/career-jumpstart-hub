// Job API Configuration
// This file contains configuration for various job APIs that provide real job listings

export const JOB_API_CONFIG = {
  // RemoteOK - Free API for remote jobs (CORS-enabled)
  remoteOk: {
    baseUrl: 'https://remoteok.io/api',
    enabled: true,
    requiresAuth: false,
    description: 'Remote jobs API with blockchain/crypto filter'
  },

  // The Muse - Free API for tech company jobs
  themuse: {
    baseUrl: 'https://www.themuse.com/api/public/jobs',
    enabled: true,
    requiresAuth: false,
    description: 'Tech company jobs with engineering focus'
  },

  // Arbeitnow - European tech jobs API
  arbeitnow: {
    baseUrl: 'https://www.arbeitnow.com/api/job-board-api',
    enabled: true,
    requiresAuth: false,
    description: 'European tech jobs including blockchain'
  },

  // JSearch via RapidAPI - LinkedIn alternative
  jsearch: {
    baseUrl: 'https://jsearch.p.rapidapi.com/search',
    enabled: !!import.meta.env.VITE_RAPIDAPI_KEY,
    requiresAuth: true,
    apiKey: import.meta.env.VITE_RAPIDAPI_KEY,
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    },
    description: 'LinkedIn alternative via RapidAPI - includes LinkedIn jobs'
  },

  // LinkedIn Jobs API via RapidAPI
  linkedinJobs: {
    baseUrl: 'https://linkedin-data-api.p.rapidapi.com/search-jobs',
    enabled: !!import.meta.env.VITE_RAPIDAPI_KEY,
    requiresAuth: true,
    apiKey: import.meta.env.VITE_RAPIDAPI_KEY,
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com'
    },
    description: 'Direct LinkedIn job data via RapidAPI'
  },

  // Adzuna - Job aggregator with free tier
  adzuna: {
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/us/search',
    enabled: !!(import.meta.env.VITE_ADZUNA_APP_ID && import.meta.env.VITE_ADZUNA_APP_KEY),
    requiresAuth: true,
    appId: import.meta.env.VITE_ADZUNA_APP_ID,
    appKey: import.meta.env.VITE_ADZUNA_APP_KEY,
    description: 'Adzuna job aggregator with free tier - includes LinkedIn jobs'
  },

  // Indeed Jobs via RapidAPI
  indeed: {
    baseUrl: 'https://indeed12.p.rapidapi.com/jobs/search',
    enabled: !!import.meta.env.VITE_RAPIDAPI_KEY,
    requiresAuth: true,
    apiKey: import.meta.env.VITE_RAPIDAPI_KEY,
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'indeed12.p.rapidapi.com'
    },
    description: 'Indeed job search via RapidAPI'
  },

  // Glassdoor Jobs via RapidAPI
  glassdoor: {
    baseUrl: 'https://glassdoor-jobs1.p.rapidapi.com/jobs',
    enabled: !!import.meta.env.VITE_RAPIDAPI_KEY,
    requiresAuth: true,
    apiKey: import.meta.env.VITE_RAPIDAPI_KEY,
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'glassdoor-jobs1.p.rapidapi.com'
    },
    description: 'Glassdoor job search via RapidAPI'
  },

  // GitHub Jobs Alternative - Jobs from GitHub repositories
  githubjobs: {
    baseUrl: 'https://jobs.github.com/positions.json',
    enabled: false, // GitHub Jobs API was discontinued
    requiresAuth: false,
    description: 'GitHub Jobs (discontinued but kept for reference)'
  }
};

// Web3/Blockchain keywords for filtering jobs
export const WEB3_KEYWORDS = [
  'blockchain', 'crypto', 'cryptocurrency', 'web3', 'ethereum', 'bitcoin',
  'defi', 'nft', 'solidity', 'smart contract', 'dapp', 'decentralized',
  'polygon', 'chainlink', 'uniswap', 'aave', 'compound', 'opensea',
  'metamask', 'wallet', 'dao', 'yield farming', 'liquidity mining',
  'consensus', 'proof of stake', 'proof of work', 'layer 2', 'scaling',
  'interoperability', 'cross-chain', 'bridge', 'oracle', 'tokenomics',
  'governance token', 'staking', 'mining', 'validator', 'node operator'
];

// Email templates for job applications
export const EMAIL_TEMPLATES = {
  subject: (jobTitle: string, company: string) =>
    `Application for ${jobTitle} position at ${company}`,

  body: (jobTitle: string, company: string, applicantName: string) => `
Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}.

I have attached my resume and cover letter for your review. I believe my skills and experience make me an excellent candidate for this role.

I would welcome the opportunity to discuss how I can contribute to your team. Please feel free to contact me at your convenience.

Thank you for your time and consideration.

Best regards,
${applicantName}
  `.trim()
};

// Application status tracking
export const APPLICATION_STATUSES = {
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  OFFER: 'offer',
  PENDING: 'pending'
} as const;

// Company domains for direct career page links
export const COMPANY_CAREER_PAGES = {
  // Tech Giants
  'google': 'https://careers.google.com',
  'microsoft': 'https://careers.microsoft.com',
  'amazon': 'https://www.amazon.jobs',
  'apple': 'https://jobs.apple.com',
  'meta': 'https://www.metacareers.com',
  'netflix': 'https://jobs.netflix.com',
  'tesla': 'https://www.tesla.com/careers',

  // Crypto/Web3 Companies
  'coinbase': 'https://www.coinbase.com/careers',
  'binance': 'https://www.binance.com/en/careers',
  'opensea': 'https://opensea.io/careers',
  'polygon': 'https://polygon.technology/careers',
  'chainlink': 'https://jobs.lever.co/chainlink',
  'uniswap': 'https://jobs.uniswap.org/',
  'aave': 'https://jobs.lever.co/aave',
  'compound': 'https://compound.finance/careers',
  'consensys': 'https://consensys.io/careers',
  'ethereum': 'https://ethereum.org/en/foundation/',
  'solana': 'https://jobs.solana.com/jobs',
  'avalanche': 'https://www.avalabs.org/careers',
  'near': 'https://careers.near.org/',
  'cosmos': 'https://cosmos.network/careers/',
  'polkadot': 'https://polkadot.network/jobs/',
  'algorand': 'https://www.algorand.com/about/careers',
  'cardano': 'https://iohk.io/en/careers/',
  'tezos': 'https://tezos.com/careers/',
  'flow': 'https://www.onflow.org/careers',
  'hedera': 'https://hedera.com/careers'
};

// Rate limiting configuration
export const API_RATE_LIMITS = {
  remoteOk: { requestsPerMinute: 60, requestsPerHour: 1000 },
  themuse: { requestsPerMinute: 100, requestsPerHour: 5000 },
  arbeitnow: { requestsPerMinute: 60, requestsPerHour: 1000 },
  jsearch: { requestsPerMinute: 100, requestsPerHour: 10000 }, // With API key
  adzuna: { requestsPerMinute: 200, requestsPerHour: 5000 } // With API key
};

// API status and health check
export const checkApiHealth = async (apiName: keyof typeof JOB_API_CONFIG) => {
  const config = JOB_API_CONFIG[apiName];
  if (!config.enabled) {
    return { status: 'disabled', message: 'API is disabled' };
  }

  try {
    const response = await fetch(config.baseUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return {
      status: response.ok ? 'healthy' : 'error',
      statusCode: response.status,
      message: response.ok ? 'API is responding' : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get enabled APIs
export const getEnabledApis = () => {
  return Object.entries(JOB_API_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([name, config]) => ({ name, ...config }));
};

// Environment variable validation
export const validateApiKeys = () => {
  const warnings: string[] = [];
  
  if (!import.meta.env.VITE_RAPIDAPI_KEY) {
    warnings.push('VITE_RAPIDAPI_KEY not set - JSearch API disabled');
  }
  
  if (!import.meta.env.VITE_ADZUNA_APP_ID || !import.meta.env.VITE_ADZUNA_APP_KEY) {
    warnings.push('VITE_ADZUNA_APP_ID/VITE_ADZUNA_APP_KEY not set - Adzuna API disabled');
  }
  
  return warnings;
};
