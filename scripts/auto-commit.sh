#!/bin/bash
# Auto-commit script for ph-public-api
# Picks one item from the data pool, adds it as a JSON file, commits with co-author trailers, and pushes.
# Designed to run multiple times per day via launchd.

set -e
REPO_DIR="/Users/a1234/ph-public-api"
POOL="$REPO_DIR/scripts/data-pool.json"
LOG="$REPO_DIR/scripts/auto-commit.log"

cd "$REPO_DIR"

# Pull latest first to avoid push conflicts
git pull --rebase origin main >/dev/null 2>&1 || true

# Decide between schools, cities, or doc updates (rotates pseudo-randomly)
ROLL=$(( RANDOM % 10 ))

PYTHON=/usr/bin/python3

did_commit=0
msg=""
file=""

if [ $ROLL -lt 5 ]; then
  # Add a school
  result=$("$PYTHON" - <<EOF
import json, os, sys, glob
pool = json.load(open("$POOL"))
existing_codes = {os.path.basename(p).replace('.json','') for p in glob.glob("data/schools/*.json")}
remaining = [s for s in pool["schools"] if s["code"] not in existing_codes]
if not remaining:
    print("EXHAUSTED")
    sys.exit(0)
import random
choice = random.choice(remaining)
path = f"data/schools/{choice['code']}.json"
with open(path, "w") as f:
    json.dump(choice, f, indent=2)
print(f"FILE={path}")
print(f"NAME={choice['name']}")
EOF
)
  if echo "$result" | grep -q "EXHAUSTED"; then
    ROLL=8  # fallback to doc update
  else
    file=$(echo "$result" | grep "FILE=" | cut -d= -f2)
    name=$(echo "$result" | grep "NAME=" | cut -d= -f2-)
    msg="Add school: $name"
    did_commit=1
  fi
fi

if [ $did_commit -eq 0 ] && [ $ROLL -lt 8 ]; then
  # Add a city
  result=$("$PYTHON" - <<EOF
import json, os, sys, glob, re
pool = json.load(open("$POOL"))
def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
existing = {os.path.basename(p) for p in glob.glob("data/cities/*.json")}
remaining = [c for c in pool["cities"] if (slugify(c["name"]) + ".json") not in existing]
if not remaining:
    print("EXHAUSTED")
    sys.exit(0)
import random
choice = random.choice(remaining)
path = f"data/cities/{slugify(choice['name'])}.json"
with open(path, "w") as f:
    json.dump(choice, f, indent=2)
print(f"FILE={path}")
print(f"NAME={choice['name']}")
EOF
)
  if echo "$result" | grep -q "EXHAUSTED"; then
    ROLL=8  # fallback to doc update
  else
    file=$(echo "$result" | grep "FILE=" | cut -d= -f2)
    name=$(echo "$result" | grep "NAME=" | cut -d= -f2-)
    msg="Add city: $name"
    did_commit=1
  fi
fi

if [ $did_commit -eq 0 ]; then
  # Append a CHANGELOG line
  DATE=$(date "+%Y-%m-%d %H:%M")
  COUNT_SCHOOLS=$(ls data/schools/ 2>/dev/null | wc -l | xargs)
  COUNT_CITIES=$(ls data/cities/ 2>/dev/null | wc -l | xargs)
  echo "- $DATE — data snapshot: $COUNT_SCHOOLS schools, $COUNT_CITIES cities" >> docs/CHANGELOG.md
  file="docs/CHANGELOG.md"
  msg="Update CHANGELOG snapshot ($DATE)"
  did_commit=1
fi

git add "$file"
git commit -m "$msg

Co-authored-by: Charlie James Abejo <capstonee2@gmail.com>
Co-authored-by: PH Data Bot <data-bot@ph-public-api.local>" >/dev/null

git push origin main >/dev/null 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $msg" >> "$LOG"
