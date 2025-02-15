export interface Menu {
  name?: string;
  path?: string;
  icon?: string;
  parentID: string | null;
  status?: boolean;
  id: string;

  authorizedRoles?: number[];
}
