/*******************************************************************************
 * MakeCode extension for ESP8266 Wifi module .
 *
 * Company: Cytron Technologies Sdn Bhd
 * Website: http://www.cytron.io
 * Email:   support@cytron.io
 *******************************************************************************/

/**
 * Blocks for Internet Of Things : ESP8266 WiFi - Blynk module.
 */
//% weight=10 color=#ff8000 icon="\uf1eb" block="IOT"
namespace esp8266 {
    // Flag to indicate whether the ESP8266 was initialized successfully.
    let esp8266Initialized = false

    // Buffer for data received from UART.
    let rxData = ""

    let pinTx: SerialPin
    let pinRx: SerialPin
    let bdr: BaudRate


    /**
     * Send AT command and wait for response.
     * Return true if expected response is received.
     * @param command The AT command without the CRLF.
     * @param expected_response Wait for this response.
     * @param timeout Timeout in milliseconds.
     */
    //% blockHidden=true
    //% blockId=esp8266_send_command
    export function sendCommand(command: string, expected_response: string = null, timeout: number = 100): boolean {
        // Wait a while from previous command.
        basic.pause(10)

        // Flush the Rx buffer.
        serial.readString()
        rxData = ""

        // Send the command and end with "\r\n".
        serial.writeString(command + "\r\n")

        // Don't check if expected response is not specified.
        if (expected_response == null) {
            return true
        }

        // Wait and verify the response.
        let result = false
        let timestamp = input.runningTime()
        while (true) {
            // Timeout.
            if (input.runningTime() - timestamp > timeout) {
                result = false
                break
            }

            // Read until the end of the line.
            rxData += serial.readString()
            if (rxData.includes("\r\n")) {
                // Check if expected response received.
                if (rxData.slice(0, rxData.indexOf("\r\n")).includes(expected_response)) {
                    result = true
                    break
                }

                // If we expected "OK" but "ERROR" is received, do not wait for timeout.
                if (expected_response == "OK") {
                    if (rxData.slice(0, rxData.indexOf("\r\n")).includes("ERROR")) {
                        result = false
                        break
                    }
                }

                // Trim the Rx data before loop again.
                rxData = rxData.slice(rxData.indexOf("\r\n") + 2)
            }
        }

        return result
    }



    /**
     * Get the specific response from ESP8266.
     * Return the line start with the specific response.
     * @param command The specific response we want to get.
     * @param timeout Timeout in milliseconds.
     */
    //% blockHidden=true
    //% blockId=esp8266_get_response
    export function getResponse(response: string, timeout: number = 100): string {
        let responseLine = ""
        let timestamp = input.runningTime()
        while (true) {
            // Timeout.
            if (input.runningTime() - timestamp > timeout) {
                // Check if expected response received in case no CRLF received.
                if (rxData.includes(response)) {
                    responseLine = rxData
                }
                break
            }

            // Read until the end of the line.
            rxData += serial.readString()
            if (rxData.includes("\r\n")) {
                // Check if expected response received.
                if (rxData.slice(0, rxData.indexOf("\r\n")).includes(response)) {
                    responseLine = rxData.slice(0, rxData.indexOf("\r\n"))

                    // Trim the Rx data for next call.
                    rxData = rxData.slice(rxData.indexOf("\r\n") + 2)
                    break
                }

                // Trim the Rx data before loop again.
                rxData = rxData.slice(rxData.indexOf("\r\n") + 2)
            }
        }

        return responseLine
    }



    /**
     * Format the encoding of special characters in the url.
     * @param url The url that we want to format.
     */
    //% blockHidden=true
    //% blockId=esp8266_format_url
    export function formatUrl(url: string): string {
        url = url.replaceAll("%", "%25")
        url = url.replaceAll(" ", "%20")
        url = url.replaceAll("!", "%21")
        url = url.replaceAll("\"", "%22")
        url = url.replaceAll("#", "%23")
        url = url.replaceAll("$", "%24")
        url = url.replaceAll("&", "%26")
        url = url.replaceAll("'", "%27")
        url = url.replaceAll("(", "%28")
        url = url.replaceAll(")", "%29")
        url = url.replaceAll("*", "%2A")
        url = url.replaceAll("+", "%2B")
        url = url.replaceAll(",", "%2C")
        url = url.replaceAll("-", "%2D")
        url = url.replaceAll(".", "%2E")
        url = url.replaceAll("/", "%2F")
        url = url.replaceAll(":", "%3A")
        url = url.replaceAll(";", "%3B")
        url = url.replaceAll("<", "%3C")
        url = url.replaceAll("=", "%3D")
        url = url.replaceAll(">", "%3E")
        url = url.replaceAll("?", "%3F")
        url = url.replaceAll("@", "%40")
        url = url.replaceAll("[", "%5B")
        url = url.replaceAll("\\", "%5C")
        url = url.replaceAll("]", "%5D")
        url = url.replaceAll("^", "%5E")
        url = url.replaceAll("_", "%5F")
        url = url.replaceAll("`", "%60")
        url = url.replaceAll("{", "%7B")
        url = url.replaceAll("|", "%7C")
        url = url.replaceAll("}", "%7D")
        url = url.replaceAll("~", "%7E")
        return url
    }



