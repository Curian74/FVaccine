import { Link } from "react-router-dom";
import NewsTypeList from "./news/NewsTypeListDropDown";
import VaccineTypeList from "./vaccine/VaccineTypeListDropDown";
import AboutUsDropdown from "../aboutUs/AboutUsDropDown";

const Navbar = () => {
    return (
        <nav className="bg-white text-black shadow-sm">
            <div className="container flex items-center h-10">
                <ul className="hidden md:flex space-x-4 justify-center flex-grow">
                   <li>
                   <Link
                        to="/home"
                        className="rounded-md text-blue-500 font-bold text-lg uppercase px-4 hover:text-black p-2.5 hover:bg-gray-200 transition"
                    >
                        HOME
                    </Link>
                   </li>
                    <li className="relative group">
                        <Link to="#" className="hover:text-black text-gray-800 rounded-md p-2.5 hover:bg-gray-200 transition">
                            ABOUT US
                        </Link>
                        <AboutUsDropdown />
                    </li>
                    <li className="relative group">
                        <Link to="#" className="hover:text-black text-gray-800 rounded-md p-2.5 hover:bg-gray-200 transition">
                            VACCINE
                        </Link>
                        <VaccineTypeList />
                    </li>

                    <li className="relative group">
                        <Link to="#" className="hover:text-black text-gray-800 rounded-md p-2.5 hover:bg-gray-200 transition">
                            NEWS
                        </Link>
                        <NewsTypeList />
                    </li>
                </ul>

                {/* <div className="flex items-center absolute right-10">
                    <button className="text-blue-500 hover:text-black transition">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                            />
                        </svg>
                    </button>
                </div> */}
            </div>
        </nav>
    );
};

export default Navbar;
