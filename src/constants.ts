// TODO: Change to homebridge-sinricpro later
export const SINRICPRO_HOMEBRIDGE_CLIENT_ID = 'portal'; /* API client id */

export const SINRICPRO_API_ENDPOINT_BASE_URL = 'https://portal.sinric.pro/api/v1';

export const SINRICPRO_SSE_ENDPOINT_BASE_URL = 'https://portal.sinric.pro/sse/stream?accessToken=%s';

export abstract class ModelConstants {
  static readonly MANUFACTURER = 'SinricPro';
  static readonly SWITCH_MODEL = 'SinricProSwitch';
  static readonly LIGHT_MODEL = 'SinricProLight';
  static readonly DOORBELL_MODEL = 'SinricProDoorbell';
  static readonly DIMMABLE_SWIRCH_MODEL = 'SinricProDimmableSwitch';
  static readonly TEMPERATURE_SENSOR_MODEL = 'SinricProTemperatureSensor';
  static readonly MOTION_SENSOR_MODEL = 'SinricProMotionSensor';
  static readonly CONTACT_SENSOR_MODEL = 'SinricProContactSensor';
  static readonly FAN_MODEL = 'SinricProFan';
  static readonly THERMOSTAT_MODEL = 'SinricProThermostat';
  static readonly TV_MODEL = 'SinricProTV';
  static readonly GARAGE_DOOR_MODEL = 'SinricProGarageDoor';
  static readonly LOCK_MODEL = 'SinricProLock';
}

export abstract class ActionConstants {
  static readonly SET_POWER_STATE = 'setPowerState';
  static readonly SET_BRIGHTNESS = 'setBrightness';
  static readonly ADJUST_BRIGHTNESS = 'adjustBrightness';
  static readonly SET_POWER_LEVEL = 'setPowerLevel';
  static readonly ADJUST_POWER_LEVEL = 'adjustPowerLevel';
  static readonly CURRENT_TEMPERATURE = 'currentTemperature';
  static readonly TARGET_TEMPERATURE = 'targetTemperature';
  static readonly MOTION = 'motion';
  static readonly SET_CONTACT_STATE = 'setContactState';
  static readonly SET_RANGE_VALUE = 'setRangeValue';
  static readonly SET_LOCK_STATE = 'setLockState';
  static readonly SET_THERMOSTAT_MODE = 'setThermostatMode';
  static readonly SET_MODE = 'setMode';
}

export abstract class DeviceTypeConstants {
  static readonly SWITCH = 'sinric.devices.types.SWITCH';
  static readonly LIGHT = 'sinric.devices.types.LIGHT';
  static readonly DIMMABLE_SWITCH = 'sinric.devices.types.DIMMABLE_SWITCH';
  static readonly DOORBELL = 'sinric.devices.types.DOORBELL';
  static readonly TEMPERATURE_SENSOR = 'sinric.devices.types.TEMPERATURESENSOR';
  static readonly AC_UNIT = 'sinric.devices.types.AC_UNIT';
  static readonly FAN = 'sinric.devices.types.FAN';
  static readonly MOTION_SENSOR = 'sinric.devices.types.MOTION_SENSOR';
  static readonly CONTACT_SENSOR = 'sinric.devices.types.CONTACT_SENSOR';
  static readonly THERMOSTAT = 'sinric.devices.types.THERMOSTAT';
  static readonly TV = 'sinric.devices.types.TV';
  static readonly SPEAKER = 'sinric.devices.types.SPEAKER';
  static readonly SMARTLOCK = 'sinric.devices.types.SMARTLOCK';
  static readonly GARAGE_DOOR = 'sinric.devices.types.GARAGE_DOOR';
  static readonly BLIND = 'sinric.devices.types.BLIND';
  static readonly CAMERA = 'sinric.devices.types.CAMERA';
  static readonly AIR_QUALITY_SENSOR = 'sinric.devices.types.AIR_QUALITY_SENSOR';
  static readonly ENERGY_SENSOR = 'sinric.devices.types.ENERGY_SENSOR';
  static readonly CUSTOM = 'sinric.devices.types.CUSTOM';
}