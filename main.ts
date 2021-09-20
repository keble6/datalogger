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
    maxbits = 9
    maxbits += -1
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
    // Turn off display to allow use of all pins
    led.enable(true)
    // switch ON the 2.5V reference for Vbat
    pins.digitalWritePin(DigitalPin.P16, 0)
    basic.pause(10)
    P0ADC = pins.analogReadPin(AnalogPin.P0)
    // The ADC full scale is 1023 which is the Vbat (3V pin) voltage. So the number read at P0 (called P0ADC), which is held at 2.5V, is 1023*2.5/Vbat. So we get Vbat = 1023*2.5/PoADC
    vbat = 25575 / P0ADC
    // Round to 1 decimal place
    vbat = Math.floor(vbat)
    vbat = vbat / 10
    basic.showNumber(vbat)
    basic.pause(2000)
    // Turn off display to allow use of all pins
    led.enable(false)
    // switch OFF the 2.5V reference for Vbat
    pins.digitalWritePin(DigitalPin.P16, 1)
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
    upLoad()
})
bluetooth.onBluetoothDisconnected(function () {
    connected = 0
})
function upLoad () {
    serial.writeLine("Starting BT upload")
    basic.pause(100)
    readingsLength = dateTimeList.length
    if (readingsLength != 0) {
        for (let index = 0; index <= readingsLength - 1; index++) {
            if (connected == 1) {
                pinReading = dec2bin(pinReadingList[index])
                bluetooth.uartWriteString(dateTimeList[index])
                basic.pause(100)
                bluetooth.uartWriteString(", ")
                basic.pause(100)
                for (let bit2 = 0; bit2 <= 4; bit2++) {
                    bluetooth.uartWriteString("" + pinReading.charAt(8 - bit2) + ",")
                }
                for (let bit3 = 0; bit3 <= 3; bit3++) {
                    bluetooth.uartWriteString("" + pinReading.charAt(3 - bit3) + ",")
                }
                bluetooth.uartWriteLine("")
                basic.pause(100)
            }
        }
    } else {
        bluetooth.uartWriteLine("No stored readings!")
    }
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
function upLoadUSB () {
    readingsLength = dateTimeList.length
    if (readingsLength != 0) {
        for (let index2 = 0; index2 <= readingsLength - 1; index2++) {
            // convert number from pins to binary string
            pinReading = dec2bin(pinReadingList[index2])
            serial.writeString(dateTimeList[index2])
            basic.pause(10)
            serial.writeString(", ")
            basic.pause(10)
            for (let bit22 = 0; bit22 <= 4; bit22++) {
                serial.writeString("" + pinReading.charAt(8 - bit22) + ",")
                basic.pause(10)
            }
            for (let bit32 = 0; bit32 <= 3; bit32++) {
                serial.writeString("" + pinReading.charAt(3 - bit32) + ",")
                basic.pause(10)
            }
            serial.writeLine("")
        }
    } else {
        serial.writeLine("No stored readings!")
    }
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
let connected = 0
let vbat = 0
let P0ADC = 0
let bit = 0
let div = 0
let x = 0
let maxbits = 0
let string = ""
let params = ""
let stringIn = ""
let command = ""
let pinReadingList: number[] = []
let dateTimeList: string[] = []
serial.writeLine("Starting DATA LOGGER!")
// Turn off display to allow use of all pins
led.enable(false)
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
// P16 is used to switch the 2.5V reference for Vbat
pins.digitalWritePin(DigitalPin.P16, 1)
pins.setPull(DigitalPin.P16, PinPullMode.PullNone)
let lastInNumber = 1024
dateTimeList = [""]
pinReadingList = [0]
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
        // store pin state
        pinReadingList.push(inNumber)
        // store timestamp
        dateTimeList.push(dateTimeString())
        lastInNumber = inNumber
    }
    // Make a reading once every hour as a heartbeat
    if (DS3231.minute() == 0 && DS3231.second() == 0) {
        // store pin state
        pinReadingList.push(inNumber)
        // store timestamp
        dateTimeList.push(dateTimeString())
        serial.writeLine("Logging  hourly at  " + dateTimeString())
    }
})
loops.everyInterval(5000, function () {
    readVbat()
})
