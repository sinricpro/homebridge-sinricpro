<p align="center">

<img src="https://github.com/homebridge/branding/blob/latest/logos/homebridge-wordmark-logo-horizontal.png" width="250">

</p>

### Homebridge Proxy which exposes Sinric Pro devices to Homekit.

The plugin uses Sinric Pro API and EventStream to map all the devices to HomeKit accessories.

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

### How to use this plug-in

1. Install Homebridge
2. Install SinricPro plugin
3. Enter the Your Sinric Pro API Key. If you do not have one, goto Sinric Pro Portal -> Credentials -> New API Key
4. Restart Homebridge. All your Sinric Pro devices will be synced on start-up

#### For Developments

1. git clone https://github.com/sinricpro/homebridge-sinricpro.git
2. cd homebridge-sinricpro
3. npm link
4. npm run watch

### Limitations

1. Apple does not allow more than 150 items per bridge.
2. Doorbell shows not supported.