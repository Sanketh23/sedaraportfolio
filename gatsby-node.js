/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { buildFallbackData, fetchGitHubContributions } = require('./src/utils/githubContributions');

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type GitHubContributionDay {
      date: Date! @dateformat
      count: Int!
      level: Int!
      weekday: Int!
    }

    type GitHubContributionWeek {
      firstDay: Date! @dateformat
      contributionDays: [GitHubContributionDay!]!
    }

    type GitHubContributionGraph implements Node {
      rangeStart: Date! @dateformat
      rangeEnd: Date! @dateformat
      weeks: [GitHubContributionWeek!]!
    }
  `);
};

exports.sourceNodes = async ({ actions, createContentDigest, createNodeId, reporter }) => {
  const { createNode } = actions;
  const token = process.env.GITHUB_TOKEN;
  const fallbackData = buildFallbackData();
  const staticDataPath = path.resolve(__dirname, 'static', 'github-contributions.json');

  const createGraphNode = data => {
    fs.writeFileSync(staticDataPath, JSON.stringify(data));
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

  const result = await fetchGitHubContributions({
    token,
    username: 'Sanketh23',
  });

  if (!result.ok) {
    reporter.warn(`Unable to fetch GitHub contributions: ${result.error}`);
    createGraphNode(fallbackData);
    return;
  }

  createGraphNode(result.data);
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
