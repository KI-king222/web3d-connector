# components.js restore

1. Full **tiered** file (case I/O fix + GPU/CPU t1-t10) lives in the Web3D live projects:
   - https://web3d-connector.onrender.com/preview/hp-gpu-10/
   - https://web3d-connector.onrender.com/preview/hp-cpu-10/
   - https://web3d-connector.onrender.com/preview/hp-case-io/

2. Local: `artifacts/web3d-connector/templates/components.js` (29671 bytes)

3. To put the tiered file on GitHub after a Manual Deploy of templates:
   copy from the live project `hp-gpu-10/components.js` or from local artifacts.

## Case orientation
- **+z** = I/O side (Mainboard/GPU/PSU ports)
- **-z** = triple fans

## GPU tiers (HASHPOOL names)
| tier | model | look |
|------|-------|------|
| 1 | GT 1030A | short, 1 fan, plastic |
| 2 | RX 64X0 | 1 fan, plastic |
| 3 | GTX 1650A | 2 fans |
| 4 | RX 66X0 | 2 fans, backplate |
| 5 | RTX 3060A | 2 fans, RGB |
| 6 | RX 76X0 | 3 fans, RGB |
| 7 | RTX 4070A | 3 fans, RGB |
| 8 | RX 78X0 XT | thicker |
| 9 | RTX 4080A | premium gold |
| 10 | RTX 4090A | longest, 3.5-slot |
