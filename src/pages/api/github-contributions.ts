import type { APIRoute } from 'astro';

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const GITHUB_USERNAME = 'ssbg04';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface FormattedResponse {
  total: {
    lastYear: number;
  };
  contributions: ContributionDay[];
  source: 'github-graphql-pat' | 'fallback-api';
}

// In-memory cache to prevent re-fetching on rapid visitor hits (re-fetch at most once every 30 minutes)
let cachedData: FormattedResponse | null = null;
let cachedAt = 0;
const CACHE_MS = 30 * 60 * 1000; // 30 minutes

function mapQuartileToLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case 'FOURTH_QUARTILE':
      return 4;
    case 'THIRD_QUARTILE':
      return 3;
    case 'SECOND_QUARTILE':
      return 2;
    case 'FIRST_QUARTILE':
      return 1;
    case 'NONE':
    default:
      return 0;
  }
}

// Direct GitHub GraphQL fetch using Personal Access Token (PAT)
async function fetchViaGitHubGraphQL(token: string, username: string): Promise<FormattedResponse | null> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Astro-Portfolio-App'
    },
    body: JSON.stringify({
      query,
      variables: { login: username }
    })
  });

  if (!res.ok) {
    console.error('[GitHub Contributions] GraphQL HTTP error:', res.status, await res.text());
    return null;
  }

  const json = await res.json();
  const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar || !calendar.weeks) {
    console.error('[GitHub Contributions] Unexpected GraphQL data structure:', json);
    return null;
  }

  const contributions: ContributionDay[] = [];
  for (const week of calendar.weeks) {
    if (Array.isArray(week.contributionDays)) {
      for (const day of week.contributionDays) {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: mapQuartileToLevel(day.contributionLevel)
        });
      }
    }
  }

  return {
    total: {
      lastYear: calendar.totalContributions || 0
    },
    contributions,
    source: 'github-graphql-pat'
  };
}

// Fallback provider if PAT is missing or rate limited
async function fetchViaFallback(username: string): Promise<FormattedResponse | null> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
  if (!res.ok) return null;

  const data = await res.json();
  return {
    total: {
      lastYear: data?.total?.lastYear ?? 0
    },
    contributions: data?.contributions ?? [],
    source: 'fallback-api'
  };
}

export const GET: APIRoute = async ({ request }) => {
  const now = Date.now();

  // Return cached data if fresh
  if (cachedData && now - cachedAt < CACHE_MS) {
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400'
      }
    });
  }

  const url = new URL(request.url);
  const username = url.searchParams.get('username') || GITHUB_USERNAME;

  let result: FormattedResponse | null = null;

  // 1. Try direct GitHub GraphQL with PAT if token is provided
  if (GITHUB_TOKEN) {
    try {
      result = await fetchViaGitHubGraphQL(GITHUB_TOKEN, username);
    } catch (error) {
      console.error('[GitHub Contributions PAT Error]:', error);
    }
  }

  // 2. If PAT not available or failed, fallback gracefully
  if (!result) {
    try {
      result = await fetchViaFallback(username);
    } catch (fallbackError) {
      console.error('[GitHub Contributions Fallback Error]:', fallbackError);
    }
  }

  if (result) {
    cachedData = result;
    cachedAt = now;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400'
      }
    });
  }

  return new Response(
    JSON.stringify({ error: 'Failed to retrieve GitHub contributions data' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
};
