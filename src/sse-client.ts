import EventSource from 'eventsource';
import * as util from "util";
import { Logger } from 'homebridge';
import { SSEMessage } from './model/sse';
import { SINRICPRO_SSE_ENDPOINT_BASE_URL } from './constants';

export class SinricProSseClient {    
    private eventSource!: EventSource;
    
    public onDeviceStateChange?: (deviceId: string, value: any) => void

    constructor(
        public readonly log: Logger,
        public readonly authToken: string) {
    }

    public listen() {
        if (this.eventSource) {
            return;
        } else {
            const url: string = util.format(SINRICPRO_SSE_ENDPOINT_BASE_URL, this.authToken);
            this.eventSource = new EventSource(url);
            let that = this;
            this.eventSource.onmessage = function(e) {
                if (!that.onDeviceStateChange) return
                const sseMessage: SSEMessage = JSON.parse(e.data);
                if(sseMessage.event === 'deviceMessageArrived' && (sseMessage.message.payload.type == 'response' || sseMessage.message.payload.type == 'event')) {                    
                    that.onDeviceStateChange(sseMessage.message.payload.deviceId, sseMessage.message.payload.value)
                }
            };

            this.eventSource.onerror = function (err) {
                that.log.error("connect error:", err);
            }; 
        }        
    }
}