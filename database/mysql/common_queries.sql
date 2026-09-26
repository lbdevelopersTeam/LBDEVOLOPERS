-- Common MySQL 8.0 query library for the portfolio schema.
-- Replace the example @variables (or bind equivalent prepared-statement parameters)
-- in application code. All public queries explicitly exclude soft-deleted rows.

SET SESSION time_zone = '+00:00';

-- ============================
-- 1. Featured projects with their skills
-- ============================
SELECT
    p.id,
    p.title,
    p.slug,
    p.short_description,
    p.thumbnail_url,
    p.live_url,
    c.name AS category,
    GROUP_CONCAT(s.name ORDER BY ps.sort_order SEPARATOR ', ') AS skills
FROM projects AS p
JOIN project_categories AS c
    ON c.id = p.category_id
   AND c.is_active = TRUE
   AND c.deleted_at IS NULL
LEFT JOIN project_skills AS ps ON ps.project_id = p.id
LEFT JOIN skills AS s
    ON s.id = ps.skill_id
   AND s.deleted_at IS NULL
WHERE p.status = 'published'
  AND p.is_featured = TRUE
  AND p.deleted_at IS NULL
GROUP BY p.id, p.title, p.slug, p.short_description, p.thumbnail_url, p.live_url, c.name
ORDER BY p.sort_order, p.id;

-- ============================
-- 2. Published projects by category with offset pagination
-- Replace the variables with bound parameters; keep a stable id tiebreaker.
-- ============================
SET @category_slug = 'web-applications';
SELECT
    p.id, p.title, p.slug, p.short_description, p.thumbnail_url,
    p.is_featured, p.view_count, c.name AS category
FROM projects AS p
JOIN project_categories AS c ON c.id = p.category_id
WHERE c.slug = @category_slug
  AND c.is_active = TRUE
  AND c.deleted_at IS NULL
  AND p.status = 'published'
  AND p.deleted_at IS NULL
ORDER BY p.sort_order, p.id
LIMIT 9 OFFSET 0;

-- ============================
-- 3. Complete project detail in one round trip
-- JSON objects include sort_order so the application can preserve display order.
-- ============================
SET @project_slug = 'atlas-client-portal';
SELECT
    p.*,
    c.name AS category_name,
    c.slug AS category_slug,
    COALESCE(gallery.images, JSON_ARRAY()) AS images,
    COALESCE(stack.skills, JSON_ARRAY()) AS skills
FROM projects AS p
JOIN project_categories AS c
    ON c.id = p.category_id
   AND c.deleted_at IS NULL
LEFT JOIN (
    SELECT
        pi.project_id,
        JSON_ARRAYAGG(JSON_OBJECT(
            'id', pi.id,
            'url', pi.image_url,
            'altText', pi.alt_text,
            'caption', pi.caption,
            'width', pi.width,
            'height', pi.height,
            'sortOrder', pi.sort_order
        )) AS images
    FROM project_images AS pi
    WHERE pi.deleted_at IS NULL
    GROUP BY pi.project_id
) AS gallery ON gallery.project_id = p.id
LEFT JOIN (
    SELECT
        ps.project_id,
        JSON_ARRAYAGG(JSON_OBJECT(
            'id', s.id,
            'name', s.name,
            'slug', s.slug,
            'category', s.category,
            'sortOrder', ps.sort_order
        )) AS skills
    FROM project_skills AS ps
    JOIN skills AS s
        ON s.id = ps.skill_id
       AND s.deleted_at IS NULL
    GROUP BY ps.project_id
) AS stack ON stack.project_id = p.id
WHERE p.slug = @project_slug
  AND p.status = 'published'
  AND p.deleted_at IS NULL
LIMIT 1;

