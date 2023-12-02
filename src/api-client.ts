import { Logger } from 'homebridge';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';
import * as util from 'util';

import { SinricProDevice } from './model/sinricpro-device';
import { SINRICPRO_API_ENDPOINT_BASE_URL, SINRICPRO_HOMEBRIDGE_CLIENT_ID } from './constants';
import { Guid } from './utils/guid';

// axios.interceptors.request.use(request => {
//     console.log('> %j', request)
//     return request
// })

// axios.interceptors.response.use(response => {
//     console.log('%j <', response)
//     return response
// })

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

  private rooms: Room[] = [];

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
        this.axiosClient.get('/rooms'),
      ]);

      this.rooms = initData[1].data.rooms;

      this.log.debug(`${initData[0].data.devices.length} device(s) found!`);

      for (const device of initData[0].data.devices) {
        const sinricproDevice: SinricProDevice = {
          id: device.id,
          name: device.name,
          deviceType: device.product,
          powerState: device.powerState || null,
          room: device.room,
        };

        devices.push(sinricproDevice);
      }
    }

    return devices;
  }

  public async authenticate(): Promise<boolean> {
    this.log.debug('[authenticate()]: Login to SinricPro...');

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
    return JSON.stringify({
      'clientId': SINRICPRO_HOMEBRIDGE_CLIENT_ID,
      'messageId': Guid.newGuid(),
      'type': 'request',
      'action': action,
      'createdAt': this.getSecondsSinceEpich(),
      'value': JSON.stringify(value),
    });
  }

  private async execAction(deviceId: string, data?: string): Promise<boolean> {
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
    const data = this.getCommand('setPowerState', { 'state': powerState });
    return this.execAction(deviceId, data);
  }

  public async setBrightness(deviceId: string, brightness: number): Promise<boolean> {
    const data = this.getCommand('setBrightness', { 'brightness': brightness });
    return this.execAction(deviceId, data);
  }

  public async setRangeValue(deviceId: string, rangeValue: number): Promise<boolean> {
    const data = this.getCommand('setRangeValue', { 'rangeValue': rangeValue });
    return this.execAction(deviceId, data);
  }

  public async setTargetTemperature(deviceId: string, toTemperature: number): Promise<boolean> {
    const data = this.getCommand('targetTemperature', { 'temperature': toTemperature });
    return this.execAction(deviceId, data);
  }

  public async setMode(deviceId: string, mode: string): Promise<boolean> {
    const data = this.getCommand('setMode', { 'mode': mode });
    return this.execAction(deviceId, data);
  }

  public async setLockState(deviceId: string, state: string): Promise<boolean> {
    const data = this.getCommand('setLockState', { 'state': state });
    return this.execAction(deviceId, data);
  }

  public async setDoorbellPress(deviceId: string): Promise<boolean> {
    const data = this.getCommand('DoorbellPress', { 'state': 'pressed' });
    return this.execAction(deviceId, data);
  }



}