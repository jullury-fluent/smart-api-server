# EquiSafe Packages Templates

This repository contains template configurations and base setups for EquiSafe packages. It provides a standardized foundation for creating new packages within the EquiSafe ecosystem.

## Features

- TypeScript configuration
- ESLint and Prettier setup for code quality
- Jest testing framework
- Automated release process with semantic-release

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- PNPM 10.13.1 or higher

### Installation

```bash
pnpm install
```

### Development

```bash
# Run tests
pnpm test

# Build the package
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

### Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages. We've set up Commitizen to help you create properly formatted commit messages.

#### Setup Git Alias (Recommended)

Run the following command to set up a Git alias for Commitizen:

```bash
pnpm setup-git-aliases
```

After running this command, you can use:
- `git cz` - Shorthand for using Commitizen to create conventional commits

#### Alternative: Using npm/pnpm scripts

If you prefer not to modify your Git aliases, you can use:

```bash
pnpm commit
```

## Project Structure

- `src/` - Source code
- `tests/` - Test files
- `dist/` - Compiled output (generated)

## Versioning and Releases

This project uses automated semantic versioning. See [VERSIONING.md](./VERSIONING.md) for detailed information about the versioning and release process.

## License

UNLICENSED - See the [LICENSE](./LICENSE) file for details.
