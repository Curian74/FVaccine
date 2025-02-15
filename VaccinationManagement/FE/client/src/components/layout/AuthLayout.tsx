import { cn } from "@/helpers/utils";
import { Link, Outlet } from "react-router-dom";
import FadeInUp from "../animation/FadeInUp";
import Thumbnail from "@/assets/images/hero.png";
import { Icons } from "../Icons";

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen flex">

      <div className="absolute top-4 left-4">
        <Link
          to="/home"
          className="mx-2 xl:mx-4 cursor-pointer py-1.5 font-medium flex items-center select-none"
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
      <div className="flex min-h-screen w-full justify-around">
        <div
          className={cn(
            "w-full lg:w-1/2 flex flex-col justify-center items-center"
          )}
        >

          <div className="w-full max-w-md m-4">
            <FadeInUp>
              <Outlet />
            </FadeInUp>
          </div>
        </div>
        <div
          className={cn(
            "hidden w-1/2 lg:flex items-center justify-center bg-gradient-to-r from-red-400 via-orange-300 to-yellow-300"
          )}
        >
          <img className="w-96 mx-auto my-auto" src={Thumbnail} />
        </div>
      </div>
    </div>

  );
};


export default AuthLayout;
