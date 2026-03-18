import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './App.module.css';
import clsx from 'clsx';
import Content from './component/content/Content';
import Header from './component/header/Header';
import Sidebar from './component/sidebar/Sidebar';
import { getPortalBaseUrl } from './api/apiClient';
import { findMenuByPath } from './component/sidebar/menuConfig';

function App() {
  const location = useLocation();

  useEffect(() => {
    const isDev = import.meta.env.DEV;
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

    if (isDev && bypassAuth) {
      return;
    }

    // 인증은 서버가 내려준 HttpOnly access_token 쿠키로만 처리한다.
    // React에서는 JS 토큰 보관을 사용하지 않는다.
    // 새로고침 시에도 API 호출이 정상 동작하면 로그인 상태를 유지한다.
  }, []);

  const currentMenuInfo = useMemo(() => {
    return findMenuByPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className={clsx(styles.containerScroller)}>
      <Sidebar />

      <div className={clsx(styles.mainPanel)}>
        <Header
          activeMenu={currentMenuInfo?.menuName}
          activeSubMenu={currentMenuInfo?.submenuName}
        />

        <div className={clsx(styles.contentWrapper)} key={location.pathname}>
          <Content />
        </div>
      </div>
    </div>
  );
}

export default App;
