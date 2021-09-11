datalogger.onLogFull(function () {
    logging = false
})
input.onButtonPressed(Button.AB, function () {
    datalogger.deleteLog()
})
let P1State = 0
let logging = false
logging = true
datalogger.setColumns(["P0", "P1"])
datalogger.includeTimestamp(FlashLogTimeStampFormat.Seconds)
loops.everyInterval(10000, function () {
    if (logging) {
        P1State = pins.digitalReadPin(DigitalPin.P1)
        if (P1State == 0) {
            basic.showIcon(IconNames.No)
        } else {
            basic.showIcon(IconNames.Yes)
        }
        datalogger.logData([datalogger.createCV("P1", P1State)])
    }
})
