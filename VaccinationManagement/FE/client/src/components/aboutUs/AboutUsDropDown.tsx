import { useNavigate } from "react-router-dom";

type AboutUsItem = {
    label: string,
    path: string,
}

const List: AboutUsItem[] = [
    { label: "Our Vision", path: "vision" },
    { label: "Our Mission", path: "mission" },
    { label: "Our Guarantee", path: "guarantee" },
]
const AboutUsDropdown = () => {
    const nav = useNavigate();

    const handleToggleClick = (path: string) => {
        nav(path)
    };
    return (
        <ul
        className="absolute left-0 mt-2 bg-white text-gray-700 shadow-lg opacity-0 hidden
        group-hover:opacity-100 group-hover:block transition-all rounded-md w-80">
        {List.map(item => (
            <li
                key={item.label}
                className="px-4 rounded-md w-[90%] mx-auto py-2 cursor-pointer hover:bg-gray-200 hover:text-black"
                onClick={() => {
                    handleToggleClick(item.path)
                }}
            >
                <p>{item.label}</p>
            </li>
        ))}
    </ul>
    )
}

export default AboutUsDropdown;