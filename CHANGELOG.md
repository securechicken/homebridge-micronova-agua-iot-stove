# Changelog

## [1.1.0] - 2021-10-31
- Fixed: despite more exceptions-handling attempts, refreshing authentication during API announced validity delay still fails after some time. The automatic authentification refresh delay is now set to an arbitrary value (4h), shorter than API announced duration validity, and a full login is done again when authentication expires unexpectedly (will generate non-blocking error messages in logs).
- Changed: stove alerts are now correctly displayed as warning in logs, using manufacturer-set error codes ("E7", etc.) instead of the alarm integer values stored in stove.
- Changed: reported temperatures now have a 0.5°C precision, if available from stove.
- Changed: stove data is now automatically refreshed every hour, even if no one is asking (so in case of error/freeze, last status in app is at most 1h-old).
- Changed: stove data is now read in a different way from API (direct individual values reading instead of full "buffer" reading), resulting in less memory use, better responsiveness, and more reliability.

## [1.0.3] - 2021-10-26
- Fixed: authentication sometimes expired before API declared validity delay for some brands, resulting in frozen status. Authentication is now done as needed if this happens.

## [1.0.2] - 2021-05-22
- Fixed: possible status update freeze in rare conditions when API replied unexpectedly

## [1.0.1] - 2021-05-18
- Fixed: login refresh tried forever in case of failure, instead of rebooting to regular login
- Changed: parse less (unused) device data, possible fix for plugin not finding stove name from API (#5)

## [1.0.0] - 2021-04-10
- Fixed: some API job responses were not correctly read as a successful response
- Changed: raised registers update job wait delay and number of retry attempts to avoid failing reads even when API is slow
- Changed: removed users secrets (password, authorization) from debug messages in Homebridge to avoid issues reports with secrets in it
- Changed: added more debug log messages to registers data update operations from API
- Changed: remove beta status after more than 20 days without issues report filled
- Added: is now a "Verified" Homebridge plugin

## [0.0.1-beta.3] - 2021-03-18
- Fixed: due to recent changes in the way Piazzetta uses Micronova Agua IOT, it is not possible anymore to login to Agua IOT API with a Piazzetta account. This has been fixed by processing the login at Piazzetta frontends, before going on with Agua IOT API. Thanks to the developer of Agua IOT API (Luca) for his help understanding these specific changes.

## [0.0.1-beta.2] - 2021-03-15
- Added: more possible status to cope with some stoves (issue #3)
- Changed: now reports user set power instead of stove real internal power level (issue #4)

## [0.0.1-beta.1] - 2021-03-14
- Added: plugin now considered in BETA state
- Added: better management of connectivity issues. The plugin now uses longer HTTP timeout delay, and retries indefinitely every 30s in case of network connection failure (DNS request error, timeout, etc.) for HTTP requests

## [0.0.1-alpha.3] - 2021-03-07
- Fixed: incorrect boundaries values calculation (issue #1)
- Fixed: device information shown from HomeKit was left default
- Fixed: inconsistant shown initial default state
- Added: possible activation of debug messages at plugin config level
- Added: to comply with Homebridge verified guidelines, plugins will not load if conf empty or invalid

## [0.0.1-alpha.2] - 2021-02-27
- Fixed: power state change issues. Different and wrong values were read/set during power state change, because of inconsistent values store naming at Micronova API ("get" instead of "set"), resulting in faulty current state checks, as well as possible incorrect power state changes. In particular, the heater could be put in a (previously unknown!) "non managed" OFF power state, where it is put OFF without going through usual shutdown phases. If such issue happens, put your heater OFF (and later ON again) manually or with official app.
- Added: a changelog and more warnings regarding ALPHA state :)

## [0.0.1-alpha.1] - 2021-02-27
- Fixed: performance issues (values updates now asynchronous, so Homebridge hangs less)
- Fixed: README documentation
- Added: more testable stove brands

## [0.0.1-alpha.0] - 2021-02-25
- Added: first public alpha and package

## [Unreleased]
