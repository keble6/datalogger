function parseCommand () {
    command = stringIn.substr(0, 2)
    params = stringIn.substr(2, stringIn.length - 2)
    if (command.compare("xx") == 0) {
        serial.writeLine("Deleting log!")
        datalogger.deleteLog()
    } else if (command.compare("rt") == 0) {
        serial.writeLine("" + (dateTimeString()))
    } else if (command.compare("st") == 0) {
        setTime()
        serial.writeLine("Time has been set")
    } else {
        serial.writeLine("Invalid command")
    }
}
function dec2bin (num: number) {
    return "1011"
}
function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
function upLoad () {
    basic.pause(100)
    readingsLength = dateTimeReadings.length
    if (readingsLength != 0) {
        for (let index = 0; index <= readingsLength - 1; index++) {
            let connected = 0
            if (connected == 1) {
                pinReading = dec2bin(pinReadings[index])
                bluetooth.uartWriteString(dateTimeReadings[index])
                basic.pause(100)
                bluetooth.uartWriteString(",")
                basic.pause(100)
                for (let bit = 0; bit <= 4; bit++) {
                    bluetooth.uartWriteString("" + pinReading.charAt(8 - bit) + ",")
                }
                for (let bit = 0; bit <= 3; bit++) {
                    bluetooth.uartWriteString("" + pinReading.charAt(3 - bit) + ",")
                }
                bluetooth.uartWriteLine("")
                basic.pause(100)
            }
        }
        basic.showIcon(IconNames.Yes)
    } else {
        bluetooth.uartWriteLine("No stored readings!")
    }
}
function dateTimeString () {
    return "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year() + " " + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
}
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
    serial.writeLine("Date & time have been set ")
}
let inNumber = 0
let charIn = ""
let mm = ""
let hh = ""
let dt = ""
let mo = ""
let yr = ""
let pinReading = ""
let readingsLength = 0
let params = ""
let stringIn = ""
let command = ""
let pinReadings: number[] = []
let dateTimeReadings: string[] = []
let Pstate = [0]
let sampleTime = 5000
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
let logging = true
let lastInNumber = 1024
dateTimeReadings = [""]
pinReadings = [0]
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
loops.everyInterval(sampleTime, function () {
    if (logging) {
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
        }
    }
    if (inNumber != lastInNumber) {
        serial.writeLine("Writing change to log: " + inNumber)
        pinReadings.push(inNumber)
        lastInNumber = inNumber
    }
})
