import React, { useEffect, useState } from "react";
import {
  Navbar,
  Collapse,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
  Typography
} from "@material-tailwind/react";

import {
  PowerIcon,
  UserCircleIcon,
  CalendarCheck,
  ChevronUp
} from "lucide-react";
import { cn } from "@/helpers/utils";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../Icons";
import Nav from "./NavBar";
import { Icon } from "semantic-ui-react";
import { User } from "@/types/user";
import UserService from "@/services/UserService";
import UserAvatar from "@/assets/images/user_online.png"
const baseUrl = import.meta.env.VITE_BASE_URL;
interface ProfileMenuProps {
  user: User;
}
export function ProfileMenu({user}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();


  const items = [
    {
      label: "My Profile",
      icon: UserCircleIcon,
      path: `/home/profile`
    },
    {
      label: "Injection Schedule",
      icon: CalendarCheck,
      path: `/home/schedule`
    },
    {
      label: "Sign Out",
      icon: PowerIcon,
      path: "/sign-out"
    }
  ];
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Menu open={isOpen} handler={setIsOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center rounded-full p-0"
          placeholder=""
          onPointerEnterCapture={() => { }}
          onPointerLeaveCapture={() => { }}
        >
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
        </Button>
      </MenuHandler>
      <MenuList className="p-1"
        placeholder=""
        onPointerEnterCapture={() => { }}
        onPointerLeaveCapture={() => { }}>
        {items.map(({ label, icon, path }, key) => {
          const isLastItem = key === items.length - 1;
          return (
            <MenuItem
              placeholder=""
              onPointerEnterCapture={() => { }}
              onPointerLeaveCapture={() => { }}
              key={label}
              onClick={() => {
                handleNavigate(path);
              }}
              className={`flex items-center gap-2 rounded ${isLastItem &&
                "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                }`}
            >
              {React.createElement(icon, {
                className: `h-6 w-6 ${isLastItem ? "text-red-500" : ""}`,
                strokeWidth: 2
              })}
              <Typography

                as={"span"}
                className={cn(
                  "font-normal text-base",
                  isLastItem ? "text-red-500" : "inherit"
                )}
                placeholder=""
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}



const Header = React.memo(() => {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const toggleIsNavOpen = () => setIsNavOpen(cur => !cur);
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem('email');
      console.log(email);

      if (email) {
        const user = await UserService.GetProfile(email);
        setUser(user);
        console.log(user);
      }
    }
    fetchUser();
  }, [])

  React.useEffect(() => {
    const checkResponsive = () =>
      window.innerWidth >= 960 && setIsNavOpen(false);
    window.addEventListener("resize", checkResponsive);
    return () => {
      window.removeEventListener("resize", checkResponsive);
    };
  }, []);

  return (
    <>
      <Navbar className="max-w-screen-3xl rounded-none py-0 px-1 shadow-sm z-50"
        placeholder=""
        onPointerEnterCapture={() => { }}
        onPointerLeaveCapture={() => { }}>
        <div className="relative mx-auto flex items-center justify-between text-blue-gray-800">
          <div className="flex items-center w-1/4 lg:w-1/3">
            <Link
              to="/home"
              className="mx-2 xl:mx-4 cursor-pointer pb-1.5 font-medium flex items-center select-none"
            >
              <Icons.logo className="h-12 w-12" />
              <span
                className={cn(
                  "hidden text-5xl capitalize font-extrabold md:block bg-gradient-to-b from-orange-300 to-orange-700 text-transparent bg-clip-text"
                )}
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                FVC
              </span>

            </Link>
          </div>
          <div className="w-2/3 xl:w-2/5 max-w-screen-md md:block transition-all duration-300 ease-in-out flex">
            <div className="w-1/2 ml-auto">
              <Link
                to="/home/book-appointment"
                className="flex w-fit text-orange-500 justify-end cursor-pointer text-sm"
              >
                <Icon size="large" name="calendar alternate" />
                <p className="font-bold">REGISTER FOR VACCINATION</p>
              </Link>
            </div>
          </div>


          <div className="flex items-center justify-end w-1/4 lg:w-1/3 mr-3">
            {user ? (<div>
              <IconButton
                size="sm"
                color="blue-gray"
                variant="text"
                ripple={true}
                onClick={toggleIsNavOpen}
                className="mr-2 lg:hidden"
                placeholder=""
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
              >
                <ChevronUp
                  className={`mx-auto w-5 h-5 transition-transform ${isNavOpen ? "rotate-180" : ""}`}
                />
              </IconButton>
              <ProfileMenu user={user}/>
            </div>
            )
              : (
                <div>
                  <Link
                    to="/auth"
                    className="flex w-fit text-orange-500 justify-end cursor-pointer text-sm"
                  >
                    <Icon size="large" name="sign-in" />
                    <p className="font-bold">SIGN IN</p>
                  </Link>
                </div>
              )
            }
          </div>
        </div>
        <Collapse open={isNavOpen} className="overflow-hidden">
          <div></div>
        </Collapse>
      </Navbar>
      <Nav />
    </>

  );
});

export default Header;
