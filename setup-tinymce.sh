#!/bin/bash

# Create directories
mkdir -p public/tinymce

# Download TinyMCE
curl -L https://download.tiny.cloud/tinymce/community/tinymce_6.8.2.zip -o tinymce.zip

# Unzip and move files
unzip -o tinymce.zip -d temp/
cp -r temp/tinymce/* public/tinymce/
rm -rf temp/
rm tinymce.zip

echo "TinyMCE setup complete!"
