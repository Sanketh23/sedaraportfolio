import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import config from '@config';
import favicon from '@images/favicon.svg';
import ogImage from '@images/og.png';

const Head = ({ metadata }) => {
  const title = metadata.title || config.siteTitle || 'Sanketh Edara';
  const description =
    metadata.description || config.siteDescription || 'Portfolio of Sanketh Edara.';
  const siteUrl = metadata.siteUrl || config.siteUrl || 'http://localhost:8000';
  const absoluteOgImage = `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      <html lang="en" prefix="og: http://ogp.me/ns#" />
      <title itemProp="name" lang="en">
        {title}
      </title>
      <link rel="icon" type="image/svg+xml" href={favicon} />
      <link rel="shortcut icon" href={favicon} />
      <link rel="canonical" href={siteUrl} />

      <meta name="description" content={description} />
      {config.siteKeywords && <meta name="keywords" content={config.siteKeywords} />}
      {config.googleVerification && (
        <meta name="google-site-verification" content={config.googleVerification} />
      )}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content={title} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content={config.siteLanguage || 'en_US'} />
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="image" content={absoluteOgImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      {config.twitterHandle && <meta name="twitter:site" content={config.twitterHandle} />}
      {config.twitterHandle && <meta name="twitter:creator" content={config.twitterHandle} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:image:alt" content={title} />

      <meta name="msapplication-TileColor" content={config.colors.navy} />
      <meta name="theme-color" content={config.colors.navy} />
    </Helmet>
  );
};

export default Head;

Head.propTypes = {
  metadata: PropTypes.object.isRequired,
};
