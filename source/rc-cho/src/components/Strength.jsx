import { useEffect, useRef } from "react";
// import "./Strength.css";

import styled from "./Strength.module.css";
import {
  BarChart3,
  Calendar,
  ClipboardCheck,
  Goal,
  Sparkles,
  UserRoundSearch,
  Users,
} from "lucide-react";

const Strength = () => {
  const featureRefs = useRef([]);

  const features = [
    {
      icon: <UserRoundSearch size={32} strokeWidth={1.5} />,
      title: (
        <>
          CBTI <br /> (Company Behavior Type Indicator)
        </>
      ),
      Smalltitle: "회사 행동 유형 지표",
      description:
        "조직 행동 유형 진단을 통해 구성원과 부서의 협업 성향을 파악합니다.",
      details: [
        "개인별 업무 강점 및 협업 스타일 정밀 분석",
        "부서 내 팀워크 시너지 및 갈등 요인 사전 파악",
        "맞춤형 소통 방식을 통한 조직 내 협업 효율 극대화",
      ],
    },
    {
      icon: <BarChart3 size={32} strokeWidth={1.5} />,
      title: "평가 & 분석 시스템",
      description:
        "AI 기반 업무 분석은 참고 지표로 제공되며 최종 판단은 관리자의 책임 아래 이루어집니다.",
      details: [
        "객관적 업무 성과 데이터 기반의 AI 리포트 생성",
        "관리자의 최종 의사결정을 돕는 보조 지표 활용",
        "평가 공정성 확보를 위한 다각도 데이터 분석",
      ],
    },
    {
      icon: <ClipboardCheck size={32} strokeWidth={1.5} />,
      title: "전자결재 & 인사 프로세스",
      description:
        "연차, 휴직, 승진, 발령, 퇴직, 인력 충원까지 전자 양식과 결재 라인을 기반으로 인사 프로세스를 표준화합니다.",
      details: [
        "연차·휴직부터 승진·퇴직까지의 전 과정 디지털화",
        "조직 체계에 맞춘 유연한 자동 결재 라인 구축",
        "복잡한 인사 행정 절차의 표준화 및 누락 방지",
      ],
    },
    {
      icon: <Goal size={32} strokeWidth={1.5} />,
      title: "KPI 기반 업무 구조",
      description:
        "업무 구조를 트리 기반과 담당자 배정 기반 운영으로 설계하여 성과 관리가 자연스럽게 연결됩니다.",
      details: [
        "상위 목표와 하위 업무를 연결하는 트리형 구조 설계",
        "업무별 담당자 배정을 통한 책임 소재 명확화",
        "업무 진척도가 성과 관리로 연결",
      ],
    },
    {
      icon: <Calendar size={32} strokeWidth={1.5} />,
      title: "근태 / 일정 통합",
      description:
        "출퇴근 기록, 연차, 교육, 채용 일정을 통합 캘린더 구조로 제공합니다.",
      details: [
        "출퇴근 기록과 연차 현황의 실시간 대시보드 제공",
        "채용, 교육 등 인사 특화 일정 통합 관리",
        "전사/부서 일정을 한눈에 파악하는 캘린더 뷰",
      ],
    },
    {
      icon: <Users size={32} strokeWidth={1.5} />,
      title: "인사 / 조직",
      description:
        "사원 정보, 직위 체계, 부서 구조, 프로젝트 배정까지 조직 구조를 데이터 기반으로 운영합니다.",
      details: [
        "임직원 정보 및 직위 체계의 체계적인 DB 관리",
        "변화하는 조직 구조에 맞춘 유연한 부서 설계",
        "프로젝트별 인력 배정 및 히스토리 추적 기능",
      ],
    },
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styled["visible"]);
        }
      });
    }, observerOptions);

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    // <section id="strength" className="strength">
    <section id="strength" className={styled["strength"]}>
      <div className={styled["strengths-main"]}>
        <div className={styled["strengths-container"]}>
          <div className={styled["section-header"]}>
            <h2 className={styled["section-title"]}>
              <Sparkles className={styled["title-icon"]} size={32} />
              주요 기능 포인트
            </h2>
            <p className={styled["section-description"]}>
              데이터 기반의 체계적인 인사 관리 시스템으로 조직의 성장을
              지원합니다.
            </p>
          </div>

          <div className={styled["features-section"]}>
            {features.map((feature, index) => (
              <div
                className={styled["feature-card"]}
                key={index}
                ref={(el) => (featureRefs.current[index] = el)}
              >
                <div className={styled["card-content"]}>
                  <div className={styled["card-header"]}>
                    <div className={styled["feature-icon"]}>{feature.icon}</div>

                    <div className={styled["title-group"]}>
                      <h4 className={styled["card-title"]}>{feature.title}</h4>
                      <p className={styled["card-small-title"]}>
                        {feature.Smalltitle}
                      </p>
                    </div>
                  </div>
                  <p className={styled["card-description"]}>
                    {feature.description}
                  </p>
                  <ul className={styled["card-details"]}>
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Strength;
