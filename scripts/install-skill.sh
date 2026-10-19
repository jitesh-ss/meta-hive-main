#!/bin/bash
# Install meta-hive as a pi skill

SKILL_DIR="$HOME/.pi/agent/skills"
TARGET_DIR="$SKILL_DIR/meta-hive"

# Create skill directory
mkdir -p "$SKILL_DIR"
mkdir -p "$TARGET_DIR"

# Copy files
cp "$(dirname "$0")/../SKILL.md" "$TARGET_DIR/"

echo "✅ meta-hive skill installed to $TARGET_DIR"
echo ""
echo "Usage:"
echo "  1. Initialize a hive: npx meta-hive init --name .meta-hive"
echo "  2. Use /meta-hive status in pi to check hive"
echo "  3. Join hives with /meta-hive join <path>"