/**
 * Cloudflare Worker — GitHub API Proxy
 * Sits between anshumanbahekar.github.io and api.github.com
 * Token lives here in Cloudflare env vars, never exposed to browser
 *
 * Deploy: wrangler deploy
 * Set secret: wrangler secret put GITHUB_TOKEN
 */

const ALLOWED_ORIGIN = 'https://anshumanbahekar.github.io';
const GH_USER = 'anshumanbahekar';

// CORS headers
function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin?.includes('localhost') || origin?.includes('127.0.0.1');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // cache 5 mins
      ...corsHeaders(origin),
    },
  });
}

// GitHub REST API helper
async function ghREST(path, token) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'anshumanbahekar-portfolio',
    },
  });
  if (!res.ok) throw new Error(`GitHub REST ${path} → ${res.status}`);
  return res.json();
}

// GitHub GraphQL API helper
async function ghGraphQL(query, variables = {}, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'anshumanbahekar-portfolio',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL → ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ── ROUTES ────────────────────────────────────────────────────────────────

async function handleProfile(token) {
  const [user, repos] = await Promise.all([
    ghREST(`/users/${GH_USER}`, token),
    ghREST(`/users/${GH_USER}/repos?per_page=100&sort=updated`, token),
  ]);

  // Language breakdown by repo count
  const langs = {};
  let totalStars = 0, totalForks = 0;
  repos.forEach(r => {
    if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
    totalStars += r.stargazers_count || 0;
    totalForks += r.forks_count || 0;
  });

  const totalWithLang = Math.max(Object.values(langs).reduce((a, b) => a + b, 0), 1);
  const langsSorted = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, pct: Math.round(count / totalWithLang * 100) }));

  return {
    name: user.name,
    bio: user.bio,
    location: user.location,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
    avatarUrl: user.avatar_url,
    totalStars,
    totalForks,
    langs: langsSorted,
    recentRepos: repos.slice(0, 6).map(r => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      url: r.html_url,
      updatedAt: r.updated_at,
    })),
  };
}

async function handleContributions(token) {
  // GraphQL query — gets real contribution calendar including private repos
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
          contributionStreak: contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
        streakStats: contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const data = await ghGraphQL(query, {
    login: GH_USER,
    from: oneYearAgo.toISOString(),
    to: now.toISOString(),
  }, token);

  const col = data.user.contributionsCollection;
  const weeks = col.contributionStreak.weeks;

  // Build day map: date → count
  const dayMap = {};
  weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      dayMap[day.date] = day.contributionCount;
    });
  });

  // Compute current streak
  const sortedDates = Object.keys(dayMap).sort().reverse();
  let streak = 0;
  for (const date of sortedDates) {
    if (dayMap[date] > 0) streak++;
    else break;
  }

  // Longest streak
  let longestStreak = 0, cur = 0;
  Object.keys(dayMap).sort().forEach(date => {
    if (dayMap[date] > 0) { cur++; longestStreak = Math.max(longestStreak, cur); }
    else cur = 0;
  });

  return {
    totalContributions: col.contributionStreak.totalContributions,
    totalCommits: col.totalCommitContributions,
    totalIssues: col.totalIssueContributions,
    totalPRs: col.totalPullRequestContributions,
    totalReviews: col.totalPullRequestReviewContributions,
    currentStreak: streak,
    longestStreak,
    dayMap,
  };
}

async function handleEvents(token) {
  const events = await ghREST(
    `/users/${GH_USER}/events?per_page=100`,
    token
  );

  const activity = [];
  const seenRepos = new Set();

  events.forEach(e => {
    const repo = e.repo?.name?.replace(`${GH_USER}/`, '') || 'repo';
    const date = new Date(e.created_at);
    const ago = getTimeAgo(date);

    if (e.type === 'PushEvent' && !seenRepos.has(repo)) {
      seenRepos.add(repo);
      const commits = (e.payload?.commits || []).length;
      activity.push({ type: 'push', repo, commits, ago, date: e.created_at });
    } else if (e.type === 'CreateEvent') {
      activity.push({ type: 'create', repo, ago, date: e.created_at });
    } else if (e.type === 'WatchEvent') {
      activity.push({ type: 'star', repo, ago, date: e.created_at });
    } else if (e.type === 'PullRequestEvent') {
      activity.push({ type: 'pr', repo, ago, date: e.created_at });
    } else if (e.type === 'IssuesEvent') {
      activity.push({ type: 'issue', repo, ago, date: e.created_at });
    }
  });

  return { activity: activity.slice(0, 10) };
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only GET
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    const token = env.GITHUB_TOKEN;
    if (!token) {
      return jsonResponse({ error: 'Token not configured' }, 500, origin);
    }

    try {
      const route = url.pathname;

      if (route === '/github/profile') {
        const data = await handleProfile(token);
        return jsonResponse(data, 200, origin);
      }

      if (route === '/github/contributions') {
        const data = await handleContributions(token);
        return jsonResponse(data, 200, origin);
      }

      if (route === '/github/events') {
        const data = await handleEvents(token);
        return jsonResponse(data, 200, origin);
      }

      if (route === '/github/all') {
        // Fetch everything in parallel
        const [profile, contributions, events] = await Promise.all([
          handleProfile(token),
          handleContributions(token),
          handleEvents(token),
        ]);
        return jsonResponse({ profile, contributions, events }, 200, origin);
      }

      return jsonResponse({ error: 'Not found', routes: ['/github/all', '/github/profile', '/github/contributions', '/github/events'] }, 404, origin);

    } catch (err) {
      console.error(err);
      return jsonResponse({ error: err.message }, 500, origin);
    }
  },
};
