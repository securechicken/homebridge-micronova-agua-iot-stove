# homebridge-micronova-agua-iot-stove
Homebridge plugin to manage a Micronova's Agua IOT WiFi module controlled stove, from iOS/HomeKit.

| :boom: ALPHA STATE         |
|:---------------------------|
| This module is in ALPHA state, and should only be considered a testing version. |

This module implementation has been made possible in a reasonable (free and personal) time, thanks to a previous [stove module](https://github.com/securechicken/homebridge-piazzetta-stove-simple) similar development, and an existing open-source [Micronova Agua IOT implementation](https://github.com/fredericvl/py-agua-iot) by @fredericvl (thanks a lot to him).

## Supported stoves
This module has been developed for personal use, in order to control a single Piazzetta stove.  
Here is the list of stove brands for which models have been tested to be working:
- Piazzetta

The module should however be working with some/most of Micronova's Agua IOT WiFi module controlled stoves (see [py-agua-iot](https://github.com/fredericvl/py-agua-iot) for a list of possibly supported brands).  
If you want to test (or tested already) the module with a model which is not supported yet, but available and working with [py-agua-iot](https://github.com/fredericvl/py-agua-iot), feel free to open a feature request issue.  

## Capabilities and limitations
The module runs as an Homebridge "Heater Cooler" device type, as it is the only fit device type from Homebridge available interfaces.  
Specific tricks have been deployed to expose it as a heating only device.  
The module allows for powering ON/OFF, setting target temperature, and flame/flow power.  
The module is only supporting one unique stove (the one of the same name than you will give in this plugin config, and that you previously set up in official mobile app).

The flame/flow power is set through "Fan Rotation Speed" (but is correctly stepped and ranged), as this is the only available control to set such value within HomeKit.  
As supported stoves do not all enable air flow swinging or physical commands lock, these HomeKit controls are disabled and should not appear in HomeKit (however, due to a bug in HomeKit, the "Fan Swinging" option may still be available, but will do nothing).  
Temperature is set to be displayed in Celsius degrees.  
A power-state swing protection mechanism prevents any power-state order (ON or OFF) to be passed to the stove if it is in target state already, or if last power-state change from HomeKit occurred within 60 minutes. Otherwise, automatic HomeKit requests may require power ON/OFF just to sync app widgets and device would end-up over-heating the stove for nothing, and triggering its self-protection.  
Any "idle" like status (flame waiting, lighting, standby, cleaning, alarm, etc.) will be represented as device ON and status badge "IDLE" (green) in HomeKit.  
Any regular heating status (working, heating) will be represented as device ON and status badge "HEATING" (orange) in HomeKit.  
Any other status is considered as the device being OFF/inactive.

Some status refreshes might not be honored as quickly as HomeKit or Homebrridge would like, and the "Unresponsive" message might appear sometimes:
- first the Homebridge "bridge" design is by itself limiting responsiveness to HomeKit, and you might encounter the same behavior with other devices,
- the more devices and plugins you have, the more Homebridge will take time to update devices status, the morre HomeKit will have to wait,
- the Micronova Agua IOT API, which this module relies on, is sometimes unresponsive. As so, some requests will fail (just as they would in official mobile app).

None of known limitations are preventing the module/plugin to integrate your home automation with HomeKit, and to be able to support most simple scenarios, the main one being remotely starting/stopping your stove based on conditions or manually.

## Plugin Installation
Via Homebridge Plugins tab, by typing and searching for the plugin name (`homebridge-micronova-agua-iot-stove`), or via NPM (`npm install -g homebridge-micronova-agua-iot-stove`).

## Settings
The plugin configuration is done via Homebridge UI plugins settings, and is documented.  
The result is saved in Homebridge config and looks like this, but should not to be manually edited:
```
{
    "name": "<stove name, MUST be the same than one you configured in official stove mobile app, and you now want to control from HomeBridge>",
    "brand": "<stove brand, to be chosen from a list, as it actually affects plugin internal settings>",
    "login": "<Your regular stove app login (MyPiazzetta for Piazzetta stoves)>",
    "password": "<Your regular stove app password (MyPiazzetta for Piazzetta stoves)>",
    "accessory": "HeaterCoolerMicronovaAguaIOTStove"
}
```

## Association
As the module is an accessory one, once plugin configuration is done and Homebridge restarted, the stove should appear in HomeKit without any further setup.
