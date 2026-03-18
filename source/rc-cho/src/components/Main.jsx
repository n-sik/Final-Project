import { useMemo } from "react";

import clsx from "clsx";
import { motion } from "framer-motion";

import sty from "./Main.module.css";

let Main = () => {
  let fadein = useMemo(
    () => (x = 0, y = 0, delay = 0) => ({
      initial: { opacity: 0, x, y, filter: "blur(10px)" },
      animate: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
      transition: {
        duration: 0.9,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
    [],
  );

  let chips = useMemo(
    () => ["조직 데이터 통합", "업무-성과 연결", "변화 이력 추적", "관계 기반 운영"],
    [],
  );

  return (
    <div className={clsx(sty.main)}>
      {/* Background */}
      <div className={clsx(sty.backdrop)} aria-hidden="true" />
      <div className={clsx(sty.noise)} aria-hidden="true" />

      <div className={clsx(sty.container)}>
        <div className={clsx(sty.grid)}>
          {/* ================== LEFT : Brand / Copy ================== */}
          <div className={clsx(sty.left)}>
            <motion.div className={clsx(sty.brand)} {...fadein(-40, 0, 0.1)}>
              <img
                className={clsx(sty.logo)}
                src="/images/logo_C.png"
                alt="FloWeNect logo"
                draggable={false}
              />
            </motion.div>

            <div className={clsx(sty.headline)}>
              <motion.div {...fadein(-60, 0, 0.18)}>
                <span className={clsx(sty.kicker)}>HR MANAGEMENT SYSTEM</span>
              </motion.div>

              <motion.h1 className={clsx(sty.title)} {...fadein(-60, 0, 0.24)}>
                사람과 조직을
                <br />
                하나의 운영 구조로
                <br />
                완성하다.
              </motion.h1>

              <motion.p className={clsx(sty.desc)} {...fadein(-60, 0, 0.32)}>
                업무·성과·변화·관계를 하나의 구조로 엮어,
                <br />
                조직이 더 빠르고 정확하게 움직이도록 설계합니다.
              </motion.p>
            </div>

            <motion.div className={clsx(sty.chips)} {...fadein(-40, 0, 0.42)}>
              {chips.map((text) => (
                <span key={text} className={clsx(sty.chip)}>
                  {text}
                </span>
              ))}
            </motion.div>

            <motion.div className={clsx(sty.scrollHint)} {...fadein(0, 20, 0.6)}>
              <div className={clsx(sty.scrollLine)} aria-hidden="true" />
              <span>아래로 내려 더 많은 내용을 확인하세요</span>
            </motion.div>
          </div>

          {/* ================== RIGHT : Visual ================== */}
          <div className={clsx(sty.right)}>
            <motion.div
              className={clsx(sty.visualFrame)}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.05,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className={clsx(sty.glass)}>
                <div className={clsx(sty.glassHeader)}>
                  <div className={clsx(sty.pill, sty.pillWork)}>업무</div>
                  <div className={clsx(sty.pill, sty.pillPerf)}>성과</div>
                  <div className={clsx(sty.pill, sty.pillChange)}>변화</div>
                  <div className={clsx(sty.pill, sty.pillRel)}>관계</div>
                </div>

                {/* Orbit Visual */}
                <div className={clsx(sty.orbitStage)} aria-hidden="true">
                  <div className={clsx(sty.core)}>조직</div>

                  {/* 동심원(업무/성과/관계) */}
                  <svg className={clsx(sty.ringsSvg)} viewBox="0 0 450 450" aria-hidden="true">
                    {/* 가이드 중심점: (225,225) */}

                    {/* 1) 업무 - inner circle */}
                    <circle className={clsx(sty.ringStroke, sty.ringWork)} cx="225" cy="225" r="80" />

                    {/* 2) 성과 - mid circle */}
                    <circle className={clsx(sty.ringStroke, sty.ringPerf)} cx="225" cy="225" r="125" />

                    {/* 4) 관계 - outer circle */}
                    <circle className={clsx(sty.ringStroke, sty.ringRel)} cx="225" cy="225" r="170" />

                    {/* 3) 변화 - ellipse only */}
                    <g className={clsx(sty.ringChangeGroup)}>
                      <ellipse className={clsx(sty.ringStroke, sty.ringChange)} cx="225" cy="225" rx="170" ry="112" />
                    </g>
                  </svg>

                  {/* 노드: 1/2/4는 원형 궤도(회전) */}
                  <div className={clsx(sty.orbiter, sty.orbiter1)}>
                    <div className={clsx(sty.nodeDot, sty.nodeWork)} />
                  </div>
                  <div className={clsx(sty.orbiter, sty.orbiter2)}>
                    <div className={clsx(sty.nodeDot, sty.nodePerf)} />
                  </div>
                  <div className={clsx(sty.orbiter, sty.orbiter4)}>
                    <div className={clsx(sty.nodeDot, sty.nodeRel)} />
                  </div>

                  {/* ✅ 변화 노드: SVG animateMotion (단독) */}
                  <svg className={clsx(sty.ellipseSvg)} viewBox="0 0 340 224" aria-hidden="true">
                    <path
                      id="changeOrbitPath"
                      d="M 170 0
                        a 170 112 0 1 0 0 224
                        a 170 112 0 1 0 0 -224"
                      fill="none"
                    />

                    <g>
                      <animateMotion dur="24s" repeatCount="indefinite" rotate="0">
                        <mpath href="#changeOrbitPath" />
                      </animateMotion>

                      <circle className={clsx(sty.svgNodeOuter)} r="8" cx="0" cy="0" />
                      <circle className={clsx(sty.svgNodeInner, sty.svgNodeInnerChange)} r="4.5" cx="0" cy="0" />
                    </g>
                  </svg>

                  {/* spark는 절제해서 2개만 */}
                  <div className={clsx(sty.spark, sty.spark1)} />
                  <div className={clsx(sty.spark, sty.spark2)} />
                </div>

                <div className={clsx(sty.caption)}>
                  <div className={clsx(sty.captionTitle)}>
                    분산된 인사 데이터를 조직 중심의 구조로 연결해
                    <br />
                    체계 안에서 일관되게 움직이게 합니다.
                  </div>
                </div>
              </div>

              <div className={clsx(sty.frameGlow)} aria-hidden="true" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
