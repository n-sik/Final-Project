import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import styled from "./Header.module.css";
import clsx from "clsx";
import { useMe } from "./Useme";
import { getPortalBaseUrl } from "../../api/apiClient";

const Header = ({ activeMenu, activeSubMenu }) => {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName = me?.empNm ?? "로딩중";
  const userRole = me?.deptNm ?? me?.posNm ?? "-";

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={clsx(styled.topbar)}>
      <div className={clsx(styled.breadcrumb)}>
        {activeMenu && (
          <>
            <span>{activeMenu}</span>
            <ChevronRight size={14} />
          </>
        )}
        <span>{activeSubMenu}</span>
      </div>

      <div className={clsx(styled.topbarActions)}>
        <div className={clsx(styled.userWrapper)} ref={dropdownRef}>
          <div
            className={clsx(styled.userInfo)}
            onClick={() => setOpen((v) => !v)}
          >
            <div className={clsx(styled.userAvatar)}>
              {userName ? userName[0] : "?"}
            </div>
            <div className={clsx(styled.userDetails)}>
              <div className={clsx(styled.userName)}>{userName}</div>
              <div className={clsx(styled.userRole)}>{userRole}</div>
            </div>
          </div>

          {open && (
            <div className={clsx(styled.dropdown)}>
              <a
                href={getPortalBaseUrl()}
                className={clsx(styled.dropdownItem)}
                onClick={() => setOpen(false)}
              >
                <ExternalLink size={13} />
                업무 페이지
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;