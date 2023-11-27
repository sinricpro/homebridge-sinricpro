import { Logger } from 'homebridge';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import https from 'https';

// axios.interceptors.request.use(request => {
//     console.log('> %j', request)
//     return request
// })

// axios.interceptors.response.use(response => {
//     console.log('%j <', response)
//     return response
// })

type Room = {
    id: number;
    name: string;
};

export interface SinricProDeviceType {
    code: string;
}

export interface SinricProDevice {
    id: number;
    name: string;
    powerState: string | undefined; // On or Off
    deviceType: SinricProDeviceType;
    room: Room;
}

export class SinricProApiClient {
    private axiosClient!: AxiosInstance;
    private apiKey: string;
    private baseEndpointUri: string = "https://portal.sinric.pro/api/v1";
    private authEndpointUri: string = `${this.baseEndpointUri}/auth`;

    private accessToken: string = "";
    private refreshToken: string = "";
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

    public async getDevices() {
        this.log.debug('[getDevices()]: Get SinricPro devices...');

        const devices: SinricProDevice[] = [];

        const authenticated = await this.authenticate();

        if (authenticated) {
            const initData = await Promise.all([
                this.axiosClient.get('/devices'),
                this.axiosClient.get('/rooms')
            ]);

            this.rooms = initData[1].data.rooms;

            this.log.debug(`${initData[0].data.devices.length} device(s) found!`);

            for (const device of initData[0].data.devices) {
                const d: SinricProDevice = {
                    id: device.id,
                    name: device.name,
                    deviceType: device.product,
                    powerState: device.powerState || null,
                    room: device.room,
                };

                devices.push(d);
            }
        }

        return devices;
    }

    public async authenticate(): Promise<boolean> {
        this.log.debug('[authenticate()]: Login to SinricPro...');

        if (this.expiresAt != null && (new Date().getTime() - this.expiresAt.getTime() < this.TWO_MINUTES_MILLIS)) {
            this.log.debug('[authenticate()]: Has a valid auth token. do nothing...');
            return true;
        }

        this.log.info('[authenticate()]: Getting a new auth token...');

        try {
            const response = await axios.post(this.authEndpointUri, {}, {
                httpsAgent: this.httpsAgent,
                headers: {
                    'Content-Type': 'application/json',
                    'x-sinric-api-key': this.apiKey
                }
            }
            )

            if (response.data.success) {
                this.accessToken = response.data.accessToken;
                this.refreshToken = response.data.refreshToken;
                this.expiresAt = new Date(new Date().getTime() + (1000 * response.data.expiresIn))
                this.log.info('[authenticate()]: New auth token expires at: ' + this.expiresAt);

                const config: AxiosRequestConfig = {
                    timeout: 10000,
                    httpsAgent: this.httpsAgent,
                    baseURL: this.baseEndpointUri,
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
}