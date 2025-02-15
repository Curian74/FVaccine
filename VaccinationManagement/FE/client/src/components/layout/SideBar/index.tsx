import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
  Avatar,
} from "@material-tailwind/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import * as LucideIcons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetMenus, GetSubMenus } from "@/services/MenuService";
import { User } from "@/types/user";
import UserService from "@/services/UserService";
import UserAvatar from "@/assets/images/user_online.png"
const baseUrl = import.meta.env.VITE_BASE_URL;

interface Menu {
  name?: string;
  path?: string;
  icon?: string;
  parentID: string | null;
  status?: boolean;
  id: string;
  hasSubMenus: boolean;
  authorizedRoles?: number[];
}
const Sidebar = (params: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [menuPanels, setMenuPanels] = useState<Menu[]>([]);
  const subMenuPanels = useRef<Map<string, Menu[]>>(new Map());
  const [loadingSubmenuIds, setLoadingSubmenuIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const apiResponse = await GetMenus(true);
        const updatedMenuPanels = await Promise.all(
          apiResponse.map(async (menu: Menu) => {
            const subMenus = await GetSubMenus(menu.id, true);
            return { ...menu, hasSubMenus: subMenus && subMenus.length > 0 };
          })
        );
        setMenuPanels(updatedMenuPanels);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      }
    };

    fetchMenus();

    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem("email")!;
        const profile = await UserService.GetProfile(email);
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleParentMenuClick = (id: string) => {
    const menu = menuPanels.find((panel) => panel.id === id);

    if (menu && menu.path) navigate(menu.path)

    if (!subMenuPanels.current.has(id)) {
      setLoadingSubmenuIds((prev) => [...prev, id]);
      GetSubMenus(id, true).then((subApiResponse) => {
        subMenuPanels.current.set(id, subApiResponse || []);
        setLoadingSubmenuIds((prev) => prev.filter((loadingId) => loadingId !== id));
      });
    }

    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((activeId) => activeId !== id) : [...prev, id]
    );
  };

  const handleSubmenuClick = (path: string | undefined) => {
    if (path) navigate(path);
  };

  return (
    <div className="flex h-screen bg-blue-gray-50">
      <Card
        onPointerEnterCapture={() => null}
        onPointerLeaveCapture={() => null}
        placeholder=""
        className="w-full h-full py-4 shadow-xl bg-gray-100">
        <div className="flex items-center ml-4 gap-x-3 w-full">
          <Avatar
            variant="circular"
            size="sm"
            alt="avatar"
            className=" bg-white"
            src={user?.image ? baseUrl + user.image : UserAvatar}
            placeholder=""
            onPointerEnterCapture={() => { }}
            onPointerLeaveCapture={() => { }}
          />
          <div>
            <Typography
              onPointerEnterCapture={() => null}
              onPointerLeaveCapture={() => null}
              placeholder=""
              className="text-xl font-bold">Welcome, {user?.username}</Typography>
            <Typography
              onPointerEnterCapture={() => null}
              onPointerLeaveCapture={() => null}
              placeholder=""
              className="text-gray-500">{user?.email}</Typography>
          </div>
        </div>
        <List
          onPointerEnterCapture={() => null}
          onPointerLeaveCapture={() => null}
          placeholder=""
          className="overflow-auto">
          {loading ? (
            <Typography
              onPointerEnterCapture={() => null}
              onPointerLeaveCapture={() => null}
              placeholder=""
            >Loading...</Typography>
          ) : (
            menuPanels
              .filter((menu) => menu.authorizedRoles?.includes(user?.roleId ?? 1))
              .map((panel) => (
                <Accordion
                  onPointerEnterCapture={() => null}
                  onPointerLeaveCapture={() => null}
                  placeholder=""
                  key={panel.id}
                  open={activeIds.includes(panel.id)}
                  icon={
                    panel.hasSubMenus && (
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${activeIds.includes(panel.id) ? "rotate-180" : ""
                          }`}
                      />
                    )
                  }
                >
                  <AccordionHeader
                    onPointerEnterCapture={() => null}
                    onPointerLeaveCapture={() => null}
                    placeholder=""
                    onClick={() => handleParentMenuClick(panel.id)}
                    className={`border-b-0 p-3`}
                  >
                    <ListItemPrefix
                      onPointerEnterCapture={() => null}
                      onPointerLeaveCapture={() => null}
                      placeholder=""
                    >
                      {panel.icon && React.createElement(LucideIcons[panel.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>, { className: "h-5 w-5" })}
                    </ListItemPrefix>
                    <Typography
                      onPointerEnterCapture={() => null}
                      onPointerLeaveCapture={() => null}
                      placeholder=""
                      className="mr-auto">{panel.name}</Typography>
                  </AccordionHeader>

                  {panel.hasSubMenus && (
                    <AccordionBody className="py-1">
                      {loadingSubmenuIds.includes(panel.id) ? (
                        <Typography
                          onPointerEnterCapture={() => null}
                          onPointerLeaveCapture={() => null}
                          placeholder="">Loading Submenus...</Typography>
                      ) : (
                          subMenuPanels.current
                            .get(panel.id)
                            ?.filter(subPanel => subPanel.authorizedRoles?.includes(user?.roleId ?? 1))
                            .map(subPanel => (
                            <ListItem
                              onPointerEnterCapture={() => null}
                              onPointerLeaveCapture={() => null}
                              placeholder=""
                              key={subPanel.id}
                              onClick={() => handleSubmenuClick(subPanel.path)}
                              className={`cursor-pointer mt-1`}
                            >
                              {subPanel.authorizedRoles?.includes(user?.roleId ?? 1) && (
                                <ListItemPrefix onPointerEnterCapture={() => null}
                                  onPointerLeaveCapture={() => null}
                                  placeholder=""
                                  className="flex items-center">
                                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5 mr-2" />
                                  <p className="m-0 p-0 text-md">{subPanel.name}</p>
                                </ListItemPrefix>
                              ) 
                              // : (
                              //   <Typography
                              //     onPointerEnterCapture={() => null}
                              //     onPointerLeaveCapture={() => null}
                              //     placeholder=""
                              //     color="gray" variant="h3">
                              //     {subPanel.name}
                              //   </Typography>
                              // )
                              }
                            </ListItem>
                          ))
                      )}
                    </AccordionBody>
                  )}

                </Accordion>
              ))
          )}
          <ListItem
            onPointerEnterCapture={() => null}
            onPointerLeaveCapture={() => null}
            placeholder=""
            onClick={() => navigate("/sign-out")}>
            <ListItemPrefix
              onPointerEnterCapture={() => null}
              onPointerLeaveCapture={() => null}
              placeholder=""
            >
              <PowerIcon className="h-5 w-5" />
            </ListItemPrefix>
            Log Out
          </ListItem>
        </List>

      </Card>
      <div className="flex-1">{params.children}</div>
    </div>
  );
};

export default Sidebar;
