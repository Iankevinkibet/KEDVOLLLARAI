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
    
    if (post.kind !== 'lesson' ||



















































































