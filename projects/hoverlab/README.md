# Hoverlab

Simulator für den Hoverboard-Umbau: zwei Hubmotoren, zwei Neigungsplatinen, eine Hauptplatine.

- `index.html`: Simulator im Browser (einfach öffnen). Firmware ist hier JavaScript und lässt sich im Reiter "Firmware" bearbeiten.
- `buildkit/`: Gerüst (ungetestet), um die echte C-Firmware (hoverboard-firmware-hack-FOC) als WebAssembly zu bauen. Details in `buildkit/README.md`.
