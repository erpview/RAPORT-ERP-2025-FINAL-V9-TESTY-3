#!/bin/bash

# Find all index.html files in the partnerzy directory
find ./partnerzy -name "index.html" -type f | while read -r file; do
  # Replace the script tag using sed
  sed -i '' 's|<script type="module" crossorigin src="/assets/main-[^"]*\.js"></script>|<script type="module" src="/src/main.tsx"></script>|g' "$file"
  # Remove the CSS link tag
  sed -i '' '/<link rel="stylesheet" crossorigin href="\/assets\/main-[^"]*\.css">/d' "$file"
done
