import { Menu } from "@/types/menu";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "accept": "text/plain",
    "Content-Type": "application/json",
    //    "Access-Control-Allow-Origin": "*",
    //    "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
    //    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  },
  withCredentials: true
});

const GetMenus = async (Status?: boolean) => {
  const requestString = "Menus?"

  const params: Record<string, string> = {};

  if (Status !== undefined) params.Status = Status.toString();

  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(requestString + queryString);
  return response.data;
};

const GetSubMenus = async (id: string, Status?: boolean) => {
  const response = await api.get("Menus/" + id + ((Status != null) ? "?Status=" + Status : ""));
  return response.data;
};

const GetMenusPaged = async (pageIndex = 1, PageSize = 10, SearchQuery?: string, ParentId?: string, Status?: boolean, Name?: string) => {
  const requestString = "Menus/paged?"

  const params: Record<string, string> = {
    pageIndex: pageIndex.toString(),
    PageSize: PageSize.toString(),
  };

  if (SearchQuery) params.SearchQuery = SearchQuery;
  if (Status !== undefined) params.Status = Status.toString();
  if (Name) params.Name = Name;
  if (ParentId) params.ParentId = ParentId;

  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(requestString + queryString);
  return response.data;
};

const CreateMenu = async (menu: Menu): Promise<Menu> => {
  const response = await api.post("/Menus", menu);
  return response.data;
}

const UpdateMenu = async (menu: Menu): Promise<Menu> => {
  const response = await api.put("/Menus", menu);
  return response.data;
}

const UpdateMenuAuths = async (id: string, roles: number[]): Promise<Menu> => {
  const response = await api.put("/Menus/auths", { id: id, authorizedRoles: roles });
  return response.data;
}

const GetLatestMenu = async () => {
  const response = await api.get("Menus/latest");
  return response.data;
};

export { GetMenus, GetSubMenus, GetMenusPaged, CreateMenu, UpdateMenu, GetLatestMenu, UpdateMenuAuths }
