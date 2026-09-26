UPDATE app.blog_posts
SET cover_image_url = CASE slug
  WHEN 'engineering-for-velocity-why-speed-is-a-feature' THEN '/images/webdevolopmentservice.webp'
  WHEN 'the-aesthetic-of-technical-authority' THEN '/images/designwebsiteservice.png'
  ELSE cover_image_url
END
WHERE (slug = 'engineering-for-velocity-why-speed-is-a-feature' AND cover_image_url = 'https://picsum.photos/seed/velocity/800/500')
   OR (slug = 'the-aesthetic-of-technical-authority' AND cover_image_url = 'https://picsum.photos/seed/aesthetic/800/500');
