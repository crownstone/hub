/// <reference types="node" />
import { CrownstoneCloud } from 'crownstone-cloud';
import { Hub } from '../../models/hub-specific/hub.model';
import { SseEventHandler } from './SseEventHandler';
import Timeout = NodeJS.Timeout;
import { SseClassInterface } from 'crownstone-sse/dist/CrownstoneSSE';
export declare class CloudManager {
    cloud: CrownstoneCloud;
    sse: SseClassInterface | null;
    sseEventHandler: SseEventHandler;
    initializeInProgress: boolean;
    retryInitialization: boolean;
    initialized: boolean;
    loginInProgress: boolean;
    syncInProgress: boolean;
    sseSetupInprogress: boolean;
    ipUpdateInprogress: boolean;
    sphereId: string;
    eventsRegistered: boolean;
    resetTriggered: boolean;
    storedIpAddress: string | null;
    intervalsRegistered: boolean;
    interval_sync: Timeout | null;
    interval_ip: Timeout | null;
    constructor();
    setupEvents(): void;
    cleanup(): Promise<void>;
    initialize(): Promise<void>;
    recover(delayMs?: number): Promise<void>;
    login(hub: Hub): Promise<void>;
    sync(): Promise<void>;
    setupSSE(hub: Hub): Promise<void>;
    updateLocalIp(): Promise<void>;
}
