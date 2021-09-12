datalogger.onLogFull(function () {
    logging = false
})
input.onButtonPressed(Button.AB, function () {
    datalogger.deleteLog()
})
let inNumber = 0
let logging = false
logging = true
datalogger.setColumns(["inNumber"])
datalogger.includeTimestamp(FlashLogTimeStampFormat.Seconds)
datalogger.mirrorToSerial(true)
loops.everyInterval(1000, function () {
    inNumber = 0
    if (logging) {
        inNumber += pins.digitalReadPin(DigitalPin.P1)
        inNumber += 2 * pins.digitalReadPin(DigitalPin.P2)
        inNumber += 4 * pins.digitalReadPin(DigitalPin.P3)
        inNumber += 8 * pins.digitalReadPin(DigitalPin.P4)
        inNumber += 16 * pins.digitalReadPin(DigitalPin.P5)
        inNumber += 32 * pins.digitalReadPin(DigitalPin.P6)
        inNumber += 64 * pins.digitalReadPin(DigitalPin.P7)
        inNumber += 128 * pins.digitalReadPin(DigitalPin.P8)
        inNumber += 256 * pins.digitalReadPin(DigitalPin.P9)
        datalogger.logData([datalogger.createCV("inNumber", inNumber)])
    }
})
