import { Logger } from 'homebridge';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import * as util from 'util';

import { SinricProDevice } from './model/sinricpro-device';
import { ActionConstants, SINRICPRO_API_ENDPOINT_BASE_URL, SINRICPRO_HOMEBRIDGE_CLIENT_ID } from './constants';
import { Guid } from './utils/guid';

export class SinricProApiClient {
  private axiosClient!: AxiosInstance;
  private apiKey: string = '';
  private authEndpointUri: string = `${SINRICPRO_API_ENDPOINT_BASE_URL}/auth`;

  private accessToken: string = '';
  private expiresAt: Date | undefined;
  private TWO_MINUTES_MILLIS = 2 * 60 * 1000;

  private httpsAgent = new https.Agent({
    rejectUnauthorized: true,
  });

  constructor(
    apiKey: string,
    public readonly log: Logger) {
    this.apiKey = apiKey;
  }

  get authToken(): string {
    return this.accessToken;
  }

  public async getDevices() {
    this.log.debug('[getDevices()]: Get SinricPro devices...');

    const devices: SinricProDevice[] = [];

    if (await this.authenticate()) {
      const initData = await Promise.all([
        this.axiosClient.get('/devices'),
      ]);

      this.log.debug(`${initData[0].data.devices.length} device(s) found!`);

      for (const device of initData[0].data.devices) {
        //console.log('device:', device);

        const sinricproDevice: SinricProDevice = {
          id: device.id,
          name: device.name,
          deviceType: { code: device.product.code },
          powerState: device.powerState || null,
          room: device.room,
          rangeValue: device.rangeValue,
          garageDoorState: device.garageDoorState,
          brightness: device.brightness,
          powerLevel: device.powerLevel,
          temperature: device.temperature,
          thermostatMode: device.thermostatMode,
          contactState: device.contactState,
          humidity: device.humidity,
          lastMotionState: device.lastMotionState,
        };

        devices.push(sinricproDevice);
      }
    }

    return devices;
  }

  public async authenticate(): Promise<boolean> {
    this.log.debug('[authenticate()]: Login to SinricPro...');

    // eslint-disable-next-line eqeqeq
    if (this.expiresAt != null && (new Date().getTime() - this.expiresAt.getTime() < this.TWO_MINUTES_MILLIS)) {
      // Has a valid auth token. do nothing...
      return true;
    }

    this.log.info('[authenticate()]: Getting a new auth token...');

    try {
      const response = await axios.post(this.authEndpointUri, {}, {
        httpsAgent: this.httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'x-sinric-api-key': this.apiKey,
        },
      });

      if (response.data.success) {
        this.accessToken = response.data.accessToken;
        this.expiresAt = new Date(new Date().getTime() + (1000 * response.data.expiresIn));
        this.log.info('[authenticate()]: New auth token expires at: ' + this.expiresAt);

        const config: AxiosRequestConfig = {
          timeout: 10000,
          httpsAgent: this.httpsAgent,
          baseURL: SINRICPRO_API_ENDPOINT_BASE_URL,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        };

        this.axiosClient = axios.create(
          config,
        );

        this.log.info('[authenticate()]: Success!');
        return true;
      } else {
        this.log.info('[authenticate()]: error: ' + response.data.message);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.log.error('[authenticate()]: Login error: ', error.message);
      } else {
        this.log.error('[authenticate()]: Login unexpected error: ', error);
      }

      return false;
    }
  }

  private getSecondsSinceEpich() {
    return Math.floor(Date.now() / 1000);
  }

  private getCommand(action, value) {
    return {
      'clientId': SINRICPRO_HOMEBRIDGE_CLIENT_ID,
      'messageId': Guid.newGuid(),
      'type': 'request',
      'action': action,
      'createdAt': this.getSecondsSinceEpich(),
      'value': JSON.stringify(value),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async execAction(deviceId: string, data: any): Promise<boolean> {
    const deviceActionUrl = util.format('/devices/%s/action', deviceId);

    if (await this.authenticate()) {
      try {
        const response = await this.axiosClient.post(
          deviceActionUrl,
          data,
        );

        if (response.status === 200) {
          this.log.debug('[execAction()]: request has been queued for processing!');
          return true;
        } else {
          this.log.error('[execAction()]: server returned an error. status: ', response.status);
          return false;
        }
      } catch (error) {
        this.log.error('[execAction()]: error state: ', error);
      }
    } else {
      this.log.error('[execAction()]: authentication failed!');
    }

    return false;
  }

  public async setPowerState(deviceId: string, powerState: string): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_POWER_STATE, { 'state': powerState });
    return this.execAction(deviceId, data);
  }

  public async setBrightness(deviceId: string, brightness: number): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_BRIGHTNESS, { 'brightness': brightness });
    return this.execAction(deviceId, data);
  }

  public async setRangeValue(deviceId: string, rangeValue: number): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_RANGE_VALUE, { 'rangeValue': rangeValue });
    return this.execAction(deviceId, data);
  }

  public async setTargetTemperature(deviceId: string, toTemperature: number): Promise<boolean> {
    const data = this.getCommand(ActionConstants.TARGET_TEMPERATURE, { 'temperature': toTemperature });
    return this.execAction(deviceId, data);
  }

  public async setMode(deviceId: string, mode: string): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_MODE, { 'mode': mode });
    return this.execAction(deviceId, data);
  }

  public async setLockState(deviceId: string, state: string): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_LOCK_STATE, { 'state': state });
    return this.execAction(deviceId, data);
  }

  public async setDoorbellPress(deviceId: string): Promise<boolean> {
    const data = this.getCommand(ActionConstants.DOORBELL_PRESS, { 'state': 'pressed' });
    return this.execAction(deviceId, data);
  }

  public async setPowerLevel(deviceId: string, powerLevel: number): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_POWER_LEVEL, { 'powerLevel': powerLevel });
    return this.execAction(deviceId, data);
  }

  public async setThermostatMode(deviceId: string, thermostatMode: string): Promise<boolean> {
    const data = this.getCommand(ActionConstants.SET_THERMOSTAT_MODE, { 'thermostatMode': thermostatMode });
    return this.execAction(deviceId, data);
  }


}