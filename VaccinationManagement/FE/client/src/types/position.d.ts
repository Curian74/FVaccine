export interface Position{
    id: string,
    positionName: string,
    status: boolean;
}

export interface PositionUpdateRequest {
    id: string;
    positionName?: string;
}

export interface ChangePositionStatus {
    id: string;
}