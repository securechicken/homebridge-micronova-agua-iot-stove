/*
homebridge-micronova-agua-iot-stove
Homebridge plugin to manage a Micronova's Agua IOT WiFi module controlled stove.
Licensed under AGPL-3.0-only License [https://www.gnu.org/licenses/agpl-3.0.en.html].
Copyright (C) 2021, @securechicken
*/

const PLUGIN_NAME = "homebridge-micronova-agua-iot-stove";
const PLUGIN_AUTHOR = "@securechicken";
const PLUGIN_VERSION = "0.0.1-alpha.0";
const PLUGIN_DEVICE_MANUFACTURER = "Micronova Agua IOT";
const ACCESSORY_PLUGIN_NAME = "HeaterCoolerMicronovaAguaIOTStove";

const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

module.exports = (api) => {
	api.registerAccessory(ACCESSORY_PLUGIN_NAME, HeaterCoolerMicronovaAguaIOTStove);
};

// Stove status registers (data) constants
const REGISTER_KEY_ID = "reg_key";
const REGISTER_KEY_OFFSET = "offset";
const REGISTER_KEY_TYPE = "reg_type";
const REGISTER_KEY_FORMULA = "formula";
const REGISTER_KEY_FORMULAREV = "formula_inverse";
const REGISTER_KEY_FORMAT = "format_string";
const REGISTER_KEY_MIN = "set_min";
const REGISTER_KEY_MAX = "set_max";
const REGISTER_KEY_MASK = "mask";
const REGISTER_KEY_ENCVAL = "enc_val";
const REGISTER_ENCVAL_KEY_LANG = "lang";
const REGISTER_ENCVAL_KEY_DESC = "description";
const REGISTER_ENCVAL_KEY_VAL = "value";
const REGISTER_INTERNAL_KEY_VALUE = "_v";
const REGISTER_INTERNAL_KEY_VALUEON = "_onv";
const REGISTER_INTERNAL_KEY_VALUEOFF = "_offv";
const REGISTER_VALUE_ENCVAL_LANG = "ENG";
const REGISTER_VALUE_ENCVAL_DESC_ON = "ON";
const REGISTER_VALUE_ENCVAL_DESC_OFF = "OFF";
const REGISTER_VALUE_FORMULA_VALPH = "#";
const REGISTER_VALUE_FORMULA_REGEX = /^([()\d][+\-*/]?)+$/;
const REGISTER_VALUE_STRING_VALPH = "{0}";

// API related constants
// Doc: https://<brand>.agua-iot.com:3001/api-docs/
const HTTP_TIMEOUT = 5000; // 5s in ms, the web service is somehow laggy
const HTTP_REQ_ACCEPT_HEADER = "Accept";
const HTTP_REQ_CONTENT_HEADER = "Content-Type";
const HTTP_REQ_ORIGIN_HEADER = "Origin";
const HTTP_REQ_ID_BRAND_HEADER = "id_brand";
const HTTP_REQ_CUSTOMER_CODE_HEADER = "customer_code";
const HTTP_REQ_UA_HEADER = "User-Agent";
const HTTP_REQ_LOCAL_HEADER = "local";
const HTTP_REQ_AUTH_HEADER = "Authorization";
const HTTP_ACCEPT = "application/json, text/javascript, */*; q=0.01";
const HTTP_CONTENT = "application/json";
const HTTP_ORIGIN = "file://";
const HTTP_ID_BRAND = "1";
const HTTP_UA = "homebridge-micronova-agua-iot-stove/" + PLUGIN_VERSION;
const API_APPSIGNUP = "/appSignup";
const POST_API_APPSIGNUP_KEY_TYPE = "phone_type";
const POST_API_APPSIGNUP_KEY_ID = "phone_id";
const POST_API_APPSIGNUP_KEY_VERSION = "phone_version";
const POST_API_APPSIGNUP_KEY_LANG = "language";
const POST_API_APPSIGNUP_KEY_IDAPP = "id_app";
const POST_API_APPSIGNUP_KEY_PUSHTOKEN = "push_notification_token";
const POST_API_APPSIGNUP_KEY_PUSHACTIVE = "push_notification_active";
const POST_API_APPSIGNUP_VALUE_TYPE = "Android";
const POST_API_APPSIGNUP_VALUE_LANG = "en";
const POST_API_APPSIGNUP_VALUE_PUSHACTIVE = false;
const API_LOGIN = "/userLogin";
const POST_API_LOGIN_KEY_LOGIN = "email";
const POST_API_LOGIN_KEY_PASSWORD = "password";
const RESP_API_LOGIN_KEY_TOKEN = "token";
const RESP_API_LOGIN_KEY_REFRESHTOKEN = "refresh_token";
const RESP_API_LOGIN_TOKEN_KEY_EXPIRY = "exp";
const API_REFRESHTOKEN = "/refreshToken";
const POST_API_REFRESHTOKEN_KEY_REFRESHTOKEN = RESP_API_LOGIN_KEY_REFRESHTOKEN;
const API_DEVICESLIST = "/deviceList";
const RESP_API_DEVICESLIST_KEY_DEVICES = "device";
const RESP_API_DEVICESLIST_KEY_DEVICE_ID = "id_device";
const RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT = "id_product";
const RESP_API_DEVICESLIST_KEY_DEVICE_SERIAL = "product_serial";
const RESP_API_DEVICESLIST_KEY_DEVICE_NAME = "name";
const RESP_API_DEVICESLIST_KEY_DEVICE_MODEL = "name_product";
const API_DEVICEINFO = "/deviceGetInfo";
const POST_API_DEVICEINFO_KEY_ID = RESP_API_DEVICESLIST_KEY_DEVICE_ID;
const POST_API_DEVICEINFO_KEY_PRODUCT = RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT;
const RESP_API_DEVICEINFO_KEY_INFO = "device_info";
const RESP_API_DEVICEINFO_KEY_REGISTERSMAP_ID = "id_registers_map";
const API_DEVICEREGISTERSMAP = "/deviceGetRegistersMap";
const POST_API_DEVICEREGISTERSMAP_KEY_ID = RESP_API_DEVICESLIST_KEY_DEVICE_ID;
const POST_API_DEVICEREGISTERSMAP_KEY_PRODUCT = RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT;
const POST_API_DEVICEREGISTERSMAP_KEY_LAST_UPDATE = "last_update";
const RESP_API_DEVICEREGISTERSMAP_KEY_L1 = "device_registers_map";
const RESP_API_DEVICEREGISTERSMAP_KEY_L2 = "registers_map";
const RESP_API_DEVICEREGISTERSMAP_KEY_ID = "id";
const RESP_API_DEVICEREGISTERSMAP_KEY_REGISTERS = "registers";
const RESP_API_DEVICEREGISTERSMAP_REGISTER_KEYS = [REGISTER_KEY_TYPE, REGISTER_KEY_OFFSET, REGISTER_KEY_FORMULA, REGISTER_KEY_FORMULAREV, REGISTER_KEY_FORMAT, REGISTER_KEY_MIN, REGISTER_KEY_MAX, REGISTER_KEY_MASK];
const API_DEVICEREADBUFFER = "/deviceGetBufferReading";
const POST_API_DEVICEREADBUFFER_KEY_ID = RESP_API_DEVICESLIST_KEY_DEVICE_ID;
const POST_API_DEVICEREADBUFFER_KEY_PRODUCT = RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT;
const POST_API_DEVICEREADBUFFER_KEY_BUFFER = "BufferId";
const POST_API_DEVICEREADBUFFER_VALUE_BUFFER = 1;
const RESP_API_DEVICEREADBUFFER_KEY_JOBID = "idRequest";
const API_DEVICEWRITEBUFFER = "/deviceRequestWriting";
const POST_API_DEVICEWRITEBUFFER_KEY_ID = RESP_API_DEVICESLIST_KEY_DEVICE_ID;
const POST_API_DEVICEWRITEBUFFER_KEY_PRODUCT = RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT;
const POST_API_DEVICEWRITEBUFFER_KEY_PROTO = "Protocol";
const POST_API_DEVICEWRITEBUFFER_KEY_BITDATA = "BitData";
const POST_API_DEVICEWRITEBUFFER_KEY_ENDIANESS = "Endianess";
const POST_API_DEVICEWRITEBUFFER_KEY_ITEMS = "Items";
const POST_API_DEVICEWRITEBUFFER_KEY_MASKS = "Masks";
const POST_API_DEVICEWRITEBUFFER_KEY_VALUES = "Values";
const POST_API_DEVICEWRITEBUFFER_VALUE_PROTO = "RWMSmaster";
const POST_API_DEVICEWRITEBUFFER_VALUE_BITDATA = [8];
const POST_API_DEVICEWRITEBUFFER_VALUE_ENDIANESS = ["L"];
const RESP_API_DEVICEWRITEBUFFER_KEY_JOBID = RESP_API_DEVICEREADBUFFER_KEY_JOBID;
const API_DEVICEJOBSTATUS = "/deviceJobStatus";
const API_DEVICEJOBSTATUS_MAX_RETRIES = 5;
const API_DEVICEJOBSTATUS_DELAY_RETRY = 700; // 500 ms
const RESP_API_DEVICEJOBSTATUS_KEY_STATUS = "jobAnswerStatus";
const RESP_API_DEVICEJOBSTATUS_KEY_RESULT = "jobAnswerData";
const RESP_API_DEVICEJOBSTATUS_RESULT_KEY_ITEMS = POST_API_DEVICEWRITEBUFFER_KEY_ITEMS;
const RESP_API_DEVICEJOBSTATUS_RESULT_KEY_VALUES = POST_API_DEVICEWRITEBUFFER_KEY_VALUES;
const RESP_API_DEVICEJOBSTATUS_RESULT_WRITE_KEY_ERRCODE = "NackErrCode";
const RESP_API_DEVICEJOBSTATUS_VALUE_STATUS_OK = "completed";
const DATE_NEVER = "1970-01-01T00:00:00.000Z";

