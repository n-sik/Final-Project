import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Company from "./company/Company";
import Service from "./service/Service";
import Strength from "./components/Strength";
import Authority from "./components/Authority";
import Footer from "./footer/Footer";
import Main from "./components/Main";

function App() {
  const [activeSection, setActiveSection] = useState("main");

  useEffect(() => {
    const handleScroll = () => {
      // 1. 'footer'를 섹션 배열에 추가
      const sections = [
        "main",
        "company",
        "service",
        "strength",
        "authority",
        "footer",
      ];
      const scrollPosition = window.scrollY + 200;

      // 2. 페이지 바닥 감지 (푸터가 짧을 경우를 대비)
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (isBottom) {
        setActiveSection("footer");
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="app">
      <main className="main-content">
        <Sidebar
          activeSection={activeSection}
          scrollToSection={scrollToSection}
        />
        {/* 3. 각 컴포넌트를 id를 가진 section으로 감싸기 */}
        <section id="main">
          <Main />
        </section>
        <section id="company">
          <Company />
        </section>
        <section id="service">
          <Service />
        </section>
        <section id="strength">
          <Strength />
        </section>
        <section id="authority">
          <Authority />
        </section>
        <section id="footer">
          <Footer />
        </section>
      </main>
    </div>
  );
}

export default App;
