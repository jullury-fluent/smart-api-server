module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.',
        registry: 'https://npm.pkg.github.com'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {path: 'dist/**/*.js', label: 'Distribution'},
          {path: 'CHANGELOG.md', label: 'Changelog'}
        ],
        successComment: '🎉 This ${issue.pull_request ? "PR is included" : "issue has been resolved"} in version ${nextRelease.version}',
        failTitle: '❌ The release failed',
        failComment: '❌ The release job has failed! Please check the logs for more information.'
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
};
