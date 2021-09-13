function readTime () {
	
}
function parseCommand () {
    command = stringIn.substr(0, 2)
    params = stringIn.substr(2, stringIn.length - 2)
    if (command.compare("xx") == 0) {
        serial.writeLine("Deleting log!")
        datalogger.deleteLog()
    } else if (command.compare("rt") == 0) {
        readTime()
    } else if (command.compare("st") == 0) {
        setTime()
    } else {
        serial.writeLine("Invalid command")
    }
}
datalogger.onLogFull(function () {
    logging = false
})
function setTime () {
    serial.writeLine("" + command + ": " + params)
    yr = params.substr(0, 4)
    mo = params.substr(4, 2)
    dt = params.substr(6, 2)
    hh = params.substr(8, 2)
    mm = params.substr(10, 2)
    DS3231.dateTime(
    parseFloat(yr),
    parseFloat(mm),
    parseFloat(dt),
    1,
    parseFloat(hh),
    parseFloat(mm),
    0
    )
    serial.writeLine("Dare & time have been set ")
}
let inNumber = 0
let charIn = ""
let mm = ""
let hh = ""
let dt = ""
let mo = ""
let yr = ""
let params = ""
let stringIn = ""
let command = ""
let logging = false
led.enable(false)
let Pstate = [0, 1]
pins.setPull(DigitalPin.P0, PinPullMode.PullNone)
pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
pins.setPull(DigitalPin.P3, PinPullMode.PullNone)
pins.setPull(DigitalPin.P4, PinPullMode.PullNone)
pins.setPull(DigitalPin.P5, PinPullMode.PullNone)
pins.setPull(DigitalPin.P6, PinPullMode.PullNone)
pins.setPull(DigitalPin.P7, PinPullMode.PullNone)
pins.setPull(DigitalPin.P8, PinPullMode.PullNone)
pins.setPull(DigitalPin.P9, PinPullMode.PullNone)
logging = true
let lastInNumber = 1024
datalogger.setColumns([
"IN1 +24V",
"IN2 SOL-",
"IN3 SOL+",
"IN4 ESTOP2",
"IN5 ESTOP1",
"IN6 KEY NC",
"IN7 KEY NO",
"IN8 PED OPEN",
"IN9 PED CLOSE",
"inNumber"
])
datalogger.includeTimestamp(FlashLogTimeStampFormat.Minutes)
datalogger.mirrorToSerial(false)
basic.forever(function () {
    charIn = serial.readString()
    stringIn = "" + stringIn + charIn
    if (charIn.compare(String.fromCharCode(13)) == 0) {
        serial.writeString("" + String.fromCharCode(13) + String.fromCharCode(10))
        parseCommand()
        stringIn = ""
    } else {
        serial.writeString(charIn)
    }
})
loops.everyInterval(5000, function () {
    if (logging) {
        serial.writeLine("Logging sample start")
        Pstate[1] = pins.digitalReadPin(DigitalPin.P1)
        Pstate[2] = pins.digitalReadPin(DigitalPin.P2)
        Pstate[3] = pins.digitalReadPin(DigitalPin.P3)
        Pstate[4] = pins.digitalReadPin(DigitalPin.P4)
        Pstate[5] = pins.digitalReadPin(DigitalPin.P5)
        Pstate[6] = pins.digitalReadPin(DigitalPin.P6)
        Pstate[7] = pins.digitalReadPin(DigitalPin.P7)
        Pstate[8] = pins.digitalReadPin(DigitalPin.P8)
        Pstate[9] = pins.digitalReadPin(DigitalPin.P9)
        inNumber = 0
        for (let index = 0; index <= 8; index++) {
            inNumber += Pstate[index + 1] * 2 ** index
            // debug
            serial.writeString("" + Pstate[index + 1] + ", ")
        }
        lastInNumber = 0
    }
    serial.writeLine("inNumber =" + inNumber)
    if (inNumber != lastInNumber) {
        datalogger.logData([
        datalogger.createCV("IN1 +24V", Pstate[1]),
        datalogger.createCV("IN2 SOL-", Pstate[2]),
        datalogger.createCV("IN3 SOL+", Pstate[3]),
        datalogger.createCV("IN4 ESTOP2", Pstate[4]),
        datalogger.createCV("IN5 ESTOP1", Pstate[5]),
        datalogger.createCV("IN6 KEY NC", Pstate[6]),
        datalogger.createCV("IN7 KEY NO", Pstate[7]),
        datalogger.createCV("IN8 PED OPEN", Pstate[8]),
        datalogger.createCV("IN9 PED CLOSE", Pstate[9]),
        datalogger.createCV("inNumber", inNumber)
        ])
    }
    lastInNumber = inNumber
})
