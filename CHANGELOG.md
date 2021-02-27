# Changelog
All notable changes to this project will be documented in this file, and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

| :boom: ALPHA STATE         |
|:---------------------------|
| This plugin is in ALPHA state, and should only be considered a possibly *dangerous* testing version. You should setup this plugin as a [child bridge](https://github.com/homebridge/homebridge/wiki/Child-Bridges) in order to safeguard others plugins from an issue with this one. Things might not work as expected yet, or even put heaters in unwanted (yet reversible) states, feel free to open issues to report bugs. |

## [Unreleased]

## [0.0.1-alpha.2] - 2021-02-27
- Fixed: power state change issues. Different and wrong values were read/set during power state change, because of inconsistent values store naming at Micronova API ("get" instead of "set"), resulting in faulty current state checks, as well as possible incorrect power state changes. In particular, the heater could be put in a (previously unknown!) "non managed" OFF power state, where it is put OFF without going through usual shutdown phases. If such issue happens, put your heater OFF (and later ON again) manually or with official app.
- Added: a changelog and more warnings regarding ALPHA state :)

## [0.0.1-alpha.1] - 2021-02-27
- Fixed: performance issues (values updates now asynchronous, so Homebridge hangs less)
- Fixed: README documentation
- Added: more testable stove brands

## [0.0.1-alpha.0] - 2021-02-25
- Added: first public alpha and package.
