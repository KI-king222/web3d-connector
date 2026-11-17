#include "hal_shim.h"

int32_t hl_in_hall_l, hl_in_hall_r, hl_in_batt_mv;
int32_t hl_in_curr_l_ma, hl_in_curr_r_ma;
int32_t hl_in_pad_l_cdeg, hl_in_pad_r_cdeg;
uint8_t hl_in_foot_l, hl_in_foot_r;
int32_t hl_out_pwm_l, hl_out_pwm_r;
uint8_t hl_out_led, hl_out_buzzer;

static uint32_t tick_ms;
uint32_t hl_tick_ms(void) { return tick_ms; }

void hl_step(void) {
  tick_ms += 10;
  /* TODO: hier die Firmware-Hauptschleife aufrufen und die Werte
     hl_in_* an die Firmware-Variablen übergeben (rtU_*), die Ergebnisse
     (rtY_*) nach hl_out_* kopieren. */
}
