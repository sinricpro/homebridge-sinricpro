<p align="center">

<img src="https://github.com/homebridge/branding/blob/latest/logos/homebridge-wordmark-logo-horizontal.png" width="250">

</p>

# Homebridge - SinricPro

This plugin seamlessly exposes all your SinricPro devices to HomeKit, enabling you to control your ESP8266/ESP32/Raspberry Pi Pico directly within the Apple Home app

### How to use this plug-in ?

1. Install Homebridge
2. Install SinricPro plugin
3. Enter the your Sinric Pro API key. If you do not have one, go to Sinric Pro Portal -> Credentials -> New API Key
4. Restart Homebridge. Your devices will be automatically synced and ready to be controlled through HomeKit!

#### Following devices types are supported:

|Sinric Pro |HomeKit Accessory |Notes
|---        |---               |--- 
| `Switch` | Switch | -
| `Blinds` | WindowCovering | -
| `Dimmable Switch` | Lightbulb | -
| `Fan` | Fan | -
| `Garage Door` | GarageDoorOpener | -
| `Light` | Lightbulb | -
| `Lock` | LockMechanism | -
| `Thermostat` | Thermostat | -
| `TV` | Television | On and Off only.
| `AC Unit` | Thermostat | -
| `Temperature Sensor` | TemperatureSensor and HumiditySensor | -
| `Motion Sensor` | MotionSensor | - 
| `Contact Sensor` | ContactSensor | - 



#### For Developments

1. git clone https://github.com/sinricpro/homebridge-sinricpro.git
2. cd homebridge-sinricpro
3. npm link
4. npm run watch

### Limitations

1. Apple does not allow more than 150 items per bridge.
2. Doorbell shows not supported.