# Hoverlab Build-Kit (Gerüst, ungetestet)

Ziel: die echte C-Firmware (hoverboard-firmware-hack-FOC) für den Browser-Simulator als WebAssembly bauen.

## Idee

1. Die Regel- und Steuerlogik der Firmware wird auf dem PC statt auf dem STM32 kompiliert.
2. Alle Chip-Zugriffe (Timer, ADC, GPIO, UART) laufen über `hal_shim.h`. Dort stehen Funktionen, die der Simulator mit Werten füllt.
3. Emscripten macht daraus `firmware.wasm`. Der Simulator ruft pro Takt `hl_step()` auf.

## Voraussetzungen

- Emscripten (`emcc`), Installation: https://emscripten.org/docs/getting_started/downloads.html
- Ein Klon der Firmware: `git clone https://github.com/EmanuelFeru/hoverboard-firmware-hack-FOC`

## Benutzen

```bash
./build.sh /pfad/zu/hoverboard-firmware-hack-FOC
```

Das Skript kompiliert `Src/BLDC_controller.c` und `Src/util.c` zusammen mit `hal_shim.c` zu `out/firmware.wasm`.

## Was noch fehlt

- `main.c` der Firmware ruft viele STM32-Funktionen auf. Jede muss in `hal_shim.h` als Platzhalter stehen, sonst bricht der Build ab.
- Die Anbindung von `firmware.wasm` an den Simulator (Hall-Werte rein, PWM-Werte raus) ist noch nicht in der Webseite.
- Die Pinbelegung in der Webseite ist typisch für STM32F103-Boards. Prüft sie an eurem Board.
