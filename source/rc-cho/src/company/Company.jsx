import React from "react";

import clsx from "clsx";
import sty from "./Company.module.css";
import CompanyAnime from "./CompanyAnime";

import { motion } from "framer-motion";

const Company = () => {

    const fadein = (xPosition, yPosition, delay) => ({
        initial: { opacity: 0, x: xPosition, y:yPosition, filter: "blur(6px)"},
        whileInView: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
        viewport: { 
            once: false
        },
        transition: { 
            duration: 0.7,
            delay: delay,
            ease: [0.16, 1, 0.3, 1]
        }
    })

    const mainTitle = ['사람과', '조직의', '흐름을', '설계하다.']
    const mainTileAdd1 = ['인사프로그램은', '기록과 행정 중심으로', '구현되어 있습니다.']
    const mainTileAdd2 = ['조직은', '업무, 성과, 변화, 관계가 서로 연결된', '동적인 흐름의 구조로', '이루어져 있습니다.']

    return (
        <section id="company" className={clsx(sty.company)}>
            <div className={clsx(sty.companyContainer)}>
                <div className={clsx(sty.textArea)}>
                    <div className={clsx(sty.textAreaLeft, sty.companyTitle)}>
                        <div className={clsx(sty.textBox, sty.projectName)}>
                            <span>FloWeNect</span>
                        </div>
                        <motion.div
                            className={clsx(sty.textBox, sty.companyName)}
                            {...fadein(-120, 0, 0.5)}
                        >
                            <span>주식회사 초</span>
                        </motion.div>
                    </div>

                    <div className={clsx(sty.textAreaRight, sty.companyTitleText)}>

                        {
                            mainTitle.map((text, i) => {
                                return(
                                    <motion.div
                                        key={i}
                                        className={clsx(sty.textBox)}
                                        {...fadein(100, 0, 0.5)}
                                    >
                                        <span>{text}</span>
                                    </motion.div>
                                )
                            })
                        }

                    </div>
                </div>

                <div className={clsx(sty.textArea)}>
                    <div className={clsx(sty.textAreaLeft, sty.companyText1)}>
                        <motion.div
                            className={clsx(sty.textBox)}
                            {...fadein(0, -100, 0.5)}
                        >
                            <span className="text-5xl font-black">보통</span>
                        </motion.div>
                       
                        {

                            mainTileAdd1.map((text, i) =>{
                                return(
                                    <motion.div
                                        key={i}
                                        className={clsx(sty.textBox)}
                                        {...fadein(-100, 0, 0.5)}
                                    >
                                        <span>{ text }</span>
                                    </motion.div>
                                )
                            })

                        }

                    </div>

                    <div className={clsx(sty.textAreaRight, sty.companyText1, sty.companyTextRight)}>

                        <motion.div
                            className={clsx(sty.textBox)}
                            {...fadein(0, -100, 0.5)}
                        >
                            <span className="text-5xl font-black">그러나</span>
                        </motion.div>
                        {

                            mainTileAdd2.map((text, i) => {
                                return(
                                    <motion.div
                                        key={i}
                                        className={clsx(sty.textBox)}
                                        {...fadein(100, 0, 0.5)}
                                    >
                                        <span>{ text }</span>
                                    </motion.div>
                                )
                            })

                        }
                        
                    </div>
                </div>

                <div className={clsx(sty.textArea)}>
                    <div className={clsx(sty.textAreaLeft, sty.companyText1)}>
                        
                        <motion.div
                            className={clsx(sty.textBox)}
                            {...fadein(-100, 0, 0.5)}
                        >
                            <span className="text-5xl font-black">조직은</span>
                        </motion.div>
                        <motion.div
                            className={clsx(sty.textBox)}
                            {...fadein(-100, 0, 0.5)}
                        >
                            <span>데이터로 운영되고</span>
                        </motion.div>
                    </div>

                    <div className={clsx(sty.textAreaRight, sty.companyText1, sty.companyTextRight)}>
                        <motion.div
                            className={clsx(sty.textBox)}
                            {...fadein(100, 0, 0.5)}
                        >
                            <span className="text-5xl font-black">성장은</span>
                        </motion.div>
                        <motion.div
                            className={clsx(sty.textBox)}
                            {...fadein(100, 0, 0.5)}
                        >
                            <span>사람에서 시작됩니다.</span>
                        </motion.div>
                    </div>
                </div>

                <div className={clsx(sty.textArea, sty.animeArea)}>
                    <CompanyAnime />
                    <motion.div
                        className={clsx(sty.textAreaCenter)}
                        {...fadein(0, 50, 0.5)}
                    >
                        <div className={clsx(sty.textBox)}>
                            <span>이 두요소가 분리되지 않고</span>
                        </div>
                        <div className={clsx(sty.textBox)}>
                            <span>동작하는 것을 목표합니다.</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className={clsx(sty.textAreaCenter)}
                        {...fadein(0, 50, 0.5)}
                    >
                        <div className={clsx(sty.textBox)}>
                            <span className="text-5xl font-black">
                                관계와 업무
                            </span>
                        </div>
                        <div className={clsx(sty.textBox)}>
                            <span className="text-5xl font-black">
                                성장과 성과
                            </span>
                        </div>
                        <div className={clsx(sty.textBox)}>
                            <span>데이터가 단절되지 않고</span>
                        </div>
                        <div className={clsx(sty.textBox)}>
                            <span>하나의 흐름이 될 수 있는</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className={clsx(sty.textAreaCenter)}
                        {...fadein(0, 50, 0.5)}
                    >
                        <div className={clsx(sty.textBox)}>
                            <span className="text-5xl font-black">인사관리 시스템의 새로운 접근방식</span>
                        </div>
                        <div className={clsx(sty.textBox)}>
                            <span className="text-8xl font-black">FloWeNect</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Company;
