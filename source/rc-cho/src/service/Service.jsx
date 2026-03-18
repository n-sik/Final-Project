import React from "react";

import clsx from "clsx";
import sty from "./Service.module.css";

import { ServiceCard } from "./ServiceCard.jsx";
import cardsJson from "./ServiceCardJson.jsx";

import { motion } from "framer-motion";

const Service = () => {
    // ✅ Company와 동일한 fadein 패턴
    const fadein = (x = 0, y = 0, delay = 0) => ({
        initial: {
            opacity: 0,
            x,
            y,
            filter: "blur(6px)",
        },
        whileInView: {
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
        },
        viewport: {
            once: false,
        },
        transition: {
            duration: 0.7,
            delay,
            ease: [0.16, 1, 0.3, 1],
        },
    });

    return (
        <section id="service" className={clsx(sty.service)}>
            <div className={clsx(sty.serviceContainer)}>
                {/* 상단 텍스트 */}
                <motion.div
                    className={clsx(sty.textArea)}
                    {...fadein(0, 40, 0.5)}
                >
                    <div className={clsx(sty.textAreaCenter)}>
                        <div>
                            <span className="text-5xl font-black">FloWeNect의 서비스는</span>
                        </div>
                    </div>
                </motion.div>

                {/* 카드 영역 */}
                <div className={clsx(sty.cardArea)}>
                    {/* 궤도 데코레이션 */}
                    <div className={clsx(sty.orbitArea)} aria-hidden="true">
                        <div className={clsx(sty.orbitCore)} />
                        <div className={clsx(sty.orbitRing)} />
                        <div className={clsx(sty.orbitRing)} />
                        <div className={clsx(sty.orbitRing)} />
                        <div className={clsx(sty.shooting)} />
                    </div>

                    {cardsJson.map((el, idx) => (
                        <motion.div
                            key={el.id}
                            className={clsx(
                                sty.cardSlot,
                                sty[`slot${idx + 1}`],
                            )}
                            {...fadein(0, 60, 0.5)}
                        >
                            <ServiceCard {...el} />
                        </motion.div>
                    ))}
                </div>

                {/* 하단 텍스트 */}
                <motion.div
                    className={clsx(sty.textArea)}
                    {...fadein(0, 40, 0.5)}
                >
                    <div className={clsx(sty.textAreaCenter)}>
                        <div>
                            <span className="text-5xl font-black">제공 됩니다.</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Service;
