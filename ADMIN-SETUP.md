# KevDollarFX admin setup

The public site now links to the existing admin console at <https://kevdash-6fvsuiao.manus.space/> and reads only free rows whose `status` is `published` from the `content_posts` table in the `ezimeziapfagyyqbzmpi` Supabase project. Drafts and premium rows are not shown on the public pages.

## First owner account

1. Open the admin console and select **Need the first account? Create it**.
2. Create the owner account with the email address that should control the learning library. Complete email confirmation if Supabase requests it.
3. After the account has been created, add that account's Auth user ID to `public.admin_users` in Supabase. The ID is visible in Supabase under **Authentication → Users**.

The required SQL is:

```sql
insert into public.admin_users (user_id)
values ('AUTH_USER_UUID');
```

Replace `AUTH_USER_UUID` with the owner's real UUID. Do not place a password, service-role key, or other privileged credential in this repository.

Once the row exists, refresh the admin console. The owner can create lessons or blog posts, choose **Published**, and save. Free published records appear automatically on the home page and lessons page, with a detail page at `post.html?slug=...`. Premium records remain hidden until a paid-access flow is implemented.
