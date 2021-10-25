# homebridge-micronova-agua-iot-stove
[Homebridge](https://github.com/homebridge/homebridge/) plugin to manage stoves/heaters with Micronova's Agua IOT module and HTTP API, from iOS/HomeKit.

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

## Disclaimer
This plugin implementation has been made possible in a reasonable (free and personal) time, thanks to a previous [stove plugin](https://github.com/securechicken/homebridge-piazzetta-stove-simple) similar development, and an existing open-source [Micronova Agua IOT implementation](https://github.com/fredericvl/py-agua-iot) by @fredericvl (thanks a lot to him). This plugin is provided to be used as it is within Homebrige by advanced and tech-savvy users, or to serve as a code base for developers. The initial developer does not intend to implement additional features, or to offer general support on Homebridge, Agua IOT and stoves models use. Issues which prevent elementary and intended functions to work properly will be reviewed and considered. Enhancements requests will only be accepted from proposed pull requests, or from issues on cases that are described by this README. Users are free to fork and adapt this code base according to their needs, and in compliance with the license.

## Supported stoves
This plugin has been developed for personal use, in order to control a single Piazzetta stove.  
Here is the list of stove brands for which models have been tested to be working (at least partially):
- Piazzetta
- Jolly Mec

The plugin should be working with most of Micronova's Agua IOT WiFi controlled stoves. If you tested the plugin with a model which is not listed as supported yet, but is working well, please open a feature request issue to report. If you want to test the plugin with a model which is not available but working with [py-agua-iot](https://github.com/fredericvl/py-agua-iot), feel free to open a feature request issue.  

## Intended capabilities scope
The plugin is aimed at providing such functionalities:
- Setting stove power ON/OFF,
- Setting stove combined power/ventilation level, from the lowest to the highest available managed levels,
- Setting stove target heating temperature value in °C,
- Getting stove power, current air temperature and combined power/ventilation level.

Any other function (special modes, auto/eco logic with temperature offsets, etc.) or value reading are not covered by the plugin, and will probably never be, due to the highly specific nature of implementation for each stove brand/model. Feel free to open a feature request issue if you feel a function that is available for all stoves/brands should be implemented; or to clone this repository to develop a brand/model-specific plugin.

## Limitations
The plugin runs as an Homebridge "Heater Cooler" device type, as it is the only fit device type from Homebridge available interfaces. Specific tricks have been deployed to expose it as a heating only device. The plugin allows for powering ON/OFF, setting target temperature, and flame/flow power. The plugin is only supporting one unique stove (the one of the same name than you will give in this plugin config, and that you previously set up in official mobile app).

The flame/flow power is set through "Fan Rotation Speed" (but is correctly stepped and ranged), as this is the only available control to set such value within HomeKit. As supported stoves do not all enable air flow swinging or physical commands lock, these HomeKit controls are disabled and should not appear in HomeKit (however, due to a bug in HomeKit, the "Fan Swinging" option may still be available, but will do nothing). Temperature is set to be displayed in Celsius degrees.

A power-state swing protection mechanism prevents any power-state order (ON or OFF) to be passed to the stove if last power-state change from HomeKit occurred within 60 minutes. Otherwise, you may end-up over-heating the stove for nothing, or triggering its self-protection. If you NEED to go around that, restart the plugin in Homebridge (or the whole instance). 

Status standby, alarm or final cleaning will be represented as device ON and status badge "IDLE" (green) in HomeKit. Status from ignition or working will be represented as device ON and status badge "HEATING" (orange) in HomeKit. OFF statuses are considered as the device being inactive (greyed). Any other status, and notably unknown ones, are represented as IDLE. Feel free to open a bug issue if a status is not correctly reported for your stove.

Some status refreshes might not be honored as quickly as HomeKit or Homebridge would like, and the "Unresponsive" message might appear sometimes:
- Homebridge is by design limiting responsiveness, as it acts as an additional device between HomeKit and real devices,
- if you encounter this with other devices, this might be a plugin slowing down the whole Homebridge instance, as Homebridge is only as fast as the slowest plugin. I advise to set plugins that work by requesting Web service as [child bridges](https://github.com/homebridge/homebridge/wiki/Child-Bridges). See this [Homebridge page](https://github.com/homebridge/homebridge/wiki/Characteristic-Warnings) to troubleshoot,
- the more devices and plugins you have, the more Homebridge will take time to update devices status, the more HomeKit will have to wait. If you use several plugins and/or lots of accessories, consider setting [child bridges](https://github.com/homebridge/homebridge/wiki/Child-Bridges),
- this plugin relies on the Micronova Agua IOT HTTP API to work. This last is sometimes (but rarely) unresponsive or down. As so, some requests will fail or take time anyway (just as they would in official mobile app).

None of known limitations are preventing the plugin to integrate your home automation with HomeKit, and to be able to support most simple scenarios, the main one being remotely starting/stopping your stove based on conditions or manually.

## Plugin Installation
Via Homebridge Plugins tab, by typing and searching for the plugin name (`homebridge-micronova-agua-iot-stove`), or via NPM (`npm install -g homebridge-micronova-agua-iot-stove`).

Setting this plugin as a [child bridge](https://github.com/homebridge/homebridge/wiki/Child-Bridges) is highly recommended for general performance and stability reasons.

## Settings
The plugin configuration is done via Homebridge UI plugins settings, and is documented.  
The result is saved in Homebridge config and looks like this, but should not to be manually edited:
```
{
    "name": "<stove name, MUST be the same than one you configured in official stove mobile app, and you now want to control from HomeBridge>",
    "brand": "<stove brand, to be chosen from a list, as it actually affects plugin internal settings>",
    "login": "<Your regular stove app login (MyPiazzetta for Piazzetta stoves)>",
    "password": "<Your regular stove app password (MyPiazzetta for Piazzetta stoves)>",
    "debug": false,
    "accessory": "HeaterCoolerMicronovaAguaIOTStove"
}
```

## Association
As the plugin is an accessory one, once plugin configuration is done and Homebridge restarted, the stove should appear in HomeKit without any further setup.  

If you set this plugin as a [child bridge](https://github.com/homebridge/homebridge/wiki/Child-Bridges), the child bridge will have to be associated to HomeKit before the stove appears.
