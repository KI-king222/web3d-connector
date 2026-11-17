#!/usr/bin/env bash
# Baut die FOC-Firmware als WebAssembly für Hoverlab.
# Aufruf: ./build.sh /pfad/zu/hoverboard-firmware-hack-FOC
set -euo pipefail

FW="${1:?Pfad zur Firmware angeben}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HERE/out"

command -v emcc >/dev/null || { echo "emcc (Emscripten) fehlt"; exit 1; }

emcc -O2 \
  -I "$HERE" -I "$FW/Inc" \
  -include "$HERE/hal_shim.h" \
  "$FW/Src/BLDC_controller.c" \
  "$FW/Src/util.c" \
  "$HERE/hal_shim.c" \
  -s EXPORTED_FUNCTIONS='["_hl_step"]' \
  -s STANDALONE_WASM=1 \
  -o "$HERE/out/firmware.wasm"

echo "Fertig: $HERE/out/firmware.wasm"
