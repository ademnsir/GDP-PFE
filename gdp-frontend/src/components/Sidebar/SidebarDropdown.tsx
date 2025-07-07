import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarDropdown = ({ item }: any) => {
  const pathname = usePathname();

  return (
    <ul className="mb-3 mt-2 flex flex-col gap-2.5 pl-6 border-l-2 border-gray-500">
      {item.map((subItem: any, index: number) => (
        <li key={index}>
          <Link
            href={subItem.route}
            className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-sm duration-300 ease-in-out transition-all ${
              pathname === subItem.route ? "bg-[#2560a0] text-white shadow-lg" : "text-[#141c2c] hover:bg-[#da1032]/10 hover:text-[#2560a0] hover:shadow-md"
            }`}
          >
            {subItem.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarDropdown;
