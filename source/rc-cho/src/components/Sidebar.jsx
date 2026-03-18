import { useState, useEffect, useRef } from "react";
import "./Sidebar.css";

const Sidebar = ({ activeSection, scrollToSection }) => {
  const menuItems = [
    { id: "main", label: "메인" },
    { id: "company", label: "회사소개" },
    { id: "service", label: "서비스소개" },
    { id: "strength", label: "강점" },
    { id: "authority", label: "팀소개" },
    { id: "footer", label: "체험하기" },
  ];

const [position, setPosition] = useState(() => {
    const sidebarHeight = 700; 
    return {
      x: 40,
      y: (window.innerHeight / 2) - (sidebarHeight / 2)
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    if (e.target.closest(".sidebar-header")) {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;

      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;

      // 사이드바 예상 높이값 (접혔을 때와 펼쳤을 때 구분)
      const sidebarHeight = isExpanded ? 500 : 120;
      const maxY = window.innerHeight - sidebarHeight;
      const maxX = window.innerWidth - 200; // 사이드바 너비 약 200px

      setPosition({
        // 좌우 화면 이탈 방지 추가
        x: Math.max(0, Math.min(newX, maxX)),
        // [핵심] 0보다 작아지면 0으로 고정하여 화면 상단 이탈 방지
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, isExpanded]);

  return (
    <div
      className={`sidebar ${isDragging ? "dragging" : ""} ${
        isExpanded ? "expanded" : "collapsed"
      }`}
      onMouseDown={onMouseDown}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        // [중요] transform: "none" 이어야 top: 0이 화면 최상단에 정확히 걸립니다.
        transform: "none",
        transition: isDragging ? "none" : "height 0.3s ease, top 0.3s ease",
      }}
    >
      <div className="sidebar-header">
        <div className="logo">{/* h1 삭제된 상태 유지 */}</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
            onClick={(e) => {
              if (!isDragging) scrollToSection(item.id);
            }}
          >
            <span className="nav-label">{item.label}</span>
            <span className="nav-indicator"></span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? "▲ 접기" : "▼ 열기"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;