// Module stove management constants
const POWER_SWING_PROTECTION_DELAY = 3600000; // 1h in ms
const STOVE_ALARM_REGISTER = "alarms_get";
const STOVE_ALARM_IGNORE_VALUES = [0, 3, 32]; // 0 is no alarm, 3 is unknown, 32 is awaiting flame
const STOVE_TEMP_DELTA = 1;
const STOVE_POWER_DELTA = 1;
const STOVE_POWER_STATE_INFO_REGISTER = "status_managed_get";
const STOVE_POWER_STATE_SET_ON_REGISTER = "status_managed_on_enable";
const STOVE_POWER_STATE_SET_OFF_REGISTER = "status_managed_off_enable";
const STOVE_STATE_REGISTER = "status_get";
const STOVE_CURRENT_TEMP_REGISTER = "temp_air_get";
const STOVE_SET_TEMP_REGISTER = "temp_air_set";
const STOVE_CURRENT_POWER_REGISTER = "real_power_get";
const STOVE_SET_POWER_REGISTER = "power_set";
const STOVE_REGISTERS_CACHE_KEEP = 10000; // 10s in ms

class HeaterCoolerMicronovaAguaIOTStove {
	constructor(log, config, api) {
		// Intro common module init
		this.config = config;
		this.api = api;
		this.log = log;
		this.Service = this.api.hap.Service;
		this.Characteristic = this.api.hap.Characteristic;
		this.log.debug("init config: " + JSON.stringify(this.config));

		// Mapping of supported brands and associated settings.
		this.supportedBrands = new Map([
			["piazzetta", ["458632", "https://piazzetta.agua-iot.com"]],
			["evastampaggi", ["635987", "https://evastampaggi.agua-iot.com"]],
			["nordicfire", ["132678", "https://nordicfire.agua-iot.com"]]
		]);
		// Mappings between HomeKit states and API returned one.
		this.stateMap = new Map([
			[0, [this.Characteristic.Active.INACTIVE, this.Characteristic.CurrentHeaterCoolerState.INACTIVE]], // OFF, OFF E
			[1, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]], // TURNING OFF, AWAITING FLAME (+ ERROR 32)
			[2, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]],
			[3, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]], // LIGHTING
			[4, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.HEATING]], // WORRKING
			[5, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]],
			[6, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]], // FINAL CLEANING
			[7, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]], // STANDBY
			[8, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]], // ALARM
			[9, [this.Characteristic.Active.ACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE]] // ALARM MEMORY
		]);

		// Authentication and API root URL infos
		this.apiRoot = this.supportedBrands.get(this.config.brand)[1];
		this.apiCustomerCode = this.supportedBrands.get(this.config.brand)[0];
		this.apiAppUUID = this.api.hap.uuid.generate(PLUGIN_NAME);
		this.apiPhoneUUID = this.api.hap.uuid.generate(this.config.login);
		this.apiIsAuth = false;
		this.apiAuthToken = null;
		this.apiAuthRefreshToken = null;
		this.apiAuthRefreshDelay = null;
		this.jobAutoLogin = null;
		this.apiHTTPHeaders = {};
		this.apiHTTPHeaders[HTTP_REQ_ACCEPT_HEADER] = HTTP_ACCEPT;
		this.apiHTTPHeaders[HTTP_REQ_CONTENT_HEADER] = HTTP_CONTENT;
		this.apiHTTPHeaders[HTTP_REQ_ORIGIN_HEADER] = HTTP_ORIGIN;
		this.apiHTTPHeaders[HTTP_REQ_ID_BRAND_HEADER] = HTTP_ID_BRAND;
		this.apiHTTPHeaders[HTTP_REQ_CUSTOMER_CODE_HEADER] = this.apiCustomerCode;
		this.apiHTTPHeaders[HTTP_REQ_UA_HEADER] = HTTP_UA;
		// Stove device
		this.apiStoveDeviceID = null;
		this.apiStoveDeviceProduct = null;
		this.apiStoveDeviceModel = null;
		this.apiStoveDeviceSerial = null;
		// Stove registers and associated data
		this.apiStoveRegisters = null; // { registername: {register_key: value, ...}, ...}
		this.apiStoveOffsetsRegistersMap = new Map(); // { offset: [registername, ...], ...}
		this.apiStoveRegistersSet = false; // Registers map initialized from API 
		this.lastStoveRegistersUpdate = null; // Last update of registers data from API, to enable cache
		// Magic object value to ensure an ongoing API read job is completed before any
		// other one is scheduled
		this.apiPendingReadJob = false;
		// Anti power swinging protection
		this.lastStovePowerChange = null;

		// Heater Cooler service
		const sname = this.config.name || ACCESSORY_PLUGIN_NAME;
		this.service = new this.Service.HeaterCooler(sname);
		// Device infos
		this.infoService = new this.Service.AccessoryInformation();
		this.infoService
			.setCharacteristic(this.Characteristic.Name, sname)
			.setCharacteristic(this.Characteristic.Manufacturer, PLUGIN_DEVICE_MANUFACTURER)
			.setCharacteristic(this.Characteristic.SoftwareRevision, PLUGIN_VERSION)
			.setCharacteristic(this.Characteristic.FirmwareRevision, PLUGIN_NAME)
			.setCharacteristic(this.Characteristic.HardwareRevision, PLUGIN_AUTHOR);

		// Register app at start, then login, then get a stove device, all necessary to proceed
		this._registerAPIApp( (err, appok) => {
			if (appok || !err) {
				this._setAPILogin(false, (err, tokok) => {
					if (tokok || !err) { 
						this._getAPIStoveDevice( (err, okmap) => {
							if (okmap || !err) {
								// Set API provided device infos
								this.infoService
									.setCharacteristic(this.Characteristic.Model, this.config.brand + "(" + this.apiStoveDeviceModel + ")")
									.setCharacteristic(this.Characteristic.SerialNumber, this.apiStoveDeviceSerial);
								// Set API provided characteristics limits
								this._getStoveRegisterBoundaries(STOVE_CURRENT_TEMP_REGISTER, (err, boundaries) => {
									if (boundaries || !err) {
										this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
											.setProps({minValue: boundaries[0], maxValue: boundaries[1], minStep: STOVE_TEMP_DELTA});
									} else {
										this.log.error("init could not get stove current temperature boundaries: " + err);
									}
								});
								this._getStoveRegisterBoundaries(STOVE_SET_TEMP_REGISTER, (err, boundaries) => {
									if (boundaries || !err) {
										this.service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature)
											.setProps({minValue: boundaries[0], maxValue: boundaries[1], minStep: STOVE_TEMP_DELTA});
									} else {
										this.log.error("init could not get stove temperature threshold boundaries: " + err);
									}
								});
								this._getStoveRegisterBoundaries(STOVE_SET_POWER_REGISTER, (err, boundaries) => {
									if (boundaries || !err) {
										this.service.getCharacteristic(this.Characteristic.RotationSpeed)
											.setProps({minValue: boundaries[0], maxValue: boundaries[1], minStep: STOVE_POWER_DELTA});
									} else {
										this.log.error("init could not get stove power boundaries: " + err);
									}
								});
								// Services methods and events handling
								// Set them in API callback so they do not trigger events while API provided infos are not yet retrieved
								this.service.getCharacteristic(this.Characteristic.Active)
									.on("get", this.getStoveActive.bind(this))
									.on("set", this.setStoveActive.bind(this));
								this.service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
									.on("get", this.getStoveState.bind(this));
								this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
									.on("get", this.getStoveCurrentTemp.bind(this));
								this.service.getCharacteristic(this.Characteristic.HeatingThresholdTemperature)
									.on("get", this.getStoveSetTemp.bind(this))
									.on("set", this.setStoveTemp.bind(this));
								this.service.getCharacteristic(this.Characteristic.RotationSpeed)
									.on("get", this.getStovePower.bind(this))
									.on("set", this.setStovePower.bind(this));
							} else {
								this.log.error("init could not retrieve required stove data from API: " + err);
							}
						}); 
					} else {
						this.log.error("init could not login once with API: " + err);
					}
				});
			} else {
				this.log.error("init could not register app with API: " + err);
			}
		});
		
		// Set characteristics properties boundaries and valid values
		// Setting CurrentHeaterCoolerState and TargetHeaterCoolerState allows to
		// lock device to heater mode only
		this.service.getCharacteristic(this.Characteristic.CurrentHeaterCoolerState)
			.setProps({
				minValue: this.Characteristic.CurrentHeaterCoolerState.INACTIVE,
				maxValue: this.Characteristic.CurrentHeaterCoolerState.HEATING,
				validValues: [this.Characteristic.CurrentHeaterCoolerState.INACTIVE, this.Characteristic.CurrentHeaterCoolerState.IDLE, this.Characteristic.CurrentHeaterCoolerState.HEATING]
			});
		this.service.getCharacteristic(this.Characteristic.TargetHeaterCoolerState)
			.setProps({
				minValue: this.Characteristic.TargetHeaterCoolerState.HEAT,
				maxValue: this.Characteristic.TargetHeaterCoolerState.HEAT,
				validValues: [this.Characteristic.TargetHeaterCoolerState.HEAT]
			});
		this.service.getCharacteristic(this.Characteristic.LockPhysicalControls)
			.setProps({
				minValue: this.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED,
				maxValue: this.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED,
				validValues: [this.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED]
			});
		this.service.getCharacteristic(this.Characteristic.SwingMode)
			.setProps({
				minValue: this.Characteristic.SwingMode.SWING_DISABLED,
				maxValue: this.Characteristic.SwingMode.SWING_DISABLED,
				validValues: [this.Characteristic.SwingMode.SWING_DISABLED]
			});
		this.service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
			.setProps({
				minValue: this.Characteristic.TemperatureDisplayUnits.CELSIUS,
				maxValue: this.Characteristic.TemperatureDisplayUnits.CELSIUS,
				validValues: [this.Characteristic.TemperatureDisplayUnits.CELSIUS]
			});
		// Forced initial arbitrary states
		this.service.setCharacteristic(this.Characteristic.Active, this.Characteristic.Active.INACTIVE);
		this.service.setCharacteristic(this.Characteristic.CurrentHeaterCoolerState, this.Characteristic.CurrentHeaterCoolerState.INACTIVE);
		this.service.setCharacteristic(this.Characteristic.TargetHeaterCoolerState, this.Characteristic.TargetHeaterCoolerState.HEAT);
		this.service.setCharacteristic(this.Characteristic.TemperatureDisplayUnits, this.Characteristic.TemperatureDisplayUnits.CELSIUS);
		this.service.setCharacteristic(this.Characteristic.LockPhysicalControls, this.Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED);
		this.service.setCharacteristic(this.Characteristic.SwingMode, this.Characteristic.SwingMode.SWING_DISABLED);
	}

	// Mandatory services export method
	getServices() {
		return [this.infoService, this.service];
	}

	// API app registering helper
	_registerAPIApp(callback) {
		const url = this.apiRoot + API_APPSIGNUP;
		let postdata = {};
		postdata[POST_API_APPSIGNUP_KEY_TYPE] = POST_API_APPSIGNUP_VALUE_TYPE;
		postdata[POST_API_APPSIGNUP_KEY_ID] = this.apiPhoneUUID;
		postdata[POST_API_APPSIGNUP_KEY_VERSION] = PLUGIN_VERSION;
		postdata[POST_API_APPSIGNUP_KEY_LANG] = POST_API_APPSIGNUP_VALUE_LANG;
		postdata[POST_API_APPSIGNUP_KEY_IDAPP] = this.apiAppUUID;
		postdata[POST_API_APPSIGNUP_KEY_PUSHTOKEN] = this.apiPhoneUUID;
		postdata[POST_API_APPSIGNUP_KEY_PUSHACTIVE] = POST_API_APPSIGNUP_VALUE_PUSHACTIVE;
		fetch(url, {method: "POST", body: JSON.stringify(postdata), timeout: HTTP_TIMEOUT, headers: this.apiHTTPHeaders, redirect: "error"})
			.then( (resp) => {
				if (resp.ok) {
					this.log.debug("_registerAPIApp got a response with OK status");
					callback(null, true);
				} else {
					throw new Error("_registerAPIApp could not register an app to API (wrong brand in config), got status: " + resp.status);
				}
			})
			.catch( (err) => {
				callback(err.message, null);
			});
	}

	// API login and auth auto-refresh helper
	_setAPILogin(refresh, callback) {
		if (!refresh) {
			this.log.debug("_setAPILogin attempting log-in");
		} else {
			this.log.debug("_setAPILogin refreshing authentication");
		}
		this.isAuth = false;
		let url = this.apiRoot;
		if (!refresh) {
			url += API_LOGIN;
		} else {
			url += API_REFRESHTOKEN;
		}
		let loginheaders = {...this.apiHTTPHeaders};
		if (!refresh) {
			loginheaders[HTTP_REQ_LOCAL_HEADER] = true;
			loginheaders[HTTP_REQ_AUTH_HEADER] = this.apiAppUUID;
		}
		let postdata = {};
		if (!refresh) {
			postdata[POST_API_LOGIN_KEY_LOGIN] = this.config.login;
			postdata[POST_API_LOGIN_KEY_PASSWORD] = this.config.password;
		} else {
			postdata[POST_API_REFRESHTOKEN_KEY_REFRESHTOKEN] = this.apiAuthRefreshToken;
		}
		fetch(url, {method: "POST", body: JSON.stringify(postdata), timeout: HTTP_TIMEOUT, headers: loginheaders, redirect: "error"})
			.then( (resp) => {
				if (resp.ok) {
					return resp.json();
				} else {
					this.authToken = null;
					throw new Error("_setAPILogin authentication rejected by API, got status: " + resp.status);
				}
			})
			.then( (jsonresp) => {
				this.log.debug("_setAPILogin got a OK response");
				let jwset = null;
				if (jsonresp && (RESP_API_LOGIN_KEY_TOKEN in jsonresp) && (refresh || (RESP_API_LOGIN_KEY_REFRESHTOKEN in jsonresp))) {
					jwset = jwt.decode(jsonresp[RESP_API_LOGIN_KEY_TOKEN]);
					this.log.debug("_setAPILogin got JWT token decoded as: " + JSON.stringify(jwset));
				}
				if (jwset) {
					this.apiAuthToken = jsonresp[RESP_API_LOGIN_KEY_TOKEN];
					this.isAuth = true;
					if (!refresh) {
						this.apiAuthRefreshToken = jsonresp[RESP_API_LOGIN_KEY_REFRESHTOKEN];
						this.apiAuthRefreshDelay = Math.abs((jwset[RESP_API_LOGIN_TOKEN_KEY_EXPIRY] * 1000) - Date.now() - HTTP_TIMEOUT);
						this.log.info("_setAPILogin successfully logged-in, setting auto-login refresh job every " + this.apiAuthRefreshDelay + " ms");
						if (this.jobAutoLogin !== null) {
							clearInterval(this.jobAutoLogin);
							this.jobAutoLogin = null;
						}
						this.jobAutoLogin = setInterval( this._setAPILogin.bind(this), this.apiAuthRefreshDelay, true, (err, ok) => {
							if (err || !ok) {
								this.log.debug("_setAPILogin failed to auto-refresh token, rebooting to a regular auth: " + err);
								clearInterval(this.jobAutoLogin);
								this._setAPILogin(false, (err, ok) => {
									if (err || !ok) {
										this.log.error("_setAPILogin shitstorm (in autologin job failover): " + err);
									}
								});
							}
						});
					} else {
						this.log.info("_setAPILogin successfully refreshed authentication");
					}
					callback(null, true);
				} else {
					throw new Error("_setAPILogin did not get the expected JWT token back from API: " + JSON.stringify(jsonresp));
				}
			})
			.catch( (err) => {
				this.isAuth = false;
				callback("_setAPILogin could not log-in with login and password in config: " + err.message, null);
			});
	}

	// Send an authenticated request to API
	_sendAPIRequest(endpoint, httpmethod, postdata, callback) {
		if (this.isAuth) {
			const url = this.apiRoot + endpoint;
			let requestheaders = {...this.apiHTTPHeaders};
			requestheaders[HTTP_REQ_LOCAL_HEADER] = false;
			requestheaders[HTTP_REQ_AUTH_HEADER] = this.apiAuthToken;
			this.log.debug("_sendAPIRequest " + httpmethod + " to: " + url + ", HEADERS = " + JSON.stringify(requestheaders) + ", DATA = " + postdata);
			fetch(url, {method: httpmethod, body: postdata, timeout: HTTP_TIMEOUT, headers: requestheaders})
				.then( (resp) => {
					if (resp.ok) {
						return resp.json();
					} else if (resp.status === 401) {
						this.isAuth = false;
						throw new Error("_sendAPIRequest got 401 status, not logged-in or token expired");
					} else {
						throw new Error("_sendAPIRequest got non-OK non-401 HTTP response status: " + resp.status);
					}
				})
				.then( (jsonresp) => {
					this.log.debug("_sendAPIRequest got a response with OK status");
					callback(null, jsonresp);
				})
				.catch( err => callback(err.message, null) );
		} else {
			callback("_sendAPIRequest could not send API request: not logged-in...", null);
		}
	}

	// Get the list of stove devices known for the config given account from API, and select first
	_getAPIStoveDevicesList(callback) {
		this._sendAPIRequest(API_DEVICESLIST, "POST", null, (err, json) => {
			if (json || !err) {
				if ((RESP_API_DEVICESLIST_KEY_DEVICES in json) && (json[RESP_API_DEVICESLIST_KEY_DEVICES].length > 0)) {
					let founddev = null;
					let errmess = null;
					for (const device of json[RESP_API_DEVICESLIST_KEY_DEVICES]) {
						if ((RESP_API_DEVICESLIST_KEY_DEVICE_ID in device) && (RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT in device) &&
							(RESP_API_DEVICESLIST_KEY_DEVICE_SERIAL in device) && (RESP_API_DEVICESLIST_KEY_DEVICE_MODEL in device) &&
							(RESP_API_DEVICESLIST_KEY_DEVICE_NAME in device)) {
							const devicename = device[RESP_API_DEVICESLIST_KEY_DEVICE_NAME];
							if (devicename === this.config.name) {
								founddev = true;
								this.apiStoveDeviceID = device[RESP_API_DEVICESLIST_KEY_DEVICE_ID];
								this.apiStoveDeviceProduct = device[RESP_API_DEVICESLIST_KEY_DEVICE_PRODUCT];
								this.apiStoveDeviceSerial = device[RESP_API_DEVICESLIST_KEY_DEVICE_SERIAL];
								this.apiStoveDeviceModel = device[RESP_API_DEVICESLIST_KEY_DEVICE_MODEL];
								this.log.debug("_getAPIStoveDevicesList found device: " + JSON.stringify(device));
							}
						} else {
							errmess = "_getAPIStoveDevicesList did not get expected result for a device from API: " + JSON.stringify(device);
							break;
						}
					}
					if (!founddev) {
						errmess = "_getAPIStoveDevicesList did not find stove name in API - PLEASE FIX THIS PLUGIN CONFIG VALUE & RESTART: " + this.config.name;
					}
					callback(errmess, founddev);
				} else {
					callback("_getAPIStoveDevicesList did not get expected result from API: " + JSON.stringify(json), null);
				}
			} else {
				callback("_getAPIStoveDevicesList failed: " + err, null);
			}
		});
	}

	// Get device info for previously retrieved device ID/product, from API
	_getAPIStoveDeviceInfo(callback) {
		let devicepostdata = {};
		devicepostdata[POST_API_DEVICEINFO_KEY_ID] = this.apiStoveDeviceID;
		devicepostdata[POST_API_DEVICEINFO_KEY_PRODUCT] = this.apiStoveDeviceProduct;
		this._sendAPIRequest(API_DEVICEINFO, "POST", JSON.stringify(devicepostdata), (err, json) => {
			if (json || !err) {
				if ((RESP_API_DEVICEINFO_KEY_INFO in json) && (json[RESP_API_DEVICEINFO_KEY_INFO].length > 0) && 
					(RESP_API_DEVICEINFO_KEY_REGISTERSMAP_ID in json[RESP_API_DEVICEINFO_KEY_INFO][0])) {
					callback(null, json[RESP_API_DEVICEINFO_KEY_INFO][0][RESP_API_DEVICEINFO_KEY_REGISTERSMAP_ID]);
				} else {
					callback("_getAPIStoveDeviceInfo did not get expected result (map ID) from API: " + JSON.stringify(json), null);
				}
			} else {
				callback("_getAPIStoveDeviceInfo failed: " + err, null);
			}
		});
	}

	// Get device registers map for previously retrieved device ID/product and given registers map ID, from API
	_getAPIStoveRegistersMap(registersmapid, callback) {
		let regmappostdata = {};
		regmappostdata[POST_API_DEVICEREGISTERSMAP_KEY_ID] = this.apiStoveDeviceID;
		regmappostdata[POST_API_DEVICEREGISTERSMAP_KEY_PRODUCT] = this.apiStoveDeviceProduct;
		regmappostdata[POST_API_DEVICEREGISTERSMAP_KEY_LAST_UPDATE] = DATE_NEVER;
		this._sendAPIRequest(API_DEVICEREGISTERSMAP, "POST", JSON.stringify(regmappostdata), (err, json) => {
			if (json || !err) {
				if ((RESP_API_DEVICEREGISTERSMAP_KEY_L1 in json) && (RESP_API_DEVICEREGISTERSMAP_KEY_L2 in json[RESP_API_DEVICEREGISTERSMAP_KEY_L1])) {
					const registersmaps = json[RESP_API_DEVICEREGISTERSMAP_KEY_L1][RESP_API_DEVICEREGISTERSMAP_KEY_L2];
					this.apiStoveRegisters = {};
					let brokein = false;
					let errmess = null;
					for (const registersmap of registersmaps) {
						if (!brokein && (RESP_API_DEVICEREGISTERSMAP_KEY_ID in registersmap) && (RESP_API_DEVICEREGISTERSMAP_KEY_REGISTERS in registersmap)) {
							if (registersmap[RESP_API_DEVICEREGISTERSMAP_KEY_ID] === registersmapid) {
								for (const register of registersmap[RESP_API_DEVICEREGISTERSMAP_KEY_REGISTERS]) {
									if (!brokein && (REGISTER_KEY_ID in register) && (REGISTER_KEY_OFFSET in register)) {
										const regid = register[REGISTER_KEY_ID];
										const regoffset = register[REGISTER_KEY_OFFSET];
										this.apiStoveRegisters[regid] = {};
										this.apiStoveRegisters[regid][REGISTER_INTERNAL_KEY_VALUE] = null;
										if (this.apiStoveOffsetsRegistersMap && this.apiStoveOffsetsRegistersMap.has(regoffset)) {
											let sameoffsetregisters = this.apiStoveOffsetsRegistersMap.get(regoffset);
											sameoffsetregisters.push(regid);
											this.apiStoveOffsetsRegistersMap.set(regoffset, sameoffsetregisters);
										} else {
											this.apiStoveOffsetsRegistersMap.set(regoffset, [regid]);
										}
										for (const reqregisterkey of RESP_API_DEVICEREGISTERSMAP_REGISTER_KEYS) {
											if ((reqregisterkey in register)) {
												this.apiStoveRegisters[regid][reqregisterkey] = register[reqregisterkey];
											} else {
												errmess = "_getAPIStoveRegistersMap got an unexpected JSON register from API: " + JSON.stringify(register);
												brokein = true;
												break;
											}
										}
										if (!brokein && (REGISTER_KEY_ENCVAL in register)) {
											for (const encval of register[REGISTER_KEY_ENCVAL]) {
												if ((REGISTER_ENCVAL_KEY_LANG in encval) && (REGISTER_ENCVAL_KEY_DESC in encval) &&
													encval[REGISTER_ENCVAL_KEY_LANG] === REGISTER_VALUE_ENCVAL_LANG) {
													if (encval[REGISTER_ENCVAL_KEY_DESC] === REGISTER_VALUE_ENCVAL_DESC_ON) {
														this.apiStoveRegisters[regid][REGISTER_INTERNAL_KEY_VALUEON] = encval[REGISTER_ENCVAL_KEY_VAL];
													} else if (encval[REGISTER_ENCVAL_KEY_DESC] === REGISTER_VALUE_ENCVAL_DESC_OFF) {
														this.apiStoveRegisters[regid][REGISTER_INTERNAL_KEY_VALUEOFF] = encval[REGISTER_ENCVAL_KEY_VAL];
													}
												}
											}
										}
									} else {
										if (!brokein) {
											errmess = "_getAPIStoveRegistersMap got an unexpected JSON register from API: " + JSON.stringify(register);
											brokein = true;
										}
										break;
									}
								}
							}
						} else {
							if (!brokein) {
								errmess = "_getAPIStoveRegistersMap got unexpected registers map JSON from API: " + Object.keys(registersmaps);
								brokein = true;
							}
							break;
						}
					}
					if (!brokein) {
						this.apiStoveRegistersSet = true;
						this.log.debug("_getAPIStoveRegistersMap finished retrieving device, associated IDs and registers");
						this.log.debug("_getAPIStoveRegistersMap apiStoveRegisters: " + Object.keys(this.apiStoveRegisters));
						for (const offnamecouple of this.apiStoveOffsetsRegistersMap.entries()) {
							this.log.debug(offnamecouple[0] + " => " + offnamecouple[1]);
						}
						callback(null, true);
					} else {
						callback(errmess, null);
					}
				} else {
					callback("_getAPIStoveRegistersMap did not get expected results from API: " + JSON.stringify(Object.keys(json)), null);
				}
			} else {
				callback("_getAPIStoveRegistersMap failed: " + err, null);
			}
		});
	}

	// Get the list of stove devices from API, select first one for further use, and get its registers map
	_getAPIStoveDevice(callback) {
		this._getAPIStoveDevicesList((err, founddev) => {
			if (founddev || !err) {
				this._getAPIStoveDeviceInfo((err, registersmapid) => {
					if (registersmapid || !err) {
						this._getAPIStoveRegistersMap(registersmapid, callback);
					} else {
						callback("_getAPIStoveDevice could not retrieve device registers map ID from API: " + err, null);
					}
				});
			} else {
				callback("_getAPIStoveDevice could not retrieve selected device (" + this.config.name + ") from API devices list: " + err, null);
			}
		});
	}

	// Get a job result from API, or fail if max attempts reached
	_getAPIJobResult(jobid, attempt, callback) {
		if (this.apiStoveRegistersSet) {
			this.log.debug("_getAPIJobResult " + jobid + " attempt " + attempt + " start");
			if (attempt < API_DEVICEJOBSTATUS_MAX_RETRIES) {
				const url = API_DEVICEJOBSTATUS + "/" + jobid;
				this._sendAPIRequest(url, "GET", null, (err, json) => {
					if (json || !err) {
						if ((RESP_API_DEVICEJOBSTATUS_KEY_STATUS in json)) {
							this.log.debug("_getAPIJobResult " + jobid + " attempt " + attempt + " result: " + json[RESP_API_DEVICEJOBSTATUS_KEY_STATUS]);
							if (json[RESP_API_DEVICEJOBSTATUS_KEY_STATUS] === RESP_API_DEVICEJOBSTATUS_VALUE_STATUS_OK) {
								if (RESP_API_DEVICEJOBSTATUS_KEY_RESULT in json) {
									callback(null, json[RESP_API_DEVICEJOBSTATUS_KEY_RESULT]);
								} else {
									callback("_getAPIJobResult got job result without data: " + JSON.stringify(json), null);
								}
							} else {
								this.log.debug("_getAPIJobResult " + jobid + " attempt " + attempt + " needs to schedule another attempt");
								setTimeout(this._getAPIJobResult.bind(this), API_DEVICEJOBSTATUS_DELAY_RETRY, jobid, attempt + 1, callback);
							}
						} else {
							callback("_getAPIJobResult did not get expected job result from API: " + JSON.stringify(json), null);
						}
					} else {
						callback("_getAPIJobResult API request failed: " + err, null);
					}
				});
			} else {
				callback("_getAPIJobResult did not complete in " + API_DEVICEJOBSTATUS_MAX_RETRIES + " requests", null);
			}
		} else {
			callback("_getAPIJobResult cannot query job result: stove registers map is not set", null);
		}
	}

	// Wait for read registers data job results, and parse it when done
	_waitForRegistersDataReadJobResult(jobid, callback) {
		this.log.debug("_waitForRegistersDataReadJobResult called for job " + jobid);
		this._getAPIJobResult(jobid, 0, (err, res) => {
			if (res || !err) {
				if( (RESP_API_DEVICEJOBSTATUS_RESULT_KEY_ITEMS in res) && (RESP_API_DEVICEJOBSTATUS_RESULT_KEY_VALUES in res)) {
					this.lastStoveRegistersUpdate = Date.now();
					let itemindex = 0;
					for (const offset of res[RESP_API_DEVICEJOBSTATUS_RESULT_KEY_ITEMS]) {
						if ((res[RESP_API_DEVICEJOBSTATUS_RESULT_KEY_VALUES].length > itemindex) && this.apiStoveOffsetsRegistersMap.has(offset)) {
							for (const  registername of this.apiStoveOffsetsRegistersMap.get(offset)) {
								this.apiStoveRegisters[registername][REGISTER_INTERNAL_KEY_VALUE] = res[RESP_API_DEVICEJOBSTATUS_RESULT_KEY_VALUES][itemindex];
								this.log.debug("_waitForRegistersDataReadJobResult setting raw value: " + registername + "=" + this.apiStoveRegisters[registername][REGISTER_INTERNAL_KEY_VALUE]);
							}
							itemindex++;
						} else {
							this.log.warn("_waitForRegistersDataReadJobResult got unknown register offset, or offset without value: " + offset);
						}
					}
					if (STOVE_ALARM_REGISTER in this.apiStoveRegisters) {
						const alarmval = this.apiStoveRegisters[STOVE_ALARM_REGISTER][REGISTER_INTERNAL_KEY_VALUE];
						if (!STOVE_ALARM_IGNORE_VALUES.includes(alarmval)) {
							this.log.warn("Stove alarm seems to be set: " + STOVE_ALARM_REGISTER + " = " + alarmval);
						}
					}
					this.log.debug("_waitForRegistersDataReadJobResult updated stove registers from API");
					callback(null, true);
				} else {
					this.log.error("_waitForRegistersDataReadJobResult did not get expected result from API: " + JSON.stringify(res));
				}
			} else {
				callback("_waitForRegistersDataReadJobResult API job failed: " + err, null);
			}
		});
	}

	// Wait for read registers to be available in cache, while a read job is pending with API
	_waitForRegistersDataCache(attempt, callback) {
		if (attempt < API_DEVICEJOBSTATUS_MAX_RETRIES) {
			if (!this.apiPendingReadJob) {
				this.log.debug("_waitForRegistersDataCache attempt " + attempt + " completed");
				callback(null, true);
			} else {
				this.log.debug("_waitForRegistersDataCache attempt " + attempt + " needs to schedule another attempt");
				setTimeout(this._waitForRegistersDataCache.bind(this), API_DEVICEJOBSTATUS_DELAY_RETRY, attempt + 1, callback);
			}
		} else {
			callback("_waitForRegistersDataCache did not complete in " + API_DEVICEJOBSTATUS_MAX_RETRIES + " attempts", null);
		}
	}

	// Get stove registers from internal cache, or get an update from API if obsolete
	_getStoveRegisters(callback) {
		this.log.debug("_getStoveRegisters called, apiStoveRegistersSet=" + this.apiStoveRegistersSet + ", apiPendingReadJob=" + this.apiPendingReadJob);
		if (this.apiStoveRegistersSet) {
			// If an API read job is already pending, or cache did not expire, wait for data to be available in cache (or immediately get cache)
			if ( this.apiPendingReadJob || ((this.lastStoveRegistersUpdate + STOVE_REGISTERS_CACHE_KEEP) >= Date.now()) ) {
				this._waitForRegistersDataCache(0, callback);
			// Otherwise, schedule an API read job, then wait for it to complete to fill the cache
			} else {
				// This var is doing the magic on knowing if a read job is already scheduled
				this.apiPendingReadJob = true;
				let regupdatepostdata = {};
				regupdatepostdata[POST_API_DEVICEREADBUFFER_KEY_ID] = this.apiStoveDeviceID;
				regupdatepostdata[POST_API_DEVICEREADBUFFER_KEY_PRODUCT] = this.apiStoveDeviceProduct;
				regupdatepostdata[POST_API_DEVICEREADBUFFER_KEY_BUFFER] = POST_API_DEVICEREADBUFFER_VALUE_BUFFER;
				this._sendAPIRequest(API_DEVICEREADBUFFER, "POST", JSON.stringify(regupdatepostdata), (err, json) => {
					if (json || !err) {
						if ((RESP_API_DEVICEREADBUFFER_KEY_JOBID in json)) {
							this._waitForRegistersDataReadJobResult(json[RESP_API_DEVICEREADBUFFER_KEY_JOBID], (err, registersok) => {
								this.apiPendingReadJob = false;
								callback(err, registersok);
							});
						} else {
							callback("_getStoveRegisters did not get expected answer from API: " + JSON.stringify(json), null);
						}
					} else {
						callback("_getStoveRegisters API request failed: " + err, null);
					}
				});
			}
		} else {
			callback("_getStoveRegisters cannot get registers: map not set yet", null);
		}
	}

	// Get a single register structure
	_getStoveRegister(registername, withvalue, callback) {
		if (this.apiStoveRegistersSet) {
			if (registername in this.apiStoveRegisters) {
				if (withvalue) {
					this._getStoveRegisters( (err, registersok) => {
						if (registersok || !err) {
							callback(null, this.apiStoveRegisters[registername]);
						} else {
							callback("_getStoveRegister failed: " + err, null);
						}
					});
				} else {
					callback(null, this.apiStoveRegisters[registername]);
				}
			} else {
				callback("_getStoveRegister register name not in registers: " + registername, null);
			}
		} else {
			callback("_getStoveRegister cannot get a register: map not set yet", null);
		}
	}

	// Calculate human value from register value, or the opposite
	_calculateStoveValue(register, tostring, reverse, inputvalue) {
		let result = null;
		let rawval = null;
		if (reverse || (inputvalue !== null)) {
			rawval = inputvalue;
		} else {
			rawval = register[REGISTER_INTERNAL_KEY_VALUE];
		}
		if (rawval !== null) {
			let formula = null;
			if (reverse) {
				formula = register[REGISTER_KEY_FORMULAREV];
			} else {
				formula = register[REGISTER_KEY_FORMULA];
			}
			if (formula === REGISTER_VALUE_FORMULA_VALPH) {
				result = rawval;
			} else {
				formula = formula.replace(REGISTER_VALUE_FORMULA_VALPH, rawval);
				// This is insanely dangerous, but it seems it is designed to be done
				// with such things like eval.
				// Using a REGEX to try to limit malicious opportunities.
				if (formula.match(REGISTER_VALUE_FORMULA_REGEX)) {
					// jshint -W061
					let calcedval = eval(formula);
					// jshint +W061
					if (!reverse && tostring && (REGISTER_KEY_FORMAT in register) && register[REGISTER_KEY_FORMAT].contains(REGISTER_VALUE_STRING_VALPH)) {
						calcedval = register[REGISTER_KEY_FORMAT].replace(REGISTER_VALUE_STRING_VALPH, calcedval);
					}
					result = calcedval;
				} else {
					this.log.error("_calculateStoveValue refusing to eval, because of dangerous register value calculation: " + formula, null);
				}
			}
		}
		return result;
	}

	// Get a register min and max boundaries as [min, max] array
	_getStoveRegisterBoundaries(registername, callback) {
		this._getStoveRegister(registername, false, (err, register) => {
			if (register || !err) {
					const calcmin = this._calculateStoveValue(register, false, false, register[REGISTER_KEY_MIN]);
					const calcmax = this._calculateStoveValue(register, false, false, register[REGISTER_KEY_MAX]);
					if ((calcmin !== null) || (calcmax !== null)) {
						this.log.debug("_getStoveRegisterBoundaries " + registername + ": " + JSON.stringify(register) + " => [" + calcmin + ", " + calcmax + "]");
						callback(null, [calcmin, calcmax]);
					} else {
						callback("_getStoveRegisterBoundaries could not calculate value from register for: " + registername, null);
					}
			} else {
				callback("_getStoveRegisterBoundaries failed: " + err, null);
			}
		});
	}

	// Get a unique register value
	_getStoveRegisterValue(registername, tostring, callback) {
		this._getStoveRegister(registername, true, (err, register) => {
			if (register || !err) {
				const calcedval = this._calculateStoveValue(register, false, false, null);
				if (calcedval !== null) {
					this.log.debug("_getStoveRegisterValue " + registername + ": " + JSON.stringify(register) + " => " + calcedval);
					callback(null, calcedval);
				} else {
					callback("_getStoveRegisterValue could not calculate value from register for: " + registername, null);
				}
			} else {
				callback("_getStoveRegisterValue failed to get stove register " + registername + ": " + err, null);
			}
		});
	}

	// Write a stove register to API
	_writeStoveRegister(registername, value, callback) {
		this._getStoveRegister(registername, false, (err, register) => {
			if (register || !err) {
				if (value >= register[REGISTER_KEY_MIN] && value <= register[REGISTER_KEY_MAX]) {
					const calcedval = this._calculateStoveValue(register, false, true, value);
					if (calcedval) {
						this.log.debug("_writeStoveRegister asked to write " + registername + "=" + value + " => " + register[REGISTER_KEY_OFFSET] + "=" + calcedval + ")");
						let regwritepostdata = {};
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_ID] = this.apiStoveDeviceID;
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_PRODUCT] = this.apiStoveDeviceProduct;
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_PROTO] = POST_API_DEVICEWRITEBUFFER_VALUE_PROTO;
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_BITDATA] = POST_API_DEVICEWRITEBUFFER_VALUE_BITDATA;
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_ENDIANESS] = POST_API_DEVICEWRITEBUFFER_VALUE_ENDIANESS;
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_ITEMS] = [register[REGISTER_KEY_OFFSET]];
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_MASKS] = [register[REGISTER_KEY_MASK]];
						regwritepostdata[POST_API_DEVICEWRITEBUFFER_KEY_VALUES] = [calcedval];
						this._sendAPIRequest(API_DEVICEWRITEBUFFER, "POST", JSON.stringify(regwritepostdata), (err, json) => {
							if (json || !err) {
								if ((RESP_API_DEVICEWRITEBUFFER_KEY_JOBID in json)) {
									this._getAPIJobResult(json[RESP_API_DEVICEWRITEBUFFER_KEY_JOBID], 0, (err, res) => {
										if (res || !err) {
											if (RESP_API_DEVICEJOBSTATUS_RESULT_WRITE_KEY_ERRCODE in res) {
												callback("_writeStoveRegister API job returned an error: " + res[RESP_API_DEVICEJOBSTATUS_RESULT_WRITE_KEY_ERRCODE], null);
											} else {
												this.log.debug("_writeStoveRegister wrote registers in API");
												callback(null, true);
											}
										} else {
											callback("_writeStoveRegister API job failed: " + err, null);
										}
									});
								} else {
									callback("_writeStoveRegister did not get expected result from API: " + JSON.stringify(json));
								}
							} else {
								callback("_writeStoveRegister failed to request registers write with API: " + err, null);
							}
						});
					} else {
						callback("_writeStoveRegister could not calculate register value for: " + registername, null);
					}
				} else {
					callback("_writeStoveRegister wanted to write an out ot bound value for " + registername + ": " + value, null);
				}
			} else {
				callback("_writeStoveRegister failed to get stove register before trying to write it: " + err, null);
			}
		});
	}

	// Get stove status (active or state)
	getStoveStatus(state, callback) {
		let active = this.Characteristic.Active.INACTIVE;
		if (state) {
			active = this.Characteristic.CurrentHeaterCoolerState.INACTIVE;
		}
		this._getStoveRegisterValue(STOVE_STATE_REGISTER, false, (err, value) => {
			if (value || !err) {
				if (this.stateMap.has(value)) {
					let index = 0;
					if (state) {
						index = 1;
					}
					active = this.stateMap.get(value)[index];
				} else {
					err = "_getStoveStatus (" + state + ") has no map key for value: " + value;
					this.log.error(err);
				}
				this.log.debug("_getStoveStatus (" + state + "): " + value + " => " + active);
			} else {
				this.log.error("_getStoveStatus (" + state + ") failed: " + err);
			}
			callback(err, active);
		});
	}

	// Get ON/OFF state
	getStoveActive(callback) {
		this.getStoveStatus(false, callback);
	}

	// Set ON/OFF
	setStoveActive(state, callback) {
		let registername = STOVE_POWER_STATE_SET_ON_REGISTER;
		let targetvaluekey = REGISTER_INTERNAL_KEY_VALUEON;
		if (state == this.Characteristic.Active.ACTIVE) {
			registername = STOVE_POWER_STATE_SET_OFF_REGISTER;
			targetvaluekey = REGISTER_INTERNAL_KEY_VALUEOFF;
		}
		const dn = Date.now();
		this._getStoveRegister(STOVE_POWER_STATE_INFO_REGISTER, false, (err, inforegister) => {
			if (inforegister || !err) {
				const targetvalue = inforegister[targetvaluekey];
				const currentvalue = this._calculateStoveValue(inforegister, false, false, null);
				if (currentvalue === null) {
					const calcerr = "setStoveActive could not calculate value from register for: " + registername;
					this.log.error(calcerr);
					callback(calcerr);
				} else if (targetvalue === currentvalue) {
					this.log.debug("setStoveActive stopped by power swing protection: stove already at target state: " + targetvalue + " == " + currentvalue);
					callback(null);
				} else if ( (dn - this.lastStovePowerChange) <= POWER_SWING_PROTECTION_DELAY ) {
					const msg = "setStoveActive stopped by power swing protection: last power change is too close in time (next power state change possible at " + new Date(this.lastStovePowerChange + POWER_SWING_PROTECTION_DELAY) + ")";
					this.log.warn(msg);
					callback(msg);
				} else {
					this._writeStoveRegister(registername, targetvalue, (err, ok) => {
						if (ok || !err) {
							this.service.updateCharacteristic(this.Characteristic.Active, state);
							this.lastStovePowerChange = dn;
							this.log.info("setStoveActive set stove to power " + state);
							callback(null);
						} else {
							this.log.error("setStoveActive failed: " + err);
							callback(err);
						}
					});
				}
			} else {
				this.log.error("setStoveActive could not get current power state: " + err);
				callback(err);
			}
		});
	}

	// Get running state (more precise than ON/OFF)
	getStoveState(callback) {
		this.getStoveStatus(true, callback);
	}

	// Get stove measured air temp
	getStoveCurrentTemp(callback) {
		this._getStoveRegisterValue(STOVE_CURRENT_TEMP_REGISTER, false, (err, value) => {
			if (value || !err) {
				this.log.debug("getStoveCurrentTemp: " + value);
			} else {
				this.log.error("getStoveCurrentTemp failed: " + err);
			}
			callback(err, value);
		});
	}

	// Get threshold temperature from which to power on heating
	getStoveSetTemp(callback) {
		this._getStoveRegisterValue(STOVE_SET_TEMP_REGISTER, false, (err, value) => {
			if (value || !err) {
				this.log.debug("getStoveSetTemp: " + value);
			} else {
				this.log.error("getStoveSetTemp failed: " + err);
			}
			callback(err, value);
		});
	}

	// Set threshold temperature from which to power on heating
	setStoveTemp(temp, callback) {
		this._writeStoveRegister(STOVE_SET_TEMP_REGISTER, temp, (err, ok) => {
			if (ok || !err) {
				this.service.updateCharacteristic(this.Characteristic.HeatingThresholdTemperature, temp);
				this.log.info("setStoveTemp set stove heating temp to " + temp);
				callback(null);
			} else {
				this.log.error("setStoveTemp failed: " + err);
				callback(err);
			}
		});
	}

	// Get stove current running power
	getStovePower(callback) {
		this._getStoveRegisterValue(STOVE_CURRENT_POWER_REGISTER, false, (err, value) => {
			if (value || !err) {
				this.log.debug("getStovePower: " + value);
			} else {
				this.log.error("getStovePower failed: " + err);
			}
			callback(err, value);
		});
	}

	// Set stove running power
	setStovePower(power, callback) {
		this._writeStoveRegister(STOVE_SET_POWER_REGISTER, power, (err, ok) => {
			if (ok || !err) {
				this.service.updateCharacteristic(this.Characteristic.RotationSpeed, power);
				this.log.info("setStovePower set stove power to " + power);
				callback(null);
			} else {
				this.log.error("setStovePower failed: " + err);
				callback(err);
			}
		});
	}
}
