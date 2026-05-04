export default {
  async fetch(request) {
    const FALLBACK_BASE = 'https://youtu.be/ldZXyauy9fo?si=NaBsl_kVJDXm2DgU';
    const SITE_NAME = 'Drivemaster';
    const SHARE_TITLE = 'ALL TYPES of Parking in ONE Video! Parallel/Straight/Angle Parking';
    const DESCRIPTION = 'See details here';
    const SHARE_IMAGE = 'https://img.youtube.com/vi/ldZXyauy9fo/maxres1.jpg';
    const ICON_DATA_URL =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23ffffff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-weight='700' font-size='42' fill='%230050ff'%3Em%3C/text%3E%3C/svg%3E";

    const requestUrl = new URL(request.url);
    if (requestUrl.pathname !== '/') {
      return fetch(request);
    }

    const searchParams = requestUrl.searchParams;

    const fallbackUrl = new URL(FALLBACK_BASE);
    searchParams.forEach((value, key) => {
      fallbackUrl.searchParams.set(key, value);
    });

    const hasFbclid = searchParams.has('fbclid');
    const shareTitle = decodeTitle(searchParams, requestUrl.search) || SHARE_TITLE;
    const message = SITE_NAME;

    if (hasFbclid) {
      return new Response(null, {
        status: 302,
        headers: {
          location: fallbackUrl.toString(),
          'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    const html = renderWaitingHtml({
      pageTitle: SITE_NAME,
      shareTitle,
      description: DESCRIPTION,
      image: SHARE_IMAGE,
      icon: ICON_DATA_URL,
      message,
      pageUrl: requestUrl.toString(),
      siteName: SITE_NAME,
    });

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
        'x-frame-options': 'DENY',
      },
    });
  },
};

function decodeTitle(params, rawSearch) {
  const explicit = params.get('title');
  if (explicit) {
    return explicit.trim();
  }

  const raw = rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch;
  if (!raw) {
    return '';
  }

  if (!raw.includes('=')) {
    try {
      return decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
    } catch (err) {
      return raw.trim();
    }
  }

  return '';
}

function escapeHtml(input) {
  return input.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

function renderWaitingHtml({ pageTitle, shareTitle, description, image, icon, message, pageUrl, siteName }) {
  const safePageTitle = escapeHtml(pageTitle);
  const safeShareTitle = escapeHtml(shareTitle);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeMessage = escapeHtml(message);
  const safeUrl = escapeHtml(pageUrl);
  const safeSiteName = escapeHtml(siteName);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${safePageTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${safeDescription}">
    <meta property="og:title" content="${safeShareTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${safeSiteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeShareTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${safeImage}">
    <link rel="icon" href="${icon}">
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #fff;
        color: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 24px;
      }
      p {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <p>${safeMessage}</p>
  </body>
</html>`;
}
