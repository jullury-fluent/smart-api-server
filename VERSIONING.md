## Versionning

### Semantic Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and package publishing.

#### Commit Message Format

Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Common types:
- `feat`: A new feature (triggers a minor version bump)
- `fix`: A bug fix (triggers a patch version bump)
- `docs`: Documentation changes
- `style`: Changes that don't affect the code's meaning
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Breaking changes should include `BREAKING CHANGE:` in the commit message body or append an `!` after the type/scope, which will trigger a major version bump.

#### CI/CD

Semantic-release runs automatically on the `main` branch via GitHub Actions. It will:

1. Analyze commits since the last release
2. Determine the next version number
3. Generate release notes
4. Update the CHANGELOG.md
5. Create a new git tag
6. Publish the package to npm (if configured)

### Tag

- [x] Use [semantic versioning](https://semver.org/) (handled automatically by semantic-release)

### Release

- [x] Use [semantic versioning](https://semver.org/) (handled automatically by semantic-release)
