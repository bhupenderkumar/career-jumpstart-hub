/**
 * GitHub Projects Fetcher
 *
 * Fetches public repositories for a GitHub user and categorises them
 * so they can be used in resume generation and sample data.
 */

// ── Types ──

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  topics: string[];
  stars: number;
  forks: number;
  url: string;
  homepage: string;
  updatedAt: string;
  createdAt: string;
  isArchived: boolean;
  isFork: boolean;
}

export interface CategorisedProjects {
  java: GitHubRepo[];
  web3: GitHubRepo[];
  frontend: GitHubRepo[];
  python: GitHubRepo[];
  devops: GitHubRepo[];
  ai: GitHubRepo[];
  other: GitHubRepo[];
  all: GitHubRepo[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string;
  url: string;
  bullets: string[];
  category: string;
}

// ── Constants ──

const GITHUB_API = 'https://api.github.com';

// Category detection keywords (checked against name, description, topics, language)
const CATEGORY_RULES: Record<string, { languages: string[]; keywords: string[] }> = {
  web3: {
    languages: ['solidity', 'rust'],
    keywords: [
      'solana', 'ethereum', 'blockchain', 'web3', 'defi', 'token', 'nft',
      'smart-contract', 'anchor', 'crypto', 'meme-coin', 'rwa', 'dapp',
      'wallet', 'trading-bot', 'drift', 'wormhole', 'stablecoin',
      'polymarket', 'prediction',
    ],
  },
  java: {
    languages: ['java', 'kotlin'],
    keywords: [
      'spring', 'spring-boot', 'maven', 'gradle', 'jaxb', 'microservice',
      'hibernate', 'jpa', 'servlet', 'mcp-server',
    ],
  },
  frontend: {
    languages: [],
    keywords: [
      'react', 'next', 'nextjs', 'angular', 'vue', 'frontend', 'ui',
      'tailwind', 'vite', 'portfolio', 'website', 'school', 'shiksha',
      'digital-school',
    ],
  },
  python: {
    languages: ['python'],
    keywords: [
      'flask', 'django', 'fastapi', 'python', 'pip', 'machine-learning',
      'agent-deployment',
    ],
  },
  ai: {
    languages: [],
    keywords: [
      'ai', 'llm', 'agent', 'copilot', 'openai', 'anthropic', 'groq',
      'model-context-protocol', 'mcp', 'multi-agent', 'dialogflow',
    ],
  },
  devops: {
    languages: ['dockerfile', 'shell'],
    keywords: [
      'docker', 'kubernetes', 'k8s', 'ci-cd', 'deploy', 'terraform',
      'ansible', 'devops', 'codespace', 'enterprise', 'proxy',
    ],
  },
};

// ── Helpers ──

function categoriseRepo(repo: GitHubRepo): string {
  const searchText = [
    repo.name,
    repo.description,
    ...repo.topics,
    repo.language,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    if (rules.languages.some((l) => repo.language?.toLowerCase() === l)) return category;
    if (rules.keywords.some((kw) => searchText.includes(kw))) return category;
  }

  // Fallback based on language
  const lang = (repo.language || '').toLowerCase();
  if (['typescript', 'javascript'].includes(lang)) return 'frontend';
  return 'other';
}

function repoToResumeProject(repo: GitHubRepo, category: string): ResumeProject {
  const desc = repo.description || repo.name.replace(/[-_]/g, ' ');
  const techs: string[] = [];
  if (repo.language) techs.push(repo.language);
  techs.push(...repo.topics.filter((t) => !techs.includes(t.toLowerCase())).slice(0, 5));

  const bullets: string[] = [];
  if (repo.stars > 0) bullets.push(`${repo.stars} GitHub stars`);
  if (repo.description) bullets.push(repo.description);
  if (repo.homepage) bullets.push(`Live: ${repo.homepage}`);

  return {
    name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: desc,
    technologies: techs.join(', '),
    url: repo.url,
    bullets,
    category,
  };
}

// ── Local cache ──

const CACHE_KEY = 'github_projects_cache';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface CacheEntry {
  timestamp: number;
  username: string;
  data: CategorisedProjects;
}

function getCache(username: string): CategorisedProjects | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.username !== username) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(username: string, data: CategorisedProjects) {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), username, data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota exceeded – ignore */
  }
}

