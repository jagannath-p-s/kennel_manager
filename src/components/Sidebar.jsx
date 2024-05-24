import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaDog, FaCalendarAlt, FaList, FaUtensils, FaHistory, FaUsers, FaTachometerAlt, FaTimes } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const menus = [
    { title: "Kennel Grid", path: "/", icon: <FaDog />, tooltip: "View and manage kennel grid" },
    { title: "Make Reservation", path: "/make-reservation", icon: <FaCalendarAlt />, tooltip: "Create a new reservation" },
    { title: "Reservation List", path: "/reservation-list", icon: <FaList />, tooltip: "View and manage reservations" },
    { title: "Feeding Schedule", path: "/feeding-schedule", icon: <FaUtensils />, tooltip: "View and manage feeding schedule" },
    { title: "Feeding Log History", path: "/feeding-log-history", icon: <FaHistory />, tooltip: "View feeding log history" },
    { title: "Customers", path: "/customers", icon: <FaUsers />, tooltip: "View and manage customer information" },
    { title: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt />, tooltip: "View dashboard statistics" },
  ];

  return (
    <div className="flex">
      <div className={`${open ? "w-64" : "w-20"} bg-gradient-to-r from-gray-800 to-gray-700 h-screen p-5 pt-8 relative duration-300`}>
        <button
          className={`absolute right-4 top-7 w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md transition-transform duration-300 ${!open && "rotate-180"} hover:bg-gray-200`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
        <div className="flex gap-x-4 items-center">
          <h1 className={`text-white origin-left font-medium text-xl duration-200 ${!open && "scale-0"}`}>Kennel Boarding</h1>
        </div>
        <ul className="pt-6">
          {menus.map((menu, index) => (
            <li
              key={index}
              className={`text-gray-300 mb-2 flex items-center gap-x-4 p-2 rounded-md cursor-pointer hover:bg-gray-600 transition-colors duration-300 ${location.pathname === menu.path ? "bg-gray-600" : ""}`}
            >
              <Link to={menu.path} className="flex items-center gap-x-4">
                <span className={`transition-all duration-300 ${!open && "text-2xl"}`} data-tooltip-id={`tooltip-${index}`} data-tooltip-content={menu.tooltip}>
                  {menu.icon}
                </span>
                <span className={`${!open && "hidden"} origin-left duration-200`}>{menu.title}</span>
              </Link>
              <Tooltip id={`tooltip-${index}`} place="right" className="z-50" /> {/* Ensure z-index is set properly */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
