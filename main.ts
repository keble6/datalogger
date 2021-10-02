function upLoadBT () {
    basic.pause(100)
    readingsLength = dateTimeList.length
    if (readingsLength != 0) {
        for (let index = 0; index <= readingsLength - 1; index++) {
            if (BTconnected == 1) {
                bluetooth.uartWriteString(dateTimeList[index])
                basic.pause(200)
                bluetooth.uartWriteString(", ")
                basic.pause(100)
                bluetooth.uartWriteString(string2csv(dec2bin(pinReadingList[index])))
                basic.pause(100)
                bluetooth.uartWriteLine("")
                basic.pause(100)
            }
        }
    } else {
        bluetooth.uartWriteLine("No stored readings!")
    }
    // Turn off display to allow use of all pins
    led.enable(false)
}
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
    } else if (command.compare("up") == 0) {
        upLoadUSB()
    } else {
        serial.writeLine("Invalid command")
    }
}
function dec2bin (num: number) {
    string = ""
    maxbits = numInputs - 1
    x = num
    for (let i = 0; i <= maxbits; i++) {
        div = 2 ** (maxbits - i)
        bit = Math.floor(x / div)
        string = "" + string + convertToText(bit)
        x = x - bit * div
    }
    return string
}
function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
bluetooth.onBluetoothConnected(function () {
    BTconnected = 1
    // Turn off display to allow use of all pins
    led.enable(true)
    basic.pause(100)
    upLoadBT()
})
bluetooth.onBluetoothDisconnected(function () {
    BTconnected = 0
    // Turn off display to allow use of all pins
    led.enable(false)
})
function dateTimeString () {
    return "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year() + " " + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute()) + ":" + leadingZero(DS3231.second())
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
function string2csv (string: string) {
    csv = ""
    bit = 0
    for (let index = 0; index < numInputs - 1; index++) {
        csv = "" + csv + string.charAt(bit) + ","
        bit += 1
    }
    return csv
}
function upLoadUSB () {
    readingsLength = dateTimeList.length
    serial.writeLine("readingsLength = " + readingsLength)
    if (readingsLength != 0) {
        for (let index22 = 0; index22 <= readingsLength - 1; index22++) {
            serial.writeString(dateTimeList[index22])
            basic.pause(10)
            serial.writeString(", ")
            basic.pause(10)
            serial.writeString("" + (string2csv(dec2bin(pinReadingList[index22]))))
            basic.pause(10)
            serial.writeLine("")
            basic.pause(10)
        }
    } else {
        serial.writeLine("No stored readings!")
    }
}
// Serial USB - requires at Terminal: local echo, CR+LF on send, clear input on send
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    stringIn = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    parseCommand()
})
let inNumber = 0
let csv = ""
let mm = ""
let hh = ""
let dt = ""
let mo = ""
let yr = ""
let bit = 0
let div = 0
let x = 0
let maxbits = 0
let string = ""
let params = ""
let stringIn = ""
let command = ""
let BTconnected = 0
let readingsLength = 0
let pinReadingList: number[] = []
let dateTimeList: string[] = []
let numInputs = 0
bluetooth.startUartService()
// Number of inputs
numInputs = 9
serial.writeLine("Starting DATA LOGGER!")
let loggingEnable = 1
let Pstate = [0]
let sampleTime = 1000
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
// P16 is used to switch the 2.0V reference for Vbat
pins.digitalWritePin(DigitalPin.P16, 1)
pins.setPull(DigitalPin.P16, PinPullMode.PullNone)
let lastInNumber = 1024
dateTimeList = []
pinReadingList = [0]
loops.everyInterval(sampleTime, function () {
    inNumber = 0
    inNumber += pins.digitalReadPin(DigitalPin.P1)
    inNumber += 2 * pins.digitalReadPin(DigitalPin.P2)
    inNumber += 4 * pins.digitalReadPin(DigitalPin.P3)
    inNumber += 8 * pins.digitalReadPin(DigitalPin.P4)
    inNumber += 16 * pins.digitalReadPin(DigitalPin.P5)
    inNumber += 32 * pins.digitalReadPin(DigitalPin.P6)
    inNumber += 64 * pins.digitalReadPin(DigitalPin.P7)
    inNumber += 128 * pins.digitalReadPin(DigitalPin.P8)
    inNumber += 256 * pins.digitalReadPin(DigitalPin.P9)
    // suspend logging if BT connected
    if (inNumber != lastInNumber && BTconnected == 0) {
        serial.writeLine("Logging: " + inNumber)
        // store timestamp
        dateTimeList.push(dateTimeString())
        // store pin state
        pinReadingList.push(inNumber)
        lastInNumber = inNumber
    }
    // Make a reading once every hour as a heartbeat
    if (DS3231.minute() == 0 && DS3231.second() == 0 && BTconnected == 0) {
        // store timestamp
        dateTimeList.push(dateTimeString())
        // store pin state
        pinReadingList.push(inNumber)
        serial.writeLine("Logging  hourly at  " + dateTimeString())
    }
})