-- ============================
-- 4. Combined experience and education timeline
-- ============================
SELECT timeline.*
FROM (
    SELECT
        'experience' AS entry_type,
        e.id,
        e.company AS organization,
        e.job_title AS title,
        e.start_date,
        e.end_date,
        e.is_current,
        e.description,
        e.sort_order
    FROM experiences AS e
    WHERE e.deleted_at IS NULL

    UNION ALL

    SELECT
        'education' AS entry_type,
        ed.id,
        ed.institution AS organization,
        CONCAT_WS(' — ', ed.degree, ed.field_of_study) AS title,
        ed.start_date,
        ed.end_date,
        FALSE AS is_current,
        ed.description,
        ed.sort_order
    FROM education_entries AS ed
    WHERE ed.deleted_at IS NULL
) AS timeline
ORDER BY timeline.start_date DESC, timeline.sort_order, timeline.id;

-- ============================
-- 5. Skills grouped for the public skills section
-- ============================
SELECT
    category,
    JSON_ARRAYAGG(JSON_OBJECT(
        'id', id,
        'name', name,
        'slug', slug,
        'proficiency', proficiency_level,
        'iconUrl', icon_url,
        'featured', is_featured,
        'sortOrder', sort_order
    )) AS skills
FROM skills
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY FIELD(category, 'frontend', 'backend', 'database', 'devops', 'tools', 'soft-skill');

-- ============================
-- 6. Published blog index with tag names and pagination
-- ============================
SELECT
    bp.id, bp.title, bp.slug, bp.excerpt, bp.cover_image_url,
    bp.published_at, bp.reading_time_minutes, bp.view_count,
    GROUP_CONCAT(bt.name ORDER BY bt.name SEPARATOR ', ') AS tags
FROM blog_posts AS bp
LEFT JOIN blog_post_tags AS bpt ON bpt.blog_post_id = bp.id
LEFT JOIN blog_tags AS bt
    ON bt.id = bpt.blog_tag_id
   AND bt.deleted_at IS NULL
WHERE bp.status = 'published'
  AND bp.deleted_at IS NULL
  AND bp.published_at <= UTC_TIMESTAMP()
GROUP BY bp.id, bp.title, bp.slug, bp.excerpt, bp.cover_image_url,
         bp.published_at, bp.reading_time_minutes, bp.view_count
ORDER BY bp.published_at DESC, bp.id DESC
LIMIT 10 OFFSET 0;

-- ============================
-- 7. Full blog post with tags
-- ============================
SET @blog_slug = 'designing-portfolio-databases-that-age-well';
SELECT
    bp.id, bp.title, bp.slug, bp.excerpt, bp.content, bp.cover_image_url,
    bp.published_at, bp.reading_time_minutes, bp.view_count,
    bp.meta_title, bp.meta_description,
    u.name AS author_name,
    COALESCE(tag_data.tags, JSON_ARRAY()) AS tags
FROM blog_posts AS bp
LEFT JOIN users AS u
    ON u.id = bp.author_id
   AND u.deleted_at IS NULL
LEFT JOIN (
    SELECT
        bpt.blog_post_id,
        JSON_ARRAYAGG(JSON_OBJECT('id', bt.id, 'name', bt.name, 'slug', bt.slug)) AS tags
    FROM blog_post_tags AS bpt
    JOIN blog_tags AS bt
        ON bt.id = bpt.blog_tag_id
       AND bt.deleted_at IS NULL
    GROUP BY bpt.blog_post_id
) AS tag_data ON tag_data.blog_post_id = bp.id
WHERE bp.slug = @blog_slug
  AND bp.status = 'published'
  AND bp.deleted_at IS NULL
  AND bp.published_at <= UTC_TIMESTAMP()
LIMIT 1;

-- ============================
-- 8. Most-viewed published blog posts
-- ============================
SELECT id, title, slug, excerpt, view_count, published_at
FROM blog_posts
WHERE status = 'published'
  AND deleted_at IS NULL
  AND published_at <= UTC_TIMESTAMP()
ORDER BY view_count DESC, published_at DESC, id DESC
LIMIT 5;

