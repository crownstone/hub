/**
 * This class will keep an in-memory cache of the known switch-states.
 * If a switchstate that is different from the cache is received,
 * we update the state in the cloud.
 */
export declare class SwitchMonitor {
    lastSwitchStates: {
        [stoneUID: string]: number;
    };
    collect(crownstoneUid: number, switchState: number, timestamp: number, upload?: boolean): void;
}
