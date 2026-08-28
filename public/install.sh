#!/bin/sh
set -eu
repo="B-Divyesh/sf-presence-bridge"
api="https://api.github.com/repos/$repo/releases/latest"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
json="$tmp_dir/release.json"
curl -fsSL "$api" -o "$json"
command -v python3 >/dev/null 2>&1 || { echo "Presence Bridge needs python3 to read the GitHub release manifest." >&2; exit 1; }
asset_url="$(python3 - "$json" '.AppImage' <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as source:
    release = json.load(source)
suffix = sys.argv[2]
print(next((asset["browser_download_url"] for asset in release.get("assets", []) if asset.get("name", "").endswith(suffix)), ""))
PY
)"
[ -n "$asset_url" ] || { echo "No Linux AppImage is published yet." >&2; exit 1; }
file="$tmp_dir/Presence-Bridge.AppImage"
curl -fsSL "$asset_url" -o "$file"
sum_url="$(python3 - "$json" 'SHA256SUMS' <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as source:
    release = json.load(source)
name = sys.argv[2]
print(next((asset["browser_download_url"] for asset in release.get("assets", []) if asset.get("name") == name), ""))
PY
)"
[ -n "$sum_url" ] || { echo "Release checksums are not published yet." >&2; exit 1; }
curl -fsSL "$sum_url" -o "$tmp_dir/SHA256SUMS"
expected="$(grep "$(basename "$asset_url")" "$tmp_dir/SHA256SUMS" | cut -d ' ' -f 1)"
actual="$(sha256sum "$file" | cut -d ' ' -f 1)"
[ "$expected" = "$actual" ] || { echo "Checksum failed." >&2; exit 1; }
install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
mkdir -p "$install_dir"
install -m 755 "$file" "$install_dir/presence-bridge"
echo "Installed Presence Bridge at $install_dir/presence-bridge"
