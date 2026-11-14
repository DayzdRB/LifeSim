# LifeSim

An original, free, offline-first browser life simulator. All systems are designed to become part of one free base game; this first version is the playable foundation, not the completed expansion catalog.

## Run

Open `index.html` in a browser. No npm, hosting, server, account, or build step required.

## Features in v0.1

Randomized characters, age-up, health/happiness/smarts/looks, education, careers, life-stage actions, conditional choice events, family relationships, bank balance, annual income and spending, retirement, death summaries, auto-save, save export/import, and new lives.

## Hosting

This repo is **private**. For free GitHub Pages on a personal GitHub account, make it public, then Settings → Pages → Deploy from branch → `main` / root. The website is not live until you enable deployment.

## Future systems (not implemented yet)

Investor, Landlord, Black Market, Cult/Organizations, Secret Agent, Zoo, all special career packs, Time Machine, God Mode/sandbox and challenge vault. Planned as free built-in modules.

## Structure

- `index.html`: app markup
- `styles.css`: responsive design
- `game.js`: event engine, game logic, persistence and UI

The game runs entirely in the browser and stores saves in localStorage. Export backups; clearing site data can erase saves.
