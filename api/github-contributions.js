const { fetchGitHubContributions } = require('../src/utils/githubContributions');

module.exports = async (req, res) => {
  const result = await fetchGitHubContributions({
    token: process.env.GITHUB_TOKEN,
    username: 'Sanketh23',
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  if (!result.ok) {
    res.statusCode = process.env.GITHUB_TOKEN ? 502 : 500;
    res.end(
      JSON.stringify({
        error: result.error,
        ...result.data,
      }),
    );
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify(result.data));
};