    /**
     * Renvoie Vrai (True) si le composant ESP8266 est initialisé.
     */
    //% group=ESP8266
    //% weight=29
    //% blockGap=8
    //% blockId=esp8266_is_esp8266_initialized
    //% block="[ESP8266] Composant initialisé"
    export function isESP8266Initialized(): boolean {
        return esp8266Initialized
    }



    /**
     * Initialise le composant ESP8266 pour la connexion sans fil (WIFI).
     * @param tx Tx pin of micro:bit. eg: SerialPin.P8
     * @param rx Rx pin of micro:bit. eg: SerialPin.P12
     * @param baudrate UART baudrate. eg: BaudRate.BaudRate115200
     */
    //% group=ESP8266
    //% weight=30
    //% blockGap=8
    //% blockId=esp8266_init
    //% block="[ESP8266] Initialiser | Tx: $tx Rx: $rx Baudrate: $baudrate"
    //% expandableArgumentMode="toggle"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    //% baudrate=BaudRate.BaudRate115200
    export function init(tx?: SerialPin, rx?: SerialPin, baudrate?: BaudRate) {

        pinTx = tx
        pinRx = rx
        bdr = baudrate

        // Redirect the serial port.
        // serial.redirect(tx, rx, baudrate)
        serial.redirect(pinTx, pinRx, bdr)
        serial.setTxBufferSize(128)
        serial.setRxBufferSize(128)

        // Reset the flag.
        esp8266Initialized = false

        // Restore the ESP8266 factory settings.
        if (sendCommand("AT+RESTORE", "ready", 5000) == false) return

        // Turn off echo.
        if (sendCommand("ATE0", "OK") == false) return

        // Initialized successfully.
        // Set the flag.
        esp8266Initialized = true
    }



  


    /**
    * Renvoie l'adresse IP locale du composant ESP8266.
    */
    //% group=ESP8266
    //% weight=25
    //% blockGap=8
    //% blockId=esp8266_get_local_ip_address
    //% block="[ESP8266] Adresse IP locale "
    export function getLocalIpAddress(): string {
        // Obtain the Local IP address.
        let ipAddress = ""
        let tab_ipAddress:string[] = null

        sendCommand("AT+CIFSR")
        ipAddress = getResponse("STAIP", 1000)

        // Wait until OK is received.
        getResponse("OK")

        // Extract Local IP address from string (between "...")   CIFSR:STAIP,<"STAIP">
        tab_ipAddress = ipAddress.split("\"")
        return tab_ipAddress[1]
        
    }



    /**
     * Connecter le composant ESP8266 à un point d'accès WiFi.
     * @param ssid: Nom du point d'accès (SSID)
     * @param password: Clé WiFi
     */
    //% group=ESP8266
    //% weight=28
    //% blockGap=40
    //% blockId=esp8266_connect_wifi
    //% block="[ESP8266] Connecter au point d'accès WiFi  Nom(SSID):%ssid Clé:%password"
    export function connectWiFi(ssid: string, password: string) {
        // Set to station mode.
        sendCommand("AT+CWMODE=1", "OK")

        // Connect to WiFi router.
        sendCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", "OK", 20000)
    }


    /**
       * Renvoie Vrai(true) si le composant ESP8266 est connecté en WiFi au réseau.
       */
    //% group=ESP8266
    //% weight=27
    //% blockGap=8
    //% blockId=esp8266_is_wifi_connected
    //% block="[ESP8266] Connecté au point d'accès WiFi"
    export function isWifiConnected(): boolean {
        // Get the connection status.
        sendCommand("AT+CIPSTATUS")
        let status = getResponse("STATUS:", 1000)

        // Wait until OK is received.
        getResponse("OK")

        // Return the WiFi status.
        if ((status == "") || status.includes("STATUS:5")) {
            return false
        }
        else {
            return true
        }
    }



    // Flag to indicate whether the blynk data was updated successfully.
    let blynkUpdated = false

