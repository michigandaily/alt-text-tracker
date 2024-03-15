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

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.
