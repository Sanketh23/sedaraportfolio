/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');
const https = require('https');
const _ = require('lodash');

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type GitHubContributionDay {
      date: Date!
      count: Int!
      level: Int!
      weekday: Int!
    }

    type GitHubContributionWeek {
      firstDay: Date!
      contributionDays: [GitHubContributionDay!]!
    }

    type GitHubContributionGraph implements Node {
      rangeStart: Date!
      rangeEnd: Date!
      weeks: [GitHubContributionWeek!]!
    }
  `);
};

exports.sourceNodes = async ({ actions, createContentDigest, createNodeId, reporter }) => {
  const { createNode } = actions;
  const token = process.env.GITHUB_TOKEN;
  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd);
  rangeStart.setFullYear(rangeEnd.getFullYear() - 1);

  const fallbackData = {
    rangeStart: rangeStart.toISOString().slice(0, 10),
    rangeEnd: rangeEnd.toISOString().slice(0, 10),
    weeks: [],
  };

  const createGraphNode = data => {
    createNode({
      ...data,
      id: createNodeId(`github-contribution-graph`),
      parent: null,
      children: [],
      internal: {
        type: 'GitHubContributionGraph',
        contentDigest: createContentDigest(data),
      },
    });
  };

  if (!token) {
    reporter.warn(
      'GITHUB_TOKEN is not set. GitHub contribution grid will render empty until the token is available during build.',
    );
    createGraphNode(fallbackData);
    return;
  }

  const query = JSON.stringify({
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
      username: 'Sanketh23',
      from: rangeStart.toISOString(),
      to: rangeEnd.toISOString(),
    },
  });

  const response = await new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.github.com/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(query),
          Authorization: `Bearer ${token}`,
          'User-Agent': 'seportfolio',
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`GitHub GraphQL request failed with status ${res.statusCode}`));
            return;
          }
          resolve(body);
        });
      },
    );

    req.on('error', reject);
    req.write(query);
    req.end();
  }).catch(error => {
    reporter.warn(`Unable to fetch GitHub contributions: ${error.message}`);
    return null;
  });

  if (!response) {
    createGraphNode(fallbackData);
    return;
  }

  const parsed = JSON.parse(response);

  if (parsed.errors || !parsed.data || !parsed.data.user) {
    reporter.warn(
      'GitHub contribution query returned an unexpected response. Rendering empty grid.',
    );
    createGraphNode(fallbackData);
    return;
  }

  const weeks =
    parsed.data.user.contributionsCollection.contributionCalendar.weeks.map(week => ({
      firstDay: week.firstDay,
      contributionDays: week.contributionDays.map(day => ({
        date: day.date,
        count: day.contributionCount,
        level:
          {
            NONE: 0,
            FIRST_QUARTILE: 1,
            SECOND_QUARTILE: 2,
            THIRD_QUARTILE: 3,
            FOURTH_QUARTILE: 4,
          }[day.contributionLevel] || 0,
        weekday: day.weekday,
      })),
    })) || [];

  createGraphNode({
    rangeStart: rangeStart.toISOString().slice(0, 10),
    rangeEnd: rangeEnd.toISOString().slice(0, 10),
    weeks,
  });
};

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;
  const postTemplate = path.resolve(`src/templates/post.js`);
  const tagTemplate = path.resolve('src/templates/tag.js');

  const result = await graphql(`
    {
      postsRemark: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/posts/" } }
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
      tagsGroup: allMarkdownRemark(limit: 2000) {
        group(field: frontmatter___tags) {
          fieldValue
        }
      }
    }
  `);

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  // Create post detail pages
  const posts = result.data.postsRemark.edges;

  posts.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.slug,
      component: postTemplate,
      context: {},
    });
  });

  // Extract tag data from query
  const tags = result.data.tagsGroup.group;
  // Make tag pages
  tags.forEach(tag => {
    createPage({
      path: `/pensieve/tags/${_.kebabCase(tag.fieldValue)}/`,
      component: tagTemplate,
      context: {
        tag: tag.fieldValue,
      },
    });
  });
};

// https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#fixing-third-party-modules
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /scrollreveal/,
            use: loaders.null(),
          },
          {
            test: /animejs/,
            use: loaders.null(),
          },
        ],
      },
    });
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@fonts': path.resolve(__dirname, 'src/fonts'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
  });
};
