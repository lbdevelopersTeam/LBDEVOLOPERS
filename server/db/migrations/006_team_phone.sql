-- Migration 006: Add phone number column to team_members
ALTER TABLE app.team_members ADD COLUMN IF NOT EXISTS phone varchar(30) NOT NULL DEFAULT '';
