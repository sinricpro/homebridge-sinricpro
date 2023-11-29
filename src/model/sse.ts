export interface SSEMessage {
    event:   string;
    device:  Device;
    message: Message;
}

export interface Device {
    name:                  string;
    powerState:            string;
    isOnline:              boolean;
    id:                    string;
}

export interface Message {
    name:      string;
    channel:   string;
    userId:    string;
    deviceId:  string;
    payload:   Payload; 
}

export interface Payload {
    action:     string;
    clientId:   string;
    createdAt:  number;
    deviceId:   string;
    message:    string;
    replyToken: string;
    success:    boolean;
    type:       string;
    value:      any;
}