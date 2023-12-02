/* eslint-disable max-len */
import EventSource from 'eventsource';
import * as util from 'util';
import { Logger } from 'homebridge';
import { SSEMessage } from './model/sse';
import { SINRICPRO_SSE_ENDPOINT_BASE_URL } from './constants';

export class SinricProSseClient {
  private eventSource!: EventSource;

  public onDeviceStateChange?: (deviceId: string, action: string, value: any) => void;

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
      this.eventSource.onmessage = (e) => {
        if (this.onDeviceStateChange === null) {
          return;
        }
        const sseMessage: SSEMessage = JSON.parse(e.data);
        if(sseMessage.event === 'deviceMessageArrived' && (sseMessage.message.payload.type === 'response' || sseMessage.message.payload.type === 'event')) {
          this.onDeviceStateChange!(sseMessage.message.payload.deviceId, sseMessage.message.payload.action, sseMessage.message.payload.value);
        }
      };

      this.eventSource.onerror = (err) => {
        this.log.error('connect error:', err);
      };
    }
  }
}