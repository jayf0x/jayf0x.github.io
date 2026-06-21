# site

Personal site — project browser and portfolio. Built with React + Vite, deployed to GitHub Pages.

Live: https://jayf0x.github.io/

## Dev

```sh
bun install
bun dev
```

## Deploy

Triggered manually via GitHub Actions (`workflow_dispatch`):

```sh
bash scripts/deploy-site.sh
```

Or via the [Actions tab](../../actions/workflows/deploy.yml).

## Security scanning

[opengrep](https://github.com/opengrep/opengrep) runs on every deploy (blocked on `ERROR` severity findings). Rules live in [`.opengrep/rules.yml`](.opengrep/rules.yml).

Run locally:

```sh
bash scripts/opengrep-scan.sh
```
