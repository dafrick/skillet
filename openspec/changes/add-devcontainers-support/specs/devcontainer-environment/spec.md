## ADDED Requirements

### Requirement: Devcontainer directory exists at repo root
The repository SHALL contain a `.devcontainer/` directory with `devcontainer.json` and `README.md`.

#### Scenario: Files are present after checkout
- **WHEN** a contributor clones the repository
- **THEN** `.devcontainer/devcontainer.json` and `.devcontainer/README.md` are present

---

### Requirement: Container uses pre-built Node 24 image
The `devcontainer.json` SHALL reference `mcr.microsoft.com/devcontainers/typescript-node:1-24-bookworm` as its base image so the container requires no local Docker build and no custom Dockerfile.

#### Scenario: Container opens without a Dockerfile
- **WHEN** a contributor opens the project with "Reopen in Container"
- **THEN** VS Code pulls the pre-built image and starts the container without building a Dockerfile

---

### Requirement: gh CLI is available via devcontainer feature
The `devcontainer.json` SHALL add the gh CLI via `ghcr.io/devcontainers/features/github-cli:1` so the GitHub CLI is available inside the container.

#### Scenario: gh is available after container start
- **WHEN** a contributor opens a terminal in the running container
- **THEN** `gh --version` exits 0

---

### Requirement: Claude Code is available via devcontainer feature
The `devcontainer.json` SHALL add Claude Code via `ghcr.io/anthropics/devcontainer-features/claude-code:1.0` so AI agents are immediately available without a separate install step.

#### Scenario: claude command is available on PATH
- **WHEN** a terminal is opened inside the running container
- **THEN** `claude --version` exits 0

---

### Requirement: pnpm and project dependencies are ready on first open
The `devcontainer.json` SHALL set `postCreateCommand` to `corepack enable && corepack prepare pnpm@latest --activate && pnpm install` so that pnpm is activated and all project dependencies are installed when the container first starts.

#### Scenario: pnpm is available after container start
- **WHEN** a contributor opens a terminal in the running container
- **THEN** `pnpm --version` exits 0 and prints a version string

#### Scenario: node_modules is populated on first open
- **WHEN** a contributor opens the container for the first time
- **THEN** `node_modules` is populated and `pnpm build` exits 0 without a prior manual install

---

### Requirement: Container runs as non-root user
The `devcontainer.json` SHALL set `remoteUser` to `node` so that agents can be granted `--dangerously-skip-permissions` safely and the container does not run as root.

#### Scenario: Default user is non-root
- **WHEN** a contributor runs `whoami` in the container terminal
- **THEN** the output is `node`, not `root`

---

### Requirement: Workspace is bind-mounted from host
The `devcontainer.json` SHALL configure `workspaceMount` and `workspaceFolder` so the host repository is mounted at `/workspace` inside the container and file edits are immediately visible on both sides.

#### Scenario: File edited in container appears on host
- **WHEN** a contributor creates a file inside `/workspace` in the container
- **THEN** the same file appears in the host repository directory immediately

---

### Requirement: Git identity is available inside the container
The `devcontainer.json` SHALL bind-mount the host `~/.gitconfig` read-only at `/home/node/.gitconfig` so that git commits made inside the container carry the correct author name and email.

#### Scenario: Git commit has correct author
- **WHEN** a contributor or agent makes a git commit inside the container
- **THEN** the commit's author name and email match the host git identity

---

### Requirement: GitHub auth is available via GH_TOKEN
The `devcontainer.json` SHALL pass `GH_TOKEN` from the host environment into the container via `containerEnv` so the gh CLI can authenticate for PR creation and other GitHub operations without SSH keys.

#### Scenario: gh CLI can create a PR from inside the container
- **WHEN** `GH_TOKEN` is set in the host environment and a contributor runs `gh pr create` inside the container
- **THEN** the command authenticates and creates the PR successfully

---

### Requirement: Optional mounts are documented as commented examples
The `devcontainer.json` SHALL include commented-out `mounts` examples for `~/.claude` (named volume, for agent auth persistence) and any other commonly useful host directories, with inline comments explaining the tradeoff.

#### Scenario: Contributor can enable optional mount by uncommenting
- **WHEN** a contributor uncomments the `~/.claude` volume mount and rebuilds the container
- **THEN** Claude Code authentication persists across container rebuilds

---

### Requirement: VS Code extensions are pre-configured
The `devcontainer.json` SHALL list the Claude Code extension (`anthropic.claude-code`) and standard TypeScript/JavaScript extensions in `customizations.vscode.extensions` so VS Code installs them automatically on container open.

#### Scenario: Extensions present after container open
- **WHEN** a contributor opens the project in VS Code via "Reopen in Container"
- **THEN** the Claude Code extension and ESLint/Prettier extensions are installed without manual action

---

### Requirement: Devcontainer README provides complete setup instructions
The `.devcontainer/README.md` SHALL document: prerequisites (Docker Desktop, VS Code Dev Containers extension), step-by-step VS Code open instructions, how to set `GH_TOKEN` in the host environment, how to run Claude Code inside the container, and the optional mount options.

#### Scenario: New contributor can onboard from README alone
- **WHEN** a contributor reads `.devcontainer/README.md` and follows the steps
- **THEN** they can open the container in VS Code and run `claude` without additional guidance

---

### Requirement: CONTRIBUTING.md references the dev container
`CONTRIBUTING.md` SHALL include a short dev container section that names the dev container as the recommended development environment and links to `.devcontainer/README.md` for setup instructions.

#### Scenario: CONTRIBUTING.md mentions the dev container
- **WHEN** a contributor reads `CONTRIBUTING.md`
- **THEN** they find a mention of the dev container and a path or link to the setup instructions
