# LifeSim

**LifeSim v0.2** is a free, original, offline-first, text-driven life simulator playable in a browser. It is inspired by the *genre* of life simulation—not a copy of another game's code, copyrighted writing, branding, assets, or paid content.

## Play online

GitHub Pages publishes the main branch from the repository root:

**https://dayzdrb.github.io/LifeSim/**

If deployment is processing, check [GitHub Actions](https://github.com/DayzdRB/LifeSim/actions). Pages deployment is managed in GitHub Settings → Pages.

Alternatively, open index.html locally. **No server, npm install, backend, API key or paid service is required.**

## How to play

1. Start a character. Randomize or select **country of birth**, **special talent**, and **family socioeconomic background** (including royal starts in selected monarchies).
2. **Age up** one year at a time. Read events and make decisions.
3. Use **Education** for trade programs, two-year, four-year, master's and doctoral programs. Pick your specific subject; completing a program builds relevant skills and unlocks jobs.
4. Use **Careers** to browse salaries and job requirements. Choose a specific role, enlist in the fictionalized military progression, build professional experience or create a business.
5. Use **Activities** to train technology, business, music, sports, art, acting or build a content audience. Special talents increase skill gains.
6. Use **Assets** to purchase homes (cash or mortgage), convert property to rentals, sell property, purchase cars, and buy music or art gear. Costs, rental income, mortgages, and depreciation update annually.
7. Use **Relationships** to build a family, date and marry. Your relationships also affect annual expenses and narrative events.
8. **Export** your JSON save periodically. Local saves are stored in the browser and can be deleted if site data is cleared.

## Career categories

The game includes everyday work, skilled trades, education, nursing, engineering, software development, journalism, science, management, CEO, military, DJ, musician, actor, visual artist, professional athlete, YouTuber/content creator, royal household and fictional underworld careers. Most have qualification and skill requirements; fame careers can grow into highly paid paths.

**Your decisions change later opportunities.** For example: graduating with a Computer Science degree increases technical skill; after gaining professional experience you can pursue better-paying leadership work. Musical talent plus instruments plus practice can lead to DJ work and recorded music royalties. Purchased property appreciates or depreciates, requires maintenance and may earn rent. Career criminal convictions can disqualify you from some professional roles.

## Country system / important accuracy disclaimer

The game supports the United States, Canada, United Kingdom, France, Germany, Italy, Australia, Japan, Brazil, Mexico, Philippines, South Africa, India, Nigeria, Kenya, and Ethiopia.

Country income classifications are based on [World Bank FY2027 country income groups](https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups); see also its [GDP per capita indicator](https://data.worldbank.org/indicator/NY.GDP.PCAP.CD). Salary, living cost, housing and tuition multipliers are **fictional gameplay estimates**, not real data on wages, standard of living, visa requirements or local prices. All cash is in simplified USD-equivalent game dollars. Birth country is remembered even if the character later emigrates.

See [country research and the full 16-country tuning table](docs/country-research.md).

## Running and testing

The game uses plain HTML, CSS and JavaScript (no build tool). To run automated Node 22+ tests:

~~~bash
npm test
~~~

GitHub Actions runs the same tests on each push. No packages need installing for tests.

Files:
- index.html — app shell and menus
- styles.css — responsive styling
- world.js — countries, talents, education subjects, jobs and item catalogs
- engine.js — simulation, actions, annual cash flow, qualifications, events and save migration
- ui.js — rendering and interaction handling
- test/simulation.test.cjs — engine regression tests
- docs/country-research.md — economic simulation assumptions and sources

## Scope and roadmap

**Implemented in v0.2:** character generation, stage-based aging, education pathways, selectable jobs, creative/fame careers, voluntary simplified military progression, property/vehicles/instruments, family, crime, royal starts, country-specific game balancing, annual economy, persistent effects and local save migration.

**Not yet implemented at full expansion depth:** investor stock portfolios, in-depth landlord tenant management, a complete black-market system, cult/organization management, espionage missions, zoo management, advanced political careers, full generational inheritance, challenge vault and time reversal. These are planned as **free** base-game features; the project has no DLC pricing or paywall.

## Saving

Saves use browser localStorage under lifesim-v2. Existing lifesim-v1 saves are upgraded automatically the first time the new version loads. Export your current life before starting a different one. Clearing site data erases local saves.

## Originality

This is an independently authored educational project. It does not contain another game's source, assets, dialogue, logos, or paid packages.
