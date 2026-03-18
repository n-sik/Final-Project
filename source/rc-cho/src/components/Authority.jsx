import { useEffect, useRef } from "react";
import './Authority.css';

// 역할별 아이콘들을 import 합니다.
import { 
  LuLayoutDashboard, 
  LuLayers, 
  LuServer, 
  LuDatabase, 
  LuUserCheck 
} from "react-icons/lu";

const members = [
  {
    name: "조승희",
    role: "PL / BA",
    desc: "프로젝트 전반 기획, \n비즈니스 요구사항 정의",
    icon: <LuLayoutDashboard />
  },
  {
    name: "김형수",
    role: "AA",
    desc: "애플리케이션 아키텍처 \n설계 및 기술 방향성 수립",
    icon: <LuLayers />
  },
  {
    name: "정선회",
    role: "TA",
    desc: "시스템 기술 검토,\n 인프라·연계 구조 설계",
    icon: <LuServer />
  },
  {
    name: "임지원",
    role: "DA",
    desc: "데이터 모델링,\n 데이터 품질·정합성 관리",
    icon: <LuDatabase />
  },
  {
    name: "남현식",
    role: "UA",
    desc: "UI/UX 설계,\n 사용자 경험 최적화",
    icon: <LuUserCheck />
  }
];

const Authority = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current.classList.add("show");
        } else {
          sectionRef.current.classList.remove("show");
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="authority" className="authority" ref={sectionRef}>
      <div className="section-header">
        <span className="section-label">ORGANIZATION</span>
        <h2 className="section-title">팀 소개</h2>
        <p className="section-description">
          명확한 역할 분담과 전문 영역 중심의 협업 구조로 프로젝트 완성도를 높입니다.
        </p>
      </div>

      <div className="org-level level-1">
        {members.map((m, i) => (
          <div className="org-box ceo fade-item" style={{ transitionDelay: `${i * 0.15}s` }} key={m.name}>
            {/* m.icon을 사용하여 각 멤버별 아이콘을 출력합니다 */}
            <div className="position-icon">{m.icon}</div>
            <div className="position-title">{m.name}</div>
            <div className="position-name">{m.role}</div>
            <p className="position-desc">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Authority;