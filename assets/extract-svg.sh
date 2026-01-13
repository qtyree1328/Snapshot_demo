#!/bin/bash
# Extract SVG paths and create clean embedded version

# Read the SVG and extract just the paths
awk '
BEGIN { print "<svg id=\"us-deregulation-map\" viewBox=\"0 0 959 593\" preserveAspectRatio=\"xMidYMid meet\">" }
/<path/ { 
  inpath = 1
  pathcontent = ""
}
inpath { 
  pathcontent = pathcontent $0 "\n"
  if (/>/ || />$/) {
    # Clean up the path - remove style attribute, add data-state
    gsub(/style="[^"]*"/, "", pathcontent)
    gsub(/sodipodi:nodetypes="[^"]*"/, "", pathcontent)
    gsub(/inkscape:[a-z]*="[^"]*"/, "", pathcontent)
    # Clean whitespace
    gsub(/\n/, " ", pathcontent)
    gsub(/  +/, " ", pathcontent)
    print pathcontent
    inpath = 0
  }
}
END { print "</svg>" }
' us-map-processed.svg > us-map-clean.svg

echo "Clean SVG created"
wc -l us-map-clean.svg
