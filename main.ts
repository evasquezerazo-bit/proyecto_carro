// Configuración del grupo de Radio
radio.setGroup(7)

// Mostrar icono de encendido
basic.showIcon(IconNames.Happy)

basic.forever(function () {
    // Leer el eje Y del Joystick (Normalmente P2 en Joystick:bit V2, o P1 en V1)
    let yValue = pins.analogReadPin(AnalogPin.P2)
    
    // Leer botones C (P13) y D (P14)
    let botonCorrecto = pins.digitalReadPin(DigitalPin.P13)
    let botonIncorrecto = pins.digitalReadPin(DigitalPin.P14)

    if (yValue > 750 || botonCorrecto == 0) {
        // Respuesta Correcta: Joystick hacia adelante o botón C presionado
        radio.sendNumber(1)
        basic.showArrow(ArrowNames.North)
    } else if (yValue < 250 || botonIncorrecto == 0) {
        // Respuesta Incorrecta: Joystick hacia atrás o botón D presionado
        radio.sendNumber(2)
    } else {
        radio.sendNumber(0)
        basic.clearScreen()
    }
    
    basic.pause(50)
})