// ── Public API ──

/**
 * Fetch all public repositories for a GitHub user.
 * Results are cached in localStorage for 1 hour.
 */
export async function fetchGitHubProjects(username: string): Promise<CategorisedProjects> {
  // Check cache first
  const cached = getCache(username);
  if (cached) {
    console.log(`[GitHub] Using cached projects for ${username}`);
    return cached;
  }

  console.log(`[GitHub] Fetching repos for ${username}...`);

  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  // Paginate through all repos
  while (true) {
    const url = `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&sort=updated&direction=desc&page=${page}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!res.ok) {
      if (res.status === 403) {
        console.warn('[GitHub] Rate-limited. Using partial data.');
        break;
      }
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const r of data) {
      if (r.fork && !r.stargazers_count) continue; // skip trivial forks
      repos.push({
        name: r.name,
        fullName: r.full_name,
        description: r.description || '',
        language: r.language || '',
        topics: r.topics || [],
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        url: r.html_url,
        homepage: r.homepage || '',
        updatedAt: r.updated_at,
        createdAt: r.created_at,
        isArchived: r.archived,
        isFork: r.fork,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  // Categorise
  const result: CategorisedProjects = {
    java: [],
    web3: [],
    frontend: [],
    python: [],
    devops: [],
    ai: [],
    other: [],
    all: repos,
  };

  for (const repo of repos) {
    const cat = categoriseRepo(repo);
    if (cat in result) {
      (result as Record<string, GitHubRepo[]>)[cat].push(repo);
    } else {
      result.other.push(repo);
    }
  }

  setCache(username, result);
  console.log(
    `[GitHub] Fetched ${repos.length} repos: ` +
      Object.entries(result)
        .filter(([k]) => k !== 'all')
        .map(([k, v]) => `${k}=${v.length}`)
        .join(', ')
  );

  return result;
}

/**
 * Get categorised projects formatted for resume use.
 * Returns top N projects per category, sorted by stars then recency.
 */
export function getResumeProjects(
  projects: CategorisedProjects,
  options?: { maxPerCategory?: number; categories?: string[] }
): ResumeProject[] {
  const max = options?.maxPerCategory ?? 3;
  const cats = options?.categories ?? ['web3', 'java', 'ai', 'frontend', 'python', 'devops'];

  const result: ResumeProject[] = [];

  for (const cat of cats) {
    const repos = (projects as Record<string, GitHubRepo[]>)[cat] || [];
    const sorted = [...repos].sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    for (const repo of sorted.slice(0, max)) {
      result.push(repoToResumeProject(repo, cat));
    }
  }

  return result;
}

/**
 * Build a text block of KEY PROJECTS from GitHub data, ready to append to a resume.
 */
export function buildProjectsSection(
  projects: CategorisedProjects,
  username: string,
  maxProjects = 8
): string {
  const resumeProjects = getResumeProjects(projects, { maxPerCategory: 2 });
  const top = resumeProjects.slice(0, maxProjects);

  if (top.length === 0) return '';

  const lines: string[] = [
    `KEY PROJECTS (GitHub: github.com/${username} - ${projects.all.length}+ repositories)`,
    '',
  ];

  for (const p of top) {
    lines.push(`• ${p.name}: ${p.description}`);
    if (p.technologies) lines.push(`  Technologies: ${p.technologies}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Default GitHub username used in the sample resume.
 */
export const DEFAULT_GITHUB_USERNAME = 'bhupenderkumar';
