# Country research and economy tuning (LifeSim v0.2)

The simulator uses **country of birth** and **current country** separately. The country of birth stays in the character record. Current country affects annual job income, costs, education tuition, and property prices.

## Real-data research baseline

**Source:** World Bank FY2027 country income classifications (based on 2025 GNI per capita, Atlas method):
https://datahelpdesk.worldbank.org/knowledgebase/articles/906519-world-bank-country-and-lending-groups

Complementary dataset for context:
https://data.worldbank.org/indicator/NY.GDP.PCAP.CD

The World Bank income categories are **country-level classifications, not individual wages**. Per-capita GDP is **not** average salary. Neither indicator by itself can accurately determine housing, tuition, employment opportunities or whether a specific person can become wealthy.

**All numeric multipliers below are intentionally simplified *game-design estimates* relative to the fictional U.S. economy (1.00). They are NOT sourced country-specific pay figures, measured purchasing-power ratios, official cost-of-living indexes or predictions.** All money shown is a USD-equivalent in-game abstraction to avoid implying authentic local salaries or currency conversion.

| Birth country | World Bank FY2027 income tier | Game salary factor | Game living cost factor | Game house-price factor |
| --- | --- | ---: | ---: | ---: |
| United States | High income | 1.00 | 1.00 | 1.00 |
| Canada | High income | 0.80 | 0.88 | 1.12 |
| United Kingdom | High income | 0.78 | 0.88 | 1.05 |
| France | High income | 0.71 | 0.76 | 0.83 |
| Germany | High income | 0.82 | 0.79 | 0.89 |
| Italy | High income | 0.64 | 0.70 | 0.70 |
| Australia | High income | 0.87 | 0.91 | 1.08 |
| Japan | High income | 0.72 | 0.78 | 0.87 |
| Brazil | Upper middle income | 0.29 | 0.40 | 0.38 |
| Mexico | Upper middle income | 0.30 | 0.39 | 0.37 |
| Philippines | Upper middle income | 0.20 | 0.30 | 0.27 |
| South Africa | Upper middle income | 0.31 | 0.43 | 0.32 |
| India | Lower middle income | 0.16 | 0.28 | 0.26 |
| Nigeria | Lower middle income | 0.12 | 0.25 | 0.23 |
| Kenya | Lower middle income | 0.12 | 0.25 | 0.24 |
| Ethiopia | Low income | 0.08 | 0.20 | 0.20 |

For example, an entry-level role with fictional U.S. base salary $29,000 will have lower nominal USD-equivalent pay in Ethiopia. But that character also faces a lower (fictional) living-cost scale. A chosen talent, a college qualification, strong skills, career progression, and a move overseas can change outcomes. The intent is *different economic starting conditions without hard-locking anyone out of careers or success*.

## Country-dependent gameplay

- Salaries, property purchase prices and basic living expenses use different multipliers, not a single "rich/poor" stat.
- Tuition has a separate per-country balance figure.
- Royal birth is possible in select current monarchies represented in the game (United Kingdom, Canada, Australia, Japan). The royal career is fictional.
- The voluntary military gameplay is a broad abstraction; it is **not** a real country-by-country recruiting eligibility model.
- Overseas moves are deliberately simplified; visas, employment recognition and citizenship requirements are **not** yet simulated.
- Family background is independently randomized or optionally selected by the player. This is not a judgment about any person from a given country.
- The economic model is designed for **fun and balance**, not personal finance or international career advice.

## Accuracy and future research tasks

Before representing real local salaries, tuition, healthcare, purchasing power, visa rules, or national military service requirements as *facts*, verify them individually from official national sources with a date and a known methodology. Future versions should add differentiated regional labour markets, taxes, social programs, tuition access, cost-of-living/inflation series, and purchasing-power-based wage comparisons. Until then, keep the multipliers labeled as gameplay estimates.

## Version

Research categories checked against World Bank FY2027 listing, November 2026. The game world is a simplified fictional simulation rather than a representation of all real socioeconomic experiences.
