# Alt Text Tracker

A dashboard for visualizing The Michigan Daily's alternative text on images published since January 2023. At the beginning of every day, a Cloudflare Worker runs and collects data on the previous day's images, both with and without alt text.

The primary purpose of this project is intended to be used as an accessibility auditor for the editorial staff of The Michigan Daily.

## Developing

Install dependencies with `pnpm install`

To set up the local database, run `pnpm run init`. It may take a minute to fetch all the data.

Then, to open your local development environment, run

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Worker

Every day, the worker runs via a cron trigger and collects data on the previous day's usage of alt text.

To test the scheduled worker, run `pnpm run worker`. You can go to http://localhost:8787/__scheduled` to trigger the worker task.

To test daily slack notifications on the `alt-text-tracker` channel, create a .dev.vars file in the root of the directory, and add SLACK_WEBHOOK=\<your-webhook-here\>.

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.
