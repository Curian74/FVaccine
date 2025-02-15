export interface Place {
  name: string,
  status: boolean,
  id: string,
  address?: string
}

export interface PlaceQuery {
  name?: string,
  status?: boolean,
  id: string
}

