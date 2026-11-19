# Software Simulator (Hoverlab)

Browser-Simulator für den Umbau eines Hoverboards zu einem eigenen Fahrzeug. Öffnen: `index.html` (GitHub Pages).

## Was drin ist

- **Original-Befehlskette** der Open-Source-Firmware [hoverboard-firmware-hack-FOC](https://github.com/EFeru/hoverboard-firmware-hack-FOC) (Variante ADC und Neigungsplatinen) als JavaScript-Port. Rate-Limiter, Tiefpassfilter und Mixer rechnen wie das C-Original in Festkomma-Arithmetik und wurden gegen die kompilierte C-Version geprüft.
- **config.h einfügen**: Der Inhalt deiner echten `Inc/config.h` wird gelesen (Variante, RATE, FILTER, Koeffizienten, Invertierung, Takt).
- **Projekte**: Mehrere Firmware-Stände samt config.h und Fahrzeug werden im Browser gespeichert. Exportieren und Importieren als Text.
- **Fahrzeuge**: Zwei Motoren mit Differenzial (Hoverboard-Stil) oder **Box mit Lenker** (zwei Hubmotoren an der Hinterachse, Lenker mit zwei unbewegten Rädern vorn).
- **Ansichten**: Draufsicht und frei drehbare 3D-Ansicht, Messkurven, Anschlussübersicht.

## Nicht enthalten

Der Simulink-Regler der Motoren (Strom-, Drehzahl-, Drehmomentmodus), Feldschwächung, Batterie- und Temperaturschutz, Töne. Die Ausgabe wird als Spannungsmodus simuliert. Das Build-Kit für die echte C-Firmware als WebAssembly liegt unter `hoverlab/buildkit/` und ist noch ein Gerüst.

## Lizenz

Die Befehlskette ist ein Port von Code unter GPL-3.0 (Emanuel Feru und Mitwirkende). Dieses Projekt sollte deshalb ebenfalls unter GPL-3.0 stehen: In GitHub unter Add file, Create new file, Dateiname `LICENSE`, dort "Choose a license template" wählen.
