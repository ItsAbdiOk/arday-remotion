# Auto-Post Setup Guide

Daily automated posting of Arday Word of the Day to Instagram and Facebook.

## Prerequisites

- A **Facebook Page** for Arday
- An **Instagram Business or Creator account** linked to that Facebook Page
- A **Meta Developer App** (free)

## Step 1: Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Business** type
4. Name it (e.g. "Arday Auto Post")
5. Under **Add Products**, add **Instagram Graph API** and **Pages API**

## Step 2: Get Your Page Access Token

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click **Generate Access Token**
4. Grant these permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
5. Copy the short-lived token
6. Exchange it for a long-lived token (valid ~60 days):

```bash
curl "https://graph.facebook.com/v21.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

7. Then get a **Page Access Token** from the long-lived user token:

```bash
curl "https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_LONG_LIVED_TOKEN"
```

This returns your Page ID and a Page Access Token that doesn't expire.

## Step 3: Find Your Instagram Business Account ID

```bash
curl "https://graph.facebook.com/v21.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_PAGE_TOKEN"
```

The response contains `instagram_business_account.id` — that's your IG Business Account ID.

## Step 4: Configure Credentials

### Local development

```bash
cp .env.example .env
```

Fill in your `.env`:

```
META_PAGE_ACCESS_TOKEN=your_page_access_token
META_PAGE_ID=123456789
INSTAGRAM_BUSINESS_ACCOUNT_ID=987654321
```

### GitHub Actions

Go to your repo **Settings** > **Secrets and variables** > **Actions** and add:

| Secret | Value |
|--------|-------|
| `META_PAGE_ACCESS_TOKEN` | Your Page Access Token |
| `META_PAGE_ID` | Your Page ID |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Your IG Business Account ID |

## Usage

### Dry run (render + preview, no posting)

```bash
npx ts-node scripts/auto-post.ts --dry-run
```

### Dry run with specific word

```bash
npx ts-node scripts/auto-post.ts --dry-run --index 0   # HELLO
npx ts-node scripts/auto-post.ts --dry-run --index 5   # WATER
```

### Post for real

```bash
npx ts-node scripts/auto-post.ts
```

### Skip rendering (use previously rendered image)

```bash
npx ts-node scripts/auto-post.ts --skip-render
```

## GitHub Actions

The workflow runs automatically at **8am UTC daily**.

To trigger manually:
1. Go to **Actions** tab in your repo
2. Select **Daily Word of the Day Post**
3. Click **Run workflow**
4. Optionally set a word index or enable dry run

## How the daily word is picked

The script uses `dayOfYear % 30` to cycle through the 30 words. This means:
- Jan 1 = word 1, Jan 2 = word 2, etc.
- The 30 words repeat every month
- Same word on the same calendar day every time

## Token refresh

The Page Access Token from Step 2 doesn't expire if obtained correctly (via the `me/accounts` endpoint with a long-lived user token). However, if it does expire, you'll need to repeat Step 2 and update the secret in GitHub.
