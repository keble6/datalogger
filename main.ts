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
function readVbat () {
    // switch ON the 2.0V reference for Vbat
    pins.digitalWritePin(DigitalPin.P16, 0)
    basic.pause(100)
    P0ADC = pins.analogReadPin(AnalogPin.P0)
    // The ADC full scale is 1023 which is the Vbat (3V pin) voltage. So the number read at P0 (called P0ADC), which is held at 2.0V, is 1023*2.0/Vbat. So we get Vbat = 1023*2.0/PoADC
    vBat = vRef * 1023 * 10 / P0ADC
    // Round to 1 decimal place
    vBat = Math.floor(vBat)
    vBat = vBat / 10
    // switch OFF the 2.0V reference for Vbat
    pins.digitalWritePin(DigitalPin.P16, 1)
    return vBat
}
function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
bluetooth.onBluetoothConnected(function () {
    connected = 1
    // Turn on display to allow use Bluetooth
    led.enable(true)
    basic.pause(100)
    upLoad()
})
bluetooth.onBluetoothDisconnected(function () {
    connected = 0
    // Turn off display to allow use of all pins
    led.enable(false)
})
function upLoad () {
    serial.writeLine("Starting BT upload")
    basic.pause(100)
    readingsLength = dateTimeList.length
    if (readingsLength != 0) {
        for (let index = 0; index <= readingsLength - 1; index++) {
            if (connected == 1) {
                bluetooth.uartWriteString(dateTimeList[index])
                basic.pause(100)
                bluetooth.uartWriteString(", ")
                basic.pause(100)
                bluetooth.uartWriteString(string2csv(dec2bin(pinReadingList[index])))
                basic.pause(100)
                bluetooth.uartWriteNumber(vBatList[index])
                basic.pause(100)
                bluetooth.uartWriteLine("")
            }
        }
    } else {
        bluetooth.uartWriteLine("No stored readings!")
    }
    serial.writeLine("Ending BT upload")
}
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
        for (let index2 = 0; index2 <= readingsLength - 1; index2++) {
            serial.writeString(dateTimeList[index2])
            basic.pause(10)
            serial.writeString(", ")
            basic.pause(10)
            serial.writeString("" + (string2csv(dec2bin(pinReadingList[index2]))))
            basic.pause(10)
            serial.writeNumber(vBatList[index2])
            serial.writeLine("")
            basic.pause(10)
        }
    } else {
        serial.writeLine("No stored readings!")
    }
}
let inNumber = 0
let charIn = ""
let csv = ""
let mm = ""
let hh = ""
let dt = ""
let mo = ""
let yr = ""
let readingsLength = 0
let connected = 0
let vBat = 0
let P0ADC = 0
let bit = 0
let div = 0
let x = 0
let maxbits = 0
let string = ""
let params = ""
let stringIn = ""
let command = ""
let vBatList: number[] = []
let pinReadingList: number[] = []
let dateTimeList: string[] = []
let numInputs = 0
let vRef = 0
bluetooth.startUartService()
// Measured value of Vref at P0
vRef = 1.98
// Number of inputs
numInputs = 9
serial.writeLine("Starting DATA LOGGER!")
// Turn off display to allow use of all pins
led.enable(false)
// Reference voltage at P0 (when enabled by P16=0)
// vRef = 1.9
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
vBatList = [0]
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
    if (inNumber != lastInNumber) {
        serial.writeLine("Logging: " + inNumber)
        // store timestamp
        dateTimeList.push(dateTimeString())
        // store pin state
        pinReadingList.push(inNumber)
        // store timestamp
        vBatList.push(readVbat())
        lastInNumber = inNumber
    }
    // Make a reading once every hour as a heartbeat
    if (DS3231.minute() == 0 && DS3231.second() == 0) {
        // store timestamp
        dateTimeList.push(dateTimeString())
        // store pin state
        pinReadingList.push(inNumber)
        // store timestamp
        vBatList.push(readVbat())
        serial.writeLine("Logging  hourly at  " + dateTimeString())
    }
})
