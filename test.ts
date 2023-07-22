esp8266.init(SerialPin.P8, SerialPin.P12, BaudRate.BaudRate115200)
if (esp8266.isESP8266Initialized()) {
    basic.showIcon(IconNames.Heart)
    esp8266.connectWiFi("Livebox-BC46", "Zuoz2229qanELiPn9X")
    if (esp8266.isWifiConnected()) {
        basic.showIcon(IconNames.Yes)
        basic.showString(esp8266.getLocalIpAddress())
    } else {
        basic.showIcon(IconNames.No)
    }
} else {
    basic.showIcon(IconNames.SmallHeart)
}