#!/usr/bin/env bash
# ✅ India District GeoJSON Downloader (macOS-compatible)

set -e

BASE_URL="https://raw.githubusercontent.com/guneetnarula/indian-district-boundaries/master/geojson"
DEST="public/maps/state-jsons"

mkdir -p "$DEST"

STATES=(
  "andhra_pradesh:Andhra Pradesh"
  "arunachal_pradesh:Arunachal Pradesh"
  "assam:Assam"
  "bihar:Bihar"
  "chhattisgarh:Chhattisgarh"
  "delhi:Delhi"
  "goa:Goa"
  "gujarat:Gujarat"
  "haryana:Haryana"
  "himachal_pradesh:Himachal Pradesh"
  "jammu_and_kashmir:Jammu & Kashmir"
  "jharkhand:Jharkhand"
  "karnataka:Karnataka"
  "kerala:Kerala"
  "madhya_pradesh:Madhya Pradesh"
  "maharashtra:Maharashtra"
  "manipur:Manipur"
  "meghalaya:Meghalaya"
  "mizoram:Mizoram"
  "nagaland:Nagaland"
  "odisha:Odisha"
  "punjab:Punjab"
  "rajasthan:Rajasthan"
  "sikkim:Sikkim"
  "tamil_nadu:Tamil Nadu"
  "telangana:Telangana"
  "tripura:Tripura"
  "uttar_pradesh:Uttar Pradesh"
  "uttarakhand:Uttarakhand"
  "west_bengal:West Bengal"
  "andaman_and_nicobar_islands:Andaman & Nicobar Islands"
  "chandigarh:Chandigarh"
  "dadra_and_nagar_haveli:Dadra & Nagar Haveli"
  "daman_and_diu:Daman & Diu"
  "lakshadweep:Lakshadweep"
  "puducherry:Puducherry"
)

echo "🌏 Downloading India state/UT district maps to $DEST ..."
echo

for entry in "${STATES[@]}"; do
  key="${entry%%:*}"
  value="${entry#*:}"

  url="${BASE_URL}/${key}_district.geojson"
  file="${DEST}/${key}.json"

  echo "➡️  $value ..."
  curl -L -s -o "$file" "$url"

  if grep -q "404" "$file"; then
    echo "❌  Failed for $value (404 Not Found)"
    rm -f "$file"
  else
    echo "✅  Downloaded $value"
  fi
done

echo
echo "🎉  All available maps downloaded successfully!"
