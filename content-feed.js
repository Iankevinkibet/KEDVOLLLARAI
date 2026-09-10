(function () {
  'use strict';

  // This is a public Supabase publishable key. Row-level security only exposes
  // rows whose status is "published"; no privileged key belongs in this file.
  var SUPABASE_URL = 'https://ezimeziapfagyyqbzmpi.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_jexD7dA8UHAANOn0NuIVtg_toAomwEC';
  var TABLE = SUPABASE_URL + '/rest/v1/content_posts';
  var SELECT = 'id,title,slug,kind,status,excerpt,content,cover_image_url,is_premium,published_at,updated_at';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return 'Published';
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Published';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  function labelFor(post) {
    return post.kind === 'lesson' ? 'Lesson' : 'Blog post';
  }

  function safeImageUrl(value) {
    if (!value) return '';
    try {
      var url = new URL(value, window.location.href);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function requestUrl(filters) {
    var url = new URL(TABLE);
    url.searchParams.set('select', SELECT);
    url.searchParams.set('status', 'eq.published');
    url.searchParams.set('order', 'published_at.desc.nullslast,updated_at.desc');
    url.searchParams.set('limit', String(filters.limit || 12));
    if (filters.kind) url.searchParams.set('kind', 'eq.' + filters.kind);
    if (filters.slug) url.searchParams.set('slug', 'eq.' + filters.slug);
    return url.href;
  }

  async function fetchPosts(filters) {
    var response = await fetch(requestUrl(filters), {
      headers: {
        // Modern sb_publishable_* keys are sent as the apikey header; they are
        // not JWTs and must not be placed in an Authorization bearer header.
        apikey: SUPABASE_PUBLISHABLE_KEY
      }
    });
    if (!response.ok) throw new Error('content request failed');
    return response.json();
  }

  function cardFor(post) {
    var premiumClass = post.is_premium ? ' content-feed-card--premium' : '';
    var summary = post.excerpt || String(post.content || '').slice(0, 150);
    return '<a class="content-feed-card' + premiumClass + '" href="post.html?slug=' + encodeURIComponent(post.slug) + '">' +
      '<div class="content-feed-card__meta"><span>' + escapeHtml(labelFor(post)) + '</span><span>' + escapeHtml(formatDate(post.published_at || post.updated_at)) + '</span></div>' +
      '<h3>' + escapeHtml(post.title) + '</h3>' +
      '<p>' + escapeHtml(summary) + '</p>' +
      '<span class="content-feed-card__arrow">Read piece →</span>' +
      '</a>';
  }

  function showFeedMessage(root, message, isError) {
    root.dataset.contentFeedState = isError ? 'error' : 'ready';
    var list = root.querySelector('[data-content-feed-list]');
    if (list) list.innerHTML = '<p class="content-feed-status">' + escapeHtml(message) + '</p>';
  }

  async function bootFeed(root) {
    var kind = root.dataset.contentFeed === 'lessons' ? 'lesson' : '';
    try {
      var posts = await fetchPosts({ limit: 12, kind: kind });
      var list = root.querySelector('[data-content-feed-list]');
      if (!list) return;
      if (!posts.length) {
        showFeedMessage(root, 'New published pieces will appear here soon.', false);
        return;
      }
      root.dataset.contentFeedState = 'ready';
      list.innerHTML = posts.map(cardFor).join('');
    } catch (error) {
      showFeedMessage(root, 'Live content is temporarily unavailable. The published library is still available above.', true);
    }
  }

  async function bootPost() {
    var shell = document.querySelector('[data-content-post]');
    if (!shell) return;
    var slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) {
      shell.innerHTML = '<a class="content-post-back" href="index.html">← Back to KevDollarFX</a><h1>Piece not found.</h1><p class="content-post-excerpt">Choose a published piece from the learning library.</p>';
      return;
    }
    try {
      var posts = await fetchPosts({ limit: 1, slug: slug });
      var post = posts[0];
      if (!post) throw new Error('missing post');
      var image = safeImageUrl(post.cover_image_url);
      shell.innerHTML = '<a class="content-post-back" href="index.html">← Back to KevDollarFX</a>' +
        '<div class="content-post-kicker">' + escapeHtml(labelFor(post)) + ' · ' + escapeHtml(formatDate(post.published_at || post.updated_at)) + '</div>' +
        '<h1>' + escapeHtml(post.title) + '</h1>' +
        (post.excerpt ? '<p class="content-post-excerpt">' + escapeHtml(post.excerpt) + '</p>' : '') +
        '<div class="content-post-body">' +
        (image ? '<img src="' + escapeHtml(image) + '" alt="">' : '') +
        '<p>' + escapeHtml(post.content).replace(/\r?\n/g, '<br>') + '</p>' +
        '</div>';
      document.title = post.title + ' — KevDollarFX';
    } catch (error) {
      shell.innerHTML = '<a class="content-post-back" href="index.html">← Back to KevDollarFX</a><h1>Piece not found.</h1><p class="content-post-excerpt">This piece may still be a draft or its link may have changed.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-content-feed]').forEach(bootFeed);
    bootPost();
  });
}());
