
import {  HostInfo } from './context';

import { AddonMessage, InitMessage,  InitRequestMessage, MessageType, ReadyMessage } from './messages';

export * from './context';
export * from './messages';

export enum LogLevel {
    Trace = 1,
    Debug = 2,
    Errors = 9
}

export class AddonsSdk {

    public logging: LogLevel = LogLevel.Errors;

    public onInit: (context: InitMessage) => void;

    public onMessage: (message: AddonMessage) => void;

    public errorHandler: (message: string, ...optionalParams: any[]) => void;

    private host: HostInfo;

    /**
     * Creates an instance of AddonsSdk.
     * @memberof AddonsSdk
     */
    constructor() {
        
        this.onInit = this.preprocessInitMessage;

        this.onMessage = (_message: AddonMessage) => {
            if (this.logging <= LogLevel.Trace) {
                // tslint:disable-next-line: no-console
                console.log('[SDK][onMessage]-NOP', _message);
            }
        };

        this.errorHandler = (_message: string, ..._optionalParams: any[]) => {
            // tslint:disable-next-line: no-console
            console.error(['[SDK][ErrorHandler]-NOP', _message, _optionalParams]);
        };

        if (this.logging <= LogLevel.Debug) {
            // tslint:disable-next-line: no-console
            console.log('[SDK][Index]::ctor - observing messages: *', postMessage);
        }
        window.addEventListener('message', this.handleReceivedMessage);
    }
    
    /**
     * Informs the interested parties that sdk is initialized and 
     * ready to receive messages from host and other participants.
     *
     * @memberof AddonsSdk
     */
    public ready() {
        const postMessage = JSON.stringify(new ReadyMessage());
        if (this.logging <= LogLevel.Debug) {
            // tslint:disable-next-line: no-console
            console.log('[SDK][Index]::ready - origin: *', postMessage);
        }
        window.parent.postMessage(postMessage, '*');
    }

    /**
     * Informs the host that addon needs to be reinitialized with 
     * fresh init context in order to operate properly
     * (e.g. addon token expired and addon needs from host new token)
     * @memberof AddonsSdk
     */
    public initRequest = () => {
        this.sendMessage(new InitRequestMessage());
    }

    /**
     * Send a message through the host to other participants 
     * using addon at the same time
     * 
     * @param {string} type 
     * @param {*} [payload] 
     * @memberof Sync
     */
    public sendMessage<T extends AddonMessage>(message: T) {

        if (!this.host) {
            this.errorHandler('You can not send messages before SDK is initialized');
            return;
        }

        const postMessage = JSON.stringify(message);

        if (this.logging <= LogLevel.Debug) {
            // tslint:disable-next-line: no-console
            console.warn('[SDK][Index]::sendMessage', postMessage, this.host.origin);
        }

        window.parent.postMessage(postMessage, this.host.origin);
    }

    private handleReceivedMessage = (messageEvent: MessageEvent) => {
        
        if (this.logging <= LogLevel.Trace) {
            // tslint:disable-next-line: no-console
            console.log('[SDK][Index]::handleReceivedMessage', messageEvent);
        }
        
        if (!messageEvent || messageEvent.source === window || !messageEvent.data || !messageEvent.origin) {
            if (this.logging <= LogLevel.Trace) {
                // tslint:disable-next-line: no-console
                console.warn('[SDK][Index]::handleReceivedMessage-invalid source, data ot origin', messageEvent);
            }
            return;
        }

        if (this.host && this.host.origin && messageEvent.origin !== this.host.origin) {
            if (this.logging <= LogLevel.Trace) {
                // tslint:disable-next-line: no-console
                console.warn('[SDK][Index]::handleReceivedMessage-invalid message origin', messageEvent);
            }
            return;
        }

        if (typeof messageEvent.data !== 'string') {
            if (this.logging <= LogLevel.Trace) {
                // tslint:disable-next-line: no-console
                console.warn('[SDK][Index]::handleReceivedMessage - invalid event data', messageEvent.data);
            }
            return;

        }

        const hostMessage: AddonMessage = JSON.parse(messageEvent.data);
        if (!hostMessage || !hostMessage.type) {
            if (this.logging <= LogLevel.Trace) {
                // tslint:disable-next-line: no-console
                console.warn('[SDK][Index]::handleReceivedMessage-invalid message data', messageEvent);
            }
            return;
        }
        
        switch (hostMessage.type) {
            case MessageType.INIT:
                const context = hostMessage as InitMessage;
                this.preprocessInitMessage(context);
                this.onInit(context);
                return;
            case MessageType.INIT_REQUESTED:
            case MessageType.DATA:
            case MessageType.READY:
            case MessageType.TOOLTIPS:
            case MessageType.PARTICIPANTS:
            case MessageType.MEET_STATE:
            case MessageType.HOST_CHANGED:
            case MessageType.REPOSITION:
            case MessageType.USER_PROFILE:
            case MessageType.STATE_ACTIVE:
            case MessageType.STATE_INACTIVE:
                if (this.logging <= LogLevel.Trace) {
                    // tslint:disable-next-line: no-console
                    console.log('[SDK][Index]::handleReceivedMessage-switch', hostMessage.type, hostMessage);
                }               
                break;
            default:
                if (this.logging <= LogLevel.Debug) {
                    this.errorHandler('[AddonsSdk]:onReceived - Unknown host message of type:' + hostMessage.type); 
                }
                return;
        }

        if (this.logging <= LogLevel.Trace) {
            // tslint:disable-next-line: no-console
            console.log('[SDK][Index]::handleReceivedMessage-onMessage->', hostMessage);
        }    

        this.onMessage(hostMessage);
    }

    private preprocessInitMessage(context: InitMessage) {
        this.host = context.host;

        if (this.logging <= LogLevel.Trace) {
            // tslint:disable-next-line: no-console
            console.log('[SDK][Index]::preprocessInitMessage-> host', this.host);
        }
    }
}

// exposing sdk as  a global variable
const w = window as any;
w.vivani = w.vivani || {};
w.vivani.sdk = w.vivani.sdk || new AddonsSdk();

export default w.vivani.sdk;
