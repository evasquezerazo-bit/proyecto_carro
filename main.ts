// Configuración de Radio
radio.setGroup(7)

// Pines de salida para LEDs del kit 45 en 1
let LED_VERDE = DigitalPin.P8
let LED_ROJO = DigitalPin.P2

// Apagar luces al inicio
pins.digitalWritePin(LED_VERDE, 0)
pins.digitalWritePin(LED_ROJO, 0)

// Mostrar icono de carro
basic.showLeds(`
    . . # . .
    . # # # .
    # # # # #
    . # . # .
    . . . . .
    `)

let estadoRecibido = 0

// Función de bajo nivel para escribir por I2C al controlador del motor HolaSmart (Dirección 0x30)
function motor_i2cWrite(reg: number, value: number): void {
    let buffer = pins.createBuffer(2)
    buffer.setNumber(NumberFormat.UInt8LE, 0, reg)
    buffer.setNumber(NumberFormat.UInt8LE, 1, value)
    pins.i2cWriteBuffer(0x30, buffer)
}

// Función para controlar los motores
function setMotor(motor: number, velocidad: number) {
    let dir = 0
    let pwm = Math.abs(velocidad)
    if (pwm > 255) pwm = 255

    if (velocidad < 0) {
        dir = 1 // Reversa
    } else {
        dir = 0 // Adelante
    }

    if (motor == 1) { // Motor M1 (Izquierdo)
        if (dir == 1) {
            motor_i2cWrite(0x01, pwm)
            motor_i2cWrite(0x02, 0)
        } else {
            motor_i2cWrite(0x01, pwm)
            motor_i2cWrite(0x02, 255)
        }
    } else if (motor == 2) { // Motor M2 (Derecho)
        if (dir == 1) {
            motor_i2cWrite(0x04, pwm)
            motor_i2cWrite(0x03, 255)
        } else {
            motor_i2cWrite(0x04, pwm)
            motor_i2cWrite(0x03, 0)
        }
    }
}

function detenerCarro() {
    setMotor(1, 0)
    setMotor(2, 0)
}

// Evento que se ejecuta al recibir un número por radio
radio.onReceivedNumber(function (receivedNumber: number) {
    estadoRecibido = receivedNumber
})

// Control principal del carro
basic.forever(function () {
    if (estadoRecibido == 1) {
        // --- RESPUESTA CORRECTA ---
        pins.digitalWritePin(LED_VERDE, 1)
        pins.digitalWritePin(LED_ROJO, 0)

        let tiempoInicio = input.runningTime()
        
        while (input.runningTime() - tiempoInicio < 3000) {
            let sensorIzquierdo = pins.digitalReadPin(DigitalPin.P12)
            let sensorDerecho = pins.digitalReadPin(DigitalPin.P13)

            if (sensorIzquierdo == 1 && sensorDerecho == 1) {
                setMotor(1, 140)
                setMotor(2, 140)
            } else if (sensorIzquierdo == 1 && sensorDerecho == 0) {
                setMotor(1, 40)
                setMotor(2, 140)
            } else if (sensorIzquierdo == 0 && sensorDerecho == 1) {
                setMotor(1, 140)
                setMotor(2, 40)
            } else {
                setMotor(1, 90)
                setMotor(2, 90)
            }
            basic.pause(15)
        }

        detenerCarro()
        pins.digitalWritePin(LED_VERDE, 0)
        estadoRecibido = 0

    } else if (estadoRecibido == 2) {
        // --- RESPUESTA INCORRECTA ---
        pins.digitalWritePin(LED_VERDE, 0)
        pins.digitalWritePin(LED_ROJO, 1)
        detenerCarro()

        basic.pause(3000)
        pins.digitalWritePin(LED_ROJO, 0)
        estadoRecibido = 0

    } else {
        // --- REPOSO ---
        detenerCarro()
        pins.digitalWritePin(LED_VERDE, 0)
        pins.digitalWritePin(LED_ROJO, 0)
    }
    
    basic.pause(50)
})
