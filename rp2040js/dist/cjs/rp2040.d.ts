import { IClock } from './clock/clock';
import { GPIOPin } from './gpio-pin';
import { RPADC } from './peripherals/adc';
import { RPDMA } from './peripherals/dma';
import { RPI2C } from './peripherals/i2c';
import { Peripheral } from './peripherals/peripheral';
import { RPPIO } from './peripherals/pio';
import { RPPPB } from './peripherals/ppb';
import { RPSPI } from './peripherals/spi';
import { RPUART } from './peripherals/uart';
import { RPUSBController } from './peripherals/usb';
import { RPSIO } from './sio';
import { Logger } from './utils/logging';
export declare const FLASH_START_ADDRESS = 268435456;
export declare const FLASH_END_ADDRESS = 335544320;
export declare const RAM_START_ADDRESS = 536870912;
export declare const DPRAM_START_ADDRESS = 1343225856;
export declare const SIO_START_ADDRESS = 3489660928;
export declare const SYSM_MSP = 8;
export declare const SYSM_PSP = 9;
export declare const SYSM_PRIMASK = 16;
export declare const SYSM_CONTROL = 20;
declare enum ExecutionMode {
    Mode_Thread = 0,
    Mode_Handler = 1
}
export declare type CPUWriteCallback = (value: number, address: number) => void;
export declare type CPUReadCallback = (address: number) => number;
declare enum StackPointerBank {
    SPmain = 0,
    SPprocess = 1
}
export declare class RP2040 {
    readonly clock: IClock;
    readonly bootrom: Uint32Array;
    readonly sram: Uint8Array;
    readonly sramView: DataView;
    readonly flash: Uint8Array;
    readonly flash16: Uint16Array;
    readonly flashView: DataView;
    readonly usbDPRAM: Uint8Array;
    readonly usbDPRAMView: DataView;
    readonly registers: Uint32Array;
    bankedSP: number;
    cycles: number;
    clkSys: number;
    clkPeri: number;
    readonly ppb: RPPPB;
    readonly sio: RPSIO;
    readonly uart: RPUART[];
    readonly i2c: RPI2C[];
    readonly spi: RPSPI[];
    readonly adc: RPADC;
    readonly gpio: GPIOPin[];
    readonly qspi: GPIOPin[];
    readonly dma: RPDMA;
    readonly pio: RPPIO[];
    readonly usbCtrl: RPUSBController;
    private stopped;
    eventRegistered: boolean;
    waiting: boolean;
    logger: Logger;
    N: boolean;
    C: boolean;
    Z: boolean;
    V: boolean;
    breakRewind: number;
    PM: boolean;
    SPSEL: StackPointerBank;
    nPRIV: boolean;
    currentMode: ExecutionMode;
    IPSR: number;
    interruptNMIMask: number;
    pendingInterrupts: number;
    enabledInterrupts: number;
    interruptPriorities: number[];
    pendingSVCall: boolean;
    pendingSystick: boolean;
    interruptsUpdated: boolean;
    VTOR: number;
    SHPR2: number;
    SHPR3: number;
    private executeTimer;
    readonly peripherals: {
        [index: number]: Peripheral;
    };
    onBreak: (code: number) => void;
    constructor(clock?: IClock);
    loadBootrom(bootromData: Uint32Array): void;
    reset(): void;
    get SP(): number;
    set SP(value: number);
    get LR(): number;
    set LR(value: number);
    get PC(): number;
    set PC(value: number);
    get APSR(): number;
    set APSR(value: number);
    get xPSR(): number;
    set xPSR(value: number);
    checkCondition(cond: number): boolean;
    readUint32(address: number): number;
    findPeripheral(address: number): Peripheral;
    /** We assume the address is 16-bit aligned */
    readUint16(address: number): number;
    readUint8(address: number): number;
    writeUint32(address: number, value: number): void;
    writeUint8(address: number, value: number): void;
    writeUint16(address: number, value: number): void;
    switchStack(stack: StackPointerBank): void;
    get SPprocess(): number;
    set SPprocess(value: number);
    get SPmain(): number;
    set SPmain(value: number);
    exceptionEntry(exceptionNumber: number): void;
    exceptionReturn(excReturn: number): void;
    get svCallPriority(): number;
    get systickPriority(): number;
    get gpioValues(): number;
    exceptionPriority(n: number): number;
    setInterrupt(irq: number, value: boolean): void;
    checkForInterrupts(): boolean;
    updateIOInterrupt(): void;
    readSpecialRegister(sysm: number): number;
    writeSpecialRegister(sysm: number, value: number): 0 | undefined;
    BXWritePC(address: number): void;
    private substractUpdateFlags;
    private addUpdateFlags;
    executeInstruction(): void;
    slowIO(addr: number): boolean;
    execute(): void;
    stop(): void;
    get executing(): boolean;
}
export {};
