import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { menuStructure } from "./menuConfig";
import styled from "./Sidebar.module.css";
import logoImg from "../../assets/logo_C.png";
import clsx from "clsx";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeMenuName = useMemo(() => {
    return (
      Object.entries(menuStructure).find(([, { submenus }]) =>
        submenus.some(({ path }) => location.pathname === path),
      )?.[0] ?? null
    );
  }, [location.pathname]);

  const [openMenu, setOpenMenu] = useState(activeMenuName ?? "인력");

  useEffect(() => {
    if (activeMenuName) {
      setOpenMenu(activeMenuName);
    }
  }, [activeMenuName]);

  return (
    <div className={styled.sidebar}>
      <div className={styled.sidebarHeader}>
        <img
          src={logoImg}
          alt="Flowenect"
          style={{ height: "50px", width: "220px", objectFit: "contain", marginLeft:"-40px" }}
        />
      </div>

      <div className={styled.sidebarNav}>
        {Object.entries(menuStructure).map(
          ([menuName, { icon: Icon, submenus }]) => {
            const isMenuOpen = openMenu === menuName;

            return (
              <div
                key={menuName}
                className={clsx(
                  styled.navSection,
                  isMenuOpen && styled.navSectionOpen,
                )}
              >
                <div
                  className={clsx(
                    styled.navMain,
                    isMenuOpen && styled.navMainActive,
                  )}
                  onClick={() => {
                    if (isMenuOpen) {
                      setOpenMenu(null);
                      return;
                    }

                    setOpenMenu(menuName);

                    const firstSubmenuPath = submenus[0]?.path;
                    if (firstSubmenuPath) {
                      navigate(firstSubmenuPath);
                    }
                  }}
                >
                  <Icon size={20} />
                  <span>{menuName}</span>
                </div>

                <div className={styled.navSubmenu}>
                  {submenus.map((submenu) => (
                    <NavLink
                      key={submenu.path}
                      to={submenu.path}
                      className={({ isActive }) =>
                        clsx(
                          styled.navSubItem,
                          isActive && styled.navSubItemActive,
                        )
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      {submenu.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default Sidebar;
