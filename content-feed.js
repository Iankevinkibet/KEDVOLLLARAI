(function () {
  'use strict';

  // This is a public Supabase publishable key. Row-level security only exposes
  // rows whose status is "published"; no privileged key belongs in this file.
  var SUPABASE_URL = 'https://ezimeziapfagyyqbzmpi.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6aW1lemlhcGZhZ3l5cWJ6bXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjQ1NzIsImV4cCI6MjEwNDYwMDU3Mn0.iSUk9jB7VGQiqCvrjmZIJFd7BS14vdiIpPOt7u1fPI4';
  var TABLE = SUPABASE_URL + '/rest/v1/content_posts';
  var SELECT = 'id,title,slug,kind,status,excerpt,content,cover_image_url,pdf_url,pdf_name,quiz,is_premium,published_at,updated_at';

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

  function safeDownloadUrl(value) {
    return safeImageUrl(value);
  }

  function requestUrl(filters) {
    var url = new URL(TABLE);
    url.searchParams.set('select', SELECT);
    url.searchParams.set('status', 'eq.published');
    // Do not expose legacy published rows without a public URL. Those rows
    // render as post.html?slug= and produce the "Piece not found" screen.
    if (filters.slug) url.searchParams.set('slug', 'eq.' + filters.slug);
    else {
      url.searchParams.set('slug', 'not.is.null');
      url.searchParams.append('slug', 'neq.');
    }
    url.searchParams.set('order', 'published_at.desc.nullslast,updated_at.desc');
    url.searchParams.set('limit', String(filters.limit || 12));
    if (filters.kind) url.searchParams.set('kind', 'eq.' + filters.kind);
    if (filters.slug) url.searchParams.set('slug', 'eq.' + filters.slug);
    return url.href;
  }

  async function fetchPosts(filters) {
    var response = await fetch(requestUrl(filters), {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY
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

  function quizMarkup(post) {
    if (post.kind !== 'lesson' || !post.quiz || !post.quiz.question || !Array.isArray(post.quiz.choices) || !post.quiz.choices.length) return '';
    var choices = post.quiz.choices.map(function (choice, index) {
      var label = typeof choice === 'string' ? choice : choice.text;
      return '<button type="button" class="lesson-quiz-choice" data-quiz-choice="' + index + '">' + escapeHtml(label || ('Choice ' + (index + 1))) + '</button>';
    }).join('');
    return '<section class="lesson-quiz" data-lesson-quiz><div class="content-post-kicker">KNOWLEDGE CHECK</div><h2>' + escapeHtml(post.quiz.question) + '</h2><div class="lesson-quiz-choices">' + choices + '</div><p class="lesson-quiz-result" data-quiz-result aria-live="polite"></p></section>';
  }

  function attachQuiz(shell, post) {
    var quiz = shell.querySelector('[data-lesson-quiz]');
    if (!quiz || !post.quiz) return;
    var result = quiz.querySelector('[data-quiz-result]');
    quiz.querySelectorAll('[data-quiz-choice]').forEach(function (button) {
      button.addEventListener('click', function () {
        var index = Number(button.getAttribute('data-quiz-choice'));
        var choice = post.quiz.choices[index];
        var correct = typeof choice === 'object' && choice.correct === true;
        if (!correct && typeof post.quiz.answer === 'number') correct = index === post.quiz.answer;
        quiz.querySelectorAll('.lesson-quiz-choice').forEach(function (item) { item.classList.remove('is-correct','is-selected'); });
        button.classList.add('is-selected');
        if (correct) { button.classList.add('is-correct'); result.textContent = 'Correct. Keep building the reasoning, not just the answer.'; result.className = 'lesson-quiz-result is-correct'; }
        else { result.textContent = 'Not quite. Re-read the lesson and try again.'; result.className = 'lesson-quiz-result is-wrong'; }
      });
    });
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
      var pdf = safeDownloadUrl(post.pdf_url);
      var pdfLink = pdf ? '<a class="content-post-download" href="' + escapeHtml(pdf) + '" download target="_blank" rel="noopener">Download educational PDF' + (post.pdf_name ? ': ' + escapeHtml(post.pdf_name) : '') + ' ↓</a>' : '';
      shell.innerHTML = '<a class="content-post-back" href="index.html">← Back to KevDollarFX</a>' +
        '<div class="content-post-kicker">' + escapeHtml(labelFor(post)) + ' · ' + escapeHtml(formatDate(post.published_at || post.updated_at)) + '</div>' +
        '<h1>' + escapeHtml(post.title) + '</h1>' +
        (post.excerpt ? '<p class="content-post-excerpt">' + escapeHtml(post.excerpt) + '</p>' : '') +
        '<div class="content-post-body">' +
        (image ? '<img src="' + escapeHtml(image) + '" alt="">' : '') +
        '<p>' + escapeHtml(post.content).replace(/\r?\n/g, '<br>') + '</p>' +
        pdfLink +
        quizMarkup(post) +
        '</div>';
      attachQuiz(shell, post);
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
