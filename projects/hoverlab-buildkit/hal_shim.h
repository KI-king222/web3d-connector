/* Hoverlab: Ersatz für die STM32-Hardwarezugriffe der Firmware.
 * Der Simulator schreibt die hl_in_* Werte und liest die hl_out_* Werte. */
#ifndef HAL_SHIM_H
#define HAL_SHIM_H

#include <stdint.h>

/* Eingänge vom Simulator */
extern int32_t hl_in_hall_l;      /* 1..6 */
extern int32_t hl_in_hall_r;      /* 1..6 */
extern int32_t hl_in_batt_mv;     /* Akkuspannung in mV */
extern int32_t hl_in_curr_l_ma;   /* Phasenstrom links in mA */
extern int32_t hl_in_curr_r_ma;   /* Phasenstrom rechts in mA */
extern int32_t hl_in_pad_l_cdeg;  /* Neigung links in 0,01 Grad */
extern int32_t hl_in_pad_r_cdeg;  /* Neigung rechts in 0,01 Grad */
extern uint8_t hl_in_foot_l;
extern uint8_t hl_in_foot_r;

/* Ausgänge zum Simulator */
extern int32_t hl_out_pwm_l;      /* -1000..1000 */
extern int32_t hl_out_pwm_r;
extern uint8_t hl_out_led;
extern uint8_t hl_out_buzzer;

/* Wird vom Simulator alle 10 ms aufgerufen */
void hl_step(void);

/* Platzhalter für STM32-HAL-Funktionen, bei Bedarf erweitern */
#define HAL_GetTick() hl_tick_ms()
uint32_t hl_tick_ms(void);
#define HAL_Delay(ms) ((void)(ms))

#endif
