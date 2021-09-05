datalogger.onLogFull(function () {
    logging = false
})
input.onButtonPressed(Button.AB, function () {
    datalogger.deleteLog()
})
let logging = false
logging = true
let lastTemperature = input.temperature()
let temperature = input.temperature()
datalogger.setColumns(["temperature"])
datalogger.includeTimestamp(FlashLogTimeStampFormat.Seconds)
loops.everyInterval(1000, function () {
    if (logging) {
        lastTemperature = temperature
        temperature = input.temperature()
        if (temperature != lastTemperature) {
            datalogger.logData([datalogger.createCV("temperature", temperature)])
        }
    }
})
