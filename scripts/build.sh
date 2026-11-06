#!/bin/sh
set -eu
rm -rf dist
mkdir -p dist
cp index.html styles.css app.js config.js robots.txt sitemap.xml .nojekyll dist/
cp -R assets dist/assets
