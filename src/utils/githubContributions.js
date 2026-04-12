const https = require('https');

const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const buildFallbackData = () => {
  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd);
  rangeStart.setFullYear(rangeEnd.getFullYear() - 1);

  return {
    rangeStart: rangeStart.toISOString().slice(0, 10),
    rangeEnd: rangeEnd.toISOString().slice(0, 10),
    weeks: [],
  };
};

const fetchGitHubContributions = async ({ token, username = 'Sanketh23' }) => {
  const fallbackData = buildFallbackData();

  if (!token) {
    return {
      ok: false,
      error: 'GITHUB_TOKEN is not set.',
      data: fallbackData,
    };
  }

  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd);
  rangeStart.setFullYear(rangeEnd.getFullYear() - 1);

  const body = JSON.stringify({
    query: `
      query ContributionGraph($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                firstDay
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                  weekday
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      username,
      from: rangeStart.toISOString(),
      to: rangeEnd.toISOString(),
    },
  });

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(
        'https://api.github.com/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            Authorization: `Bearer ${token}`,
            'User-Agent': 'seportfolio',
          },
        },
        res => {
          let raw = '';
          res.on('data', chunk => {
            raw += chunk;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`GitHub GraphQL request failed with status ${res.statusCode}`));
              return;
            }
            resolve(raw);
          });
        },
      );

      req.on('error', reject);
      req.write(body);
      req.end();
    });

    const parsed = JSON.parse(response);

    if (parsed.errors || !parsed.data || !parsed.data.user) {
      return {
        ok: false,
        error: 'GitHub contribution query returned an unexpected response.',
        data: fallbackData,
      };
    }

    const weeks =
      parsed.data.user.contributionsCollection.contributionCalendar.weeks.map(week => ({
        firstDay: week.firstDay,
        contributionDays: week.contributionDays.map(day => ({
          date: day.date,
          count: day.contributionCount,
          level: LEVEL_MAP[day.contributionLevel] || 0,
          weekday: day.weekday,
        })),
      })) || [];

    return {
      ok: true,
      data: {
        rangeStart: rangeStart.toISOString().slice(0, 10),
        rangeEnd: rangeEnd.toISOString().slice(0, 10),
        weeks,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      data: fallbackData,
    };
  }
};

module.exports = {
  buildFallbackData,
  fetchGitHubContributions,
};
