# Verification record

Validated in the managed cloud environment on 27–28 October 2026:

| Check                   | Result                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Reproducible setup      | `bash scripts/setup.sh` passed with `npm ci` and verified MongoDB preparation; existing config preserved    |
| Seed repeatability      | First local seed inserted 55 records; immediate second run inserted 0                                       |
| TypeScript              | Both workspaces passed                                                                                      |
| ESLint                  | Passed                                                                                                      |
| Production build        | Vite frontend and TypeScript backend passed                                                                 |
| Unit/API/database tests | 20 passed: 2 client tests, 14 server security/content/media/sitemap tests, 4 real MongoDB integration tests |
| Browser tests           | 7 passed: 5 fixture-based presentation/navigation tests, 2 real Express/MongoDB browser flows               |
| Dependency audit        | Production dependency audit reported 0 vulnerabilities                                                      |
| Local health            | Express returned HTTP 200 with database status ok                                                           |

The real browser workflow created an owner account solely for the test, signed in, added a team member, saved a private draft, verified it was absent publicly, published it, verified public visibility, edited without publishing, verified the old public version remained, republished, and deleted the member. A separate browser test submitted an actual contact inquiry and checked its MongoDB record. Test accounts and content were removed afterward. No production owner account or default password was created.

Desktop and 375px viewport checks covered required public listing pages, service detail/refresh, mobile navigation, contact submission, admin login redirect, and admin mobile overflow. Screenshots were generated in ignored `test-results/`; no visual regression baseline or measured performance score is claimed.

A clean install initially left the existing Vite process with outdated dependency optimization URLs. Restarting the owned dev services resolved the issue; the seven browser checks then passed. The database integration suite also caught and verified a fix for a shared Express parameter validator that incorrectly rejected inbox/export kinds.

Unverified external operations: Atlas connection, credentialed Cloudinary upload/private PDF delivery, SMTP delivery and password reset email, production Node hosting, actual GitHub Pages-to-production-API end-to-end behavior. Refer to deployment and status documents. Source push and GitHub Actions status are reported separately in the handover rather than inferred from local tests.

Standalone deployment update: a production build with an empty API URL renders the initial public site without API requests. The dedicated static browser suite verifies public routes, service refresh, mobile overflow, unavailable contact/newsletter/admin actions, and the absence of private records in the bundled snapshot. Separate client unit tests verify that static mutations are rejected and supplying the real API URL switches back to connected behavior.
