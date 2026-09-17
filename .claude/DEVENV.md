<!-- @format -->

# Development Environment

This file describes the **pattern**, not the values — it's version-controlled
and shared across every project started from this template, so it must never
contain real credentials. Actual per-project values (WiFi SSID/password, git
remote) live in `.claude/DEVENV.local.md`, which is gitignored and created by
`SETUP.md`.

## WIFI

If a sketch needs WiFi connectivity, read the SSID/password from
`.claude/DEVENV.local.md`. If that file doesn't exist yet or has blank
WIFI fields, run `SETUP.md` (or its Step 4) to collect them from the user
first — do not hardcode credentials into sketch source.

## GIT

The git repository for this project is rooted at `code/`, **not** the project
root, so `git` commands must be run from (or targeted at) `code/`, e.g.
`git -C code status`.

Files in the project root live outside the repo and are not version
controlled. They are backed up and synced separately.

The remote origin (if any) is recorded in `.claude/DEVENV.local.md`, set
during `SETUP.md` Step 5.

**Identity:** `git config user.name` / `user.email` are machine-global
settings (`~/.gitconfig`), not per-project — they're checked/set once by
`SETUP.md` Step 5a and never duplicated into `DEVENV.local.md`.

**Network shares:** if this project's `code/` folder lives on a network
share (a `\\...` UNC path or mapped drive), git refuses to operate on it
until explicitly trusted via `git config --global --add safe.directory
<path>` — see `SETUP.md` Step 5c. Skip this if the project is on a local
drive.

**Credentials:** Windows Credential Manager holds a stored OAuth token from
VS Code's Git extension. A plain `git push` works without any extra
authentication — do NOT embed tokens in the remote URL. If push fails with an
auth error, check the remote URL is clean (no token embedded): `git remote -v`
