import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    principal: Principal;
    displayName: string;
    coins: bigint;
}
export interface PlayerStatusView {
    hasSeenCards: boolean;
    hasPacked: boolean;
    hasPlayedTurn: boolean;
}
export interface UserProfile {
    displayName: string;
    coins: bigint;
}
export interface TableView {
    id: bigint;
    isGameActive: boolean;
    playerStatuses: Array<PlayerStatusView>;
    currentTurn: bigint;
    players: Array<Player>;
    currentBet: bigint;
    currentPot: bigint;
    lastActionTime: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGameSettings(): Promise<{
        inactivityTimeout: bigint;
        bootAmount: bigint;
    }>;
    getQueueSize(): Promise<bigint>;
    getTable(): Promise<TableView | null>;
    getTables(): Promise<Array<TableView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinQueue(): Promise<void>;
    performAction(action: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateGameSettings(bootAmount: bigint, inactivityTimeout: bigint): Promise<void>;
}
