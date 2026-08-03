# scripts/velocity

The OpenAlex generator and the direction math for the field-velocity
**idea vintage** instrument.

- `field_velocity_openalex.py` — queries OpenAlex and writes one CSV per focus
  area into `src/data/velocity/`. **This file is added unchanged from Lukas's
  working copy; it is not reconstructed here.** Run it yourself only if you have
  network access and an email to pass:

  ```
  python scripts/velocity/field_velocity_openalex.py \
    --search "content addressing|peer-to-peer network|censorship resistance|decentralized storage" \
    --from-year 2005 --email you@example.org \
    --out src/data/velocity/digital-human-rights.csv
  ```

  See `src/data/velocity/README.md` for the CSV contract and the frozen query
  strings per focus area.

- `vintage-direction.mjs` — the pure, inverted-direction helper. Falling median
  reference age = accelerating. Imported by the TS ingestion lib and by the test.
- `vintage-direction.test.mjs` — run with `npm test` (`node --test`).