    // Blynk servers.
    let blynkServers = ["blynk.cloud", "fra1.blynk.cloud", "lon1.blynk.cloud",
        "ny3.blynk.cloud", "sgp1.blynk.cloud", "blr1.blynk.cloud"]


    
    /**
     * Lit la valeur d'un champ enregistré sur Blynk.
     * @param authToken : clé d'authentification Blynk
     * @param pin : champ dont on veut connaître la valeur
     */
    //% group="Blynk"
    //% weight=29
    //% blockGap=8
    //% blockId=esp8266_read_blynk
    //% block="[Blynk] Lire données  Clé:%authToken Champ:%pin"
    export function readBlynk(authToken: string, pin: string): string {
        let value = ""

        // Reset the upload successful flag.
        blynkUpdated = false

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return value

        // Loop through all the blynk servers.
        for (let i = 0; i < blynkServers.length; i++) {
            // Connect to Blynk.
            if (sendCommand("AT+CIPSTART=\"TCP\",\"" + blynkServers[i] + "\",80", "OK", 5000) == true) {

                // Construct the data to send.
                // http://blynk.cloud/external/api/get?token={token}&{pin}
                let data = "GET /external/api/get?token=" + authToken + "&" + pin + " HTTP/1.1\r\n"

                // Send the data.
                sendCommand("AT+CIPSEND=" + (data.length + 2), "OK")
                sendCommand(data)

                // Verify if "SEND OK" is received.
                if (getResponse("SEND OK", 5000) != "") {

                    // Make sure Blynk response is 200.
                    if (getResponse("HTTP/1.1", 5000).includes("200 OK")) {

                        // Get the pin value.
                        // It should be the last line in the response.
                        while (true) {
                            let response = getResponse("", 200)
                            if (response == "") {
                                break
                            } else {
                                value = response
                            }
                        }

                        // Set the upload successful flag.
                        blynkUpdated = true
                    }
                }
            }

            // Close the connection.
            sendCommand("AT+CIPCLOSE", "OK", 1000)

            // If blynk is updated successfully.
            if (blynkUpdated == true) {
                // Rearrange the Blynk servers array to put the correct server at first location.
                let server = blynkServers[i]
                blynkServers.splice(i, 1)
                blynkServers.unshift(server)

                break
            }

        }

        return value
    }



    /**
     * Enregistre la valeur d'un champ sur Blynk.
     * @param authToken : clé d'authentification Blynk
     * @param pin : champ dont on veut connaître la valeur
     * @param value : Valeur du champ
     */
    //% group="Blynk"
    //% weight=28
    //% blockGap=8
    //% blockId=esp8266_write_blynk
    //% block="[Blynk] Ecrire données  Clé:%authToken Champ:%pin Valeur:%value"
    export function writeBlynk(authToken: string, pin: string, value: string) {

        // Reset the upload successful flag.
        blynkUpdated = false

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

        // Loop through all the blynk servers.
        for (let i = 0; i < blynkServers.length; i++) {
            // Connect to Blynk.
            if (sendCommand("AT+CIPSTART=\"TCP\",\"" + blynkServers[i] + "\",80", "OK", 5000) == true) {

                // Construct the data to send.
                // http://blynk.cloud/external/api/update?token={token}&{pin}={value}
                let data = "GET /external/api/update?token=" + authToken + "&" + pin + "=" + formatUrl(value) + " HTTP/1.1\r\n"

                // Send the data.
                sendCommand("AT+CIPSEND=" + (data.length + 2), "OK")
                sendCommand(data)

                // Verify if "SEND OK" is received.
                if (getResponse("SEND OK", 5000) != "") {

                    // Make sure Blynk response is 200.
                    if (getResponse("HTTP/1.1", 5000).includes("200 OK")) {

                        // Get the pin value.
                        // It should be the last line in the response.
                        while (true) {
                            let response = getResponse("", 200)
                            if (response == "") {
                                break
                            } else {
                                value = response
                            }
                        }

                        // Set the upload successful flag.
                        blynkUpdated = true
                    }
                }
            }

            // Close the connection.
            sendCommand("AT+CIPCLOSE", "OK", 1000)

            // If blynk is updated successfully.
            if (blynkUpdated == true) {
                // Rearrange the Blynk servers array to put the correct server at first location.
                let server = blynkServers[i]
                blynkServers.splice(i, 1)
                blynkServers.unshift(server)

                break
            }

        }

        return
    }


    /**
         * Renvoie vrai si les données envoyées au site Blynk ont été prises en compte.
         */
    //% group="Blynk"
    //% weight=27
    //% blockGap=8
    //% blockId=esp8266_is_blynk_data_updated
    //% block="[Blynk] Mis à jour"
    export function isBlynkUpdated(): boolean {
        return blynkUpdated
    }



}
