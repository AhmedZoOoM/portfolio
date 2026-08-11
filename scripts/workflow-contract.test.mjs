import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/sync-drive-media.yml", "utf8");
const deploy = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
const e2e = readFileSync("tests/portfolio.e2e.spec.mjs", "utf8");
const audit = JSON.parse(readFileSync("data/drive-sync-audit.json", "utf8"));
const isValidAuditMonth = (value) => value === null || /^\d{4}-(?:0[1-9]|1[0-2])$/.test(value);

assert.match(workflow, /cron:\s*["']17 0 \* \* \*["']/, "Drive synchronization must run nightly away from the top of the hour");
assert.match(workflow, /workflow_dispatch:/, "Drive synchronization must remain manually runnable");
assert.match(workflow, /GOOGLE_DRIVE_API_KEY:\s*\$\{\{\s*secrets\.GOOGLE_DRIVE_API_KEY\s*\}\}/, "the API key must come only from Actions secrets");
assert.match(workflow, /contents:\s*write/, "the sync job needs scoped content write permission");
assert.match(workflow, /pull-requests:\s*write/, "the sync job needs scoped pull-request permission");
assert.doesNotMatch(workflow, /write-all/, "the workflow must not request blanket write access");
assert.match(workflow, /npm run check[\s\S]*npm run verify[\s\S]*gh pr create[\s\S]*gh pr merge/, "checks must pass before a generated PR is created and merged");
assert.match(workflow, /gh pr merge[\s\S]*MERGED[\s\S]*mergeCommit[\s\S]*origin\/main/, "deployment must wait until the PR merge commit is confirmed on main");
assert.match(workflow, /drive-sync-audit\.json/, "a monthly healthy run must leave a reviewable audit PR");
assert.match(workflow, /Nightly Drive sync failed/, "failures must be tracked by one named issue");
assert.match(workflow, /gh issue list[\s\S]*gh issue comment/, "failure reporting must update an existing issue instead of creating duplicates");
assert.match(workflow, /uses:\s*\.\/\.github\/workflows\/deploy-pages\.yml/, "the sync workflow must deploy the merged main branch");
assert.match(deploy, /workflow_call:/, "the Pages workflow must be reusable from the sync workflow");
assert.match(deploy, /ref:\s*main/, "deployment must check out merged main, not the pre-merge scheduler SHA");
assert.match(deploy, /npm run test:e2e/, "deployment must finish with browser acceptance against its final URL");
assert.match(e2e, /data-media-id/, "E2E must derive assertions from rendered media cards");
assert.match(e2e, /window\.PORTFOLIO_DATA/, "E2E must compare rendered cards with the independently deployed manifest");
assert.match(e2e, /aria-pressed/, "E2E must exercise the categories rendered by the live site");
assert.doesNotMatch(e2e, /\b(?:81|77|16kl-TkbvU090UNE0v2GnmIBiq5-bbbEt)\b/, "E2E must not hard-code current media counts or IDs");
assert.doesNotMatch(e2e, /\b(?:commercial|television|podcast|social|showreel|making-of|stills)\b/i, "E2E must discover current categories instead of naming them");
assert.equal(isValidAuditMonth(null), true, "the audit marker may be empty before its first healthy run");
assert.equal(isValidAuditMonth("2026-08"), true, "the audit marker must remain valid after the workflow records a healthy month");
assert.equal(isValidAuditMonth("August"), false, "invalid audit values must be rejected");
assert.ok(isValidAuditMonth(audit.lastHealthyMonth), "the tracked audit marker must be empty or contain a valid completed UTC month");

console.log("PASS nightly workflow and dynamic E2E contracts");
