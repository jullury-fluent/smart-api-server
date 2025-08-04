#!/usr/bin/env bash

# Script to set up Git alias for Commitizen
# This script should be run by each user after cloning the repository

echo "Setting up Git alias for Commitizen..."

# Add a shorthand alias 'cz' for Commitizen
git config --local alias.cz '!pnpx git-cz'

echo "Git alias configured successfully!"
echo ""
echo "You can now use the following commands:"
echo "  git cz        - Shorthand for the same Commitizen interface"
echo ""
echo "Note: This alias is configured locally for this repository only."
echo "To use git commit normally (without Commitizen), use: git commit --no-verify"
