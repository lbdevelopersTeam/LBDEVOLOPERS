ALTER TABLE app.users
  ADD COLUMN username varchar(64);

UPDATE app.users
SET username = 'user-' || substr(md5(id), 1, 12)
WHERE username IS NULL;

ALTER TABLE app.users
  ALTER COLUMN username SET NOT NULL,
  ADD CONSTRAINT users_username_format_check
    CHECK (username ~ '^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$');

CREATE UNIQUE INDEX users_username_unique
  ON app.users (lower(username))
  WHERE deleted_at IS NULL;
