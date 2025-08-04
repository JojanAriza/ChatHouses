// src/components/Navbar.tsx
import { FaHome } from "react-icons/fa";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav className="h-[100px] px-6 py-4 flex justify-around items-center">
      {/* Lado izquierdo - ícono */}
      <div className="flex items-center gap-2">
        <FaHome className="text-blue-600 text-2xl" />
        <span className="font-bold text-lg text-gray-800">Proximity</span>
      </div>

      {/* Menú desplegable */}

      <div className="flex gap-4 ">
        <Menu as="div" className="relative z-[9999]">
          <MenuButton className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
            Locales
          </MenuButton>
          <MenuItems className="absolute mt-2 min-w-[150px] bg-white border rounded shadow-lg flex flex-col z-10">
            <MenuItem
              as={Link}
              to="/arrendatario"
              className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100 transition rounded"
            >
              Arrendatario
            </MenuItem>
            <MenuItem
              as={Link}
              to="/arrendador"
              className="block w-full px-4 py-2 text-left text-emerald-600 hover:bg-emerald-100 transition rounded"
            >
              Arrendador
            </MenuItem>
          </MenuItems>
        </Menu>
        <Menu as="div" className="relative z-[9999]">
          <MenuButton className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
            Hoteles
          </MenuButton>
          <MenuItems className="absolute mt-2 min-w-[150px] bg-white border rounded shadow-lg flex flex-col z-10">
            <MenuItem
              as={Link}
              to="/arrendatario"
              className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100 transition rounded"
            >
              Visitante
            </MenuItem>
            <MenuItem
              as={Link}
              to="/arrendador"
              className="block w-full px-4 py-2 text-left text-emerald-600 hover:bg-emerald-100 transition rounded"
            >
              Propietario
            </MenuItem>
          </MenuItems>
        </Menu>
        <Menu as="div" className="relative z-[9999]">
          <MenuButton className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
            Casas
          </MenuButton>
          <MenuItems className="absolute mt-2 min-w-[150px] bg-white border rounded shadow-lg flex flex-col z-10">
            <MenuItem
              as={Link}
              to="/arrendatario"
              className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100 transition rounded"
            >
              Arrendatario
            </MenuItem>
            <MenuItem
              as={Link}
              to="/arrendador"
              className="block w-full px-4 py-2 text-left text-emerald-600 hover:bg-emerald-100 transition rounded"
            >
              Arrendador
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </nav>
  );
}
