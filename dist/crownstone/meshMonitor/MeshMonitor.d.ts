import { PowerMonitor } from './PowerMonitor';
import { EnergyMonitor } from './EnergyMonitor';
import { TopologyMonitor } from './TopologyMonitor';
import { SwitchMonitor } from './SwitchMonitor';
export declare class MeshMonitor {
    eventsRegistered: boolean;
    unsubscribeEventListener: () => void;
    power: PowerMonitor;
    energy: EnergyMonitor;
    switch: SwitchMonitor;
    topology: TopologyMonitor;
    constructor();
    init(): void;
    cleanup(): void;
    setupEvents(): void;
    gather(data: ServiceDataJson): void;
}
