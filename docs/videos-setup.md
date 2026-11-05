# Videos page deployment

The existing `/videos` route and navigation retain the site's theme. The configured channel is `UCuG7-r1F3b2RzGoRFIe0MnQ`; `gxpAlDUWIOQ` is a featured embed, visible even if the database is unavailable. Database entries with the same video ID are deduplicated. This featured item is configured in `src/lib/youtube.ts`, not deleted through the database admin list.

## Existing Supabase project

1. Confirm `drizzle/migrations/0000_create_videos_and_roles.sql` has been applied to the connected project. It creates `videos`, `user_roles`, and row-level-security policies. On a fresh project, apply that SQL once via the Supabase SQL editor; do not rerun it against existing tables.
2. Create/sign in to the intended admin account using Supabase Auth. From the trusted SQL editor, assign its actual Auth user UUID:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('REPLACE_WITH_ACTUAL_AUTH_USER_UUID'::uuid, 'admin')
   on conflict (user_id, role) do nothing;
   ```

   Never grant admin from the browser or expose a service-role key. Ordinary authenticated users cannot assign roles or write videos; RLS enforces admin access independently of the UI.
3. Enable YouTube Data API v3 in your Google Cloud project and store its restricted API key as the Supabase Edge Function secret `YOUTUBE_DATA_API_KEY`. Do not use a `VITE_` variable for this secret or commit it.
4. Deploy the `youtube-stats` Edge Function with the committed `supabase/config.toml`. It intentionally accepts public read-only requests without a user JWT and only serves this channel. A five-minute per-instance cache coalesces simultaneous requests; it is not a global rate limiter. Configure Google API quotas/alerts for your traffic.
5. Build and deploy the frontend through the site's existing hosting workflow. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` configured as before.

Visit `/videos/admin` to sign in. A verified admin sees Add Video on `/videos`, opening a dialog. Public visitors and ordinary signed-in users see no add button or form. Logging out or a failed role lookup removes access immediately. The existing admin page retains the video list and deletion controls.

## YouTube behavior

The official `platform.js` / `g-ytsubscribe` widget uses `data-layout="full"`. Google owns its authentication, subscription confirmation, and visual subscription state. It may open a new window: a no-popup, instant subscription cannot be promised. A `?sub_confirmation=1` link remains available as a fallback.

Stats refresh every five minutes while visible. Subscriber totals are rounded by YouTube to three significant figures; hidden/missing subscriber counts appear as a dash. Outages show an unavailable/last-update message, never fabricated counts. Standard YouTube iframes use the strict-origin-when-cross-origin referrer policy; YouTube determines which plays are valid views.

References: https://developers.google.com/youtube/subscribe and https://developers.google.com/youtube/v3/docs/channels#statistics

## Verification

Run `npm test`, `npx tsc --noEmit -p tsconfig.app.json`, and `npm run build`. Check anonymous, ordinary-user, admin, and post-sign-out states. Test a valid link, invalid link, duplicate link, database failure, missing stats key, widget blocked by the browser, and mobile widths. A live Google account and configured Supabase backend are required to verify real subscriptions and persistent inserts; mocked tests do not establish those integrations.
