#!/bin/sh
set -eu
repo="B-Divyesh/sf-presence-bridge"
api="https://api.github.com/repos/$repo/releases/latest"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
json="$tmp_dir/release.json"
curl -fsSL "$api" -o "$json"
asset_url="$(sed -n 's/.*"browser_download_url": "\([^"]*\.AppImage\)".*/\1/p' "$json" | head -n 1)"
[ -n "$asset_url" ] || { echo "No Linux AppImage is published yet." >&2; exit 1; }
file="$tmp_dir/Presence-Bridge.AppImage"
curl -fsSL "$asset_url" -o "$file"
sum_url="$(sed -n 's/.*"browser_download_url": "\([^"]*SHA256SUMS\)".*/\1/p' "$json" | head -n 1)"
curl -fsSL "$sum_url" -o "$tmp_dir/SHA256SUMS"
expected="$(grep "$(basename "$asset_url")" "$tmp_dir/SHA256SUMS" | cut -d ' ' -f 1)"
actual="$(sha256sum "$file" | cut -d ' ' -f 1)"
[ "$expected" = "$actual" ] || { echo "Checksum failed." >&2; exit 1; }
install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
mkdir -p "$install_dir"
install -m 755 "$file" "$install_dir/presence-bridge"
echo "Installed Presence Bridge at $install_dir/presence-bridge"
