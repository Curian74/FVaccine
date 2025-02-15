export interface NewsType{
    id: string
    news_Type_Name: string;
    status: boolean;
}

export interface NewsTypeUpdateRequest {
    id: string;
    news_Type_Name?: string;
}

export interface ChangeNewsTypeStatus {
    id: string;
}