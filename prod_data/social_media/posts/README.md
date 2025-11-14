# Posts folder

This folder stores one Markdown file per post, organized by week for clarity and actionability.

Structure:

- posts/
  - weekly/
    - 2025-11-17/
      - post-000001-train-manners-eating.md
    - 2025-11-24/
      - post-000002-journey-card-overview.md
    - 2025-12-01/
      - post-000003-train-types-part-1.md
    - ... one folder per week (YYYY-MM-DD is the Monday week start)
  - _post-template.md

Conventions:

- ID format: POST-000001 (global, zero-padded). No yearly reset. Increment by one for each new post.
- Weekly folder: YYYY-MM-DD (Monday of that week). Create a new folder per week.
- Filename: post-<global-seq>-<slug>.md (slug is kebab-case)
- Front matter fields (at minimum):
  - id, title, theme, subtheme, status, week (sequential), week_start (YYYY-MM-DD), platforms, planned_dates, posted_dates, source

Workflow:

1) Create a new file from `_post-template.md` inside `posts/weekly/YYYY-MM-DD` for the target week.
2) Assign the next global ID (e.g., POST-000027) and update front matter.
3) Write Drafts per platform, then Final Copy.
4) After posting, fill posted_dates and add learnings.
5) Link the post from `inp_dump_ideas/PostsIDeas.md` in the Weekly Schedule table.