-- ============================
-- 9. Unread contact-message inbox
-- ============================
SELECT
    id, name, email, subject, message,
    INET6_NTOA(ip_address) AS ip_address,
    submitted_at
FROM contact_messages
WHERE is_read = FALSE
  AND deleted_at IS NULL
ORDER BY submitted_at ASC, id ASC;

-- ============================
-- 10. Approved and featured testimonials
-- ============================
SELECT
    id, author_name, author_role, author_company,
    author_avatar_url, message, rating
FROM testimonials
WHERE is_approved = TRUE
  AND is_featured = TRUE
  AND deleted_at IS NULL
ORDER BY sort_order, id;

-- ============================
-- 11. Active social links
-- ============================
SELECT id, platform, url, icon
FROM social_links
WHERE is_active = TRUE
  AND deleted_at IS NULL
ORDER BY sort_order, platform;

-- ============================
-- 12. All public site settings as key/value rows
-- Parse and validate values according to value_type in the application.
-- ============================
SELECT setting_key, setting_value, value_type
FROM site_settings
WHERE is_public = TRUE
  AND deleted_at IS NULL
ORDER BY setting_key;

-- ============================
-- 13. Top content by raw views in the last 30 days
-- ============================
SELECT
    pv.page_type,
    COALESCE(p.title, bp.title, pv.page_path) AS content_title,
    COALESCE(p.slug, bp.slug, pv.page_path) AS content_key,
    COUNT(*) AS views,
    COUNT(DISTINCT pv.visitor_hash) AS approximate_unique_visitors
FROM page_views AS pv
LEFT JOIN projects AS p ON p.id = pv.project_id
LEFT JOIN blog_posts AS bp ON bp.id = pv.blog_post_id
WHERE pv.viewed_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY
GROUP BY pv.page_type, content_title, content_key
ORDER BY views DESC, content_title
LIMIT 20;

-- ============================
-- 14. Admin dashboard summary counts
-- ============================
SELECT
    (SELECT COUNT(*) FROM projects WHERE status = 'published' AND deleted_at IS NULL) AS published_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'draft' AND deleted_at IS NULL) AS draft_projects,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'published' AND deleted_at IS NULL) AS published_posts,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'draft' AND deleted_at IS NULL) AS draft_posts,
    (SELECT COUNT(*) FROM contact_messages WHERE is_read = FALSE AND deleted_at IS NULL) AS unread_messages,
    (SELECT COUNT(*) FROM testimonials WHERE is_approved = FALSE AND deleted_at IS NULL) AS pending_testimonials,
    (SELECT COUNT(*) FROM page_views WHERE viewed_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY) AS views_last_30_days;

-- ============================
-- 15. Full-text search across published projects and blog posts
-- ============================
SET @search_query = 'database performance';
SELECT search_results.*
FROM (
    SELECT
        'project' AS result_type,
        p.id,
        p.title,
        p.slug,
        p.short_description AS summary,
        MATCH(p.title, p.short_description, p.full_description)
            AGAINST (@search_query IN NATURAL LANGUAGE MODE) AS relevance
    FROM projects AS p
    WHERE p.status = 'published'
      AND p.deleted_at IS NULL
      AND MATCH(p.title, p.short_description, p.full_description)
          AGAINST (@search_query IN NATURAL LANGUAGE MODE)

    UNION ALL

    SELECT
        'blog_post' AS result_type,
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt AS summary,
        MATCH(bp.title, bp.excerpt, bp.content)
            AGAINST (@search_query IN NATURAL LANGUAGE MODE) AS relevance
    FROM blog_posts AS bp
    WHERE bp.status = 'published'
      AND bp.deleted_at IS NULL
      AND bp.published_at <= UTC_TIMESTAMP()
      AND MATCH(bp.title, bp.excerpt, bp.content)
          AGAINST (@search_query IN NATURAL LANGUAGE MODE)
) AS search_results
ORDER BY search_results.relevance DESC, search_results.title
LIMIT 20;
