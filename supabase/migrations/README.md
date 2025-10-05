# Database Migrations

This directory contains database migration scripts for the ColabWize application.

## Applying Migrations

To apply migrations to your Supabase database, you can use the Supabase CLI:

```bash
supabase db push
```

Or you can run the SQL scripts directly in the Supabase SQL editor.

## Migration Files

1. `20251005140000_add_feature_votes_column.sql` - Adds the feature_votes column to the waitlist table to track which features users are interested in.