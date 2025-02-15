import { Paginated } from "./paginated";

export interface Response {
  status: string;
  message: string;
}

export interface ResponseWith<T> extends Response {
  data: T;
}

export interface ResponseWithPagniate<T> extends Response {
  data: Paginated<T>;
}
