import { useEffect, useRef } from "react";
import "./Company.css";

const Company = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 240, 255, 0.5)";

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width)
                    particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height)
                    particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2,
                );
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const team = [
        { name: "김민수", position: "CEO", avatar: "👨‍💼" },
        { name: "이지은", position: "CTO", avatar: "👩‍💻" },
        { name: "박준혁", position: "Lead Dev", avatar: "👨‍💻" },
        { name: "최서연", position: "Design Lead", avatar: "👩‍🎨" },
    ];

    return (
        <section id="company" className="company">
            {/* 메인 영역 */}
            <div className="company-hero">
                <canvas ref={canvasRef} className="hero-canvas"></canvas>
                <div className="hero-content">
                    <div className="company-logo-large">
                        <span className="logo-text">Flowenect</span>
                    </div>
                    <h1 className="company-slogan">혁신으로 연결하는 미래</h1>
                    <p className="company-tagline">
                        최첨단 IT 기술로 비즈니스의 새로운 가능성을 열어갑니다
                    </p>
                </div>
            </div>

            {/* 회사 소개 영역 */}
            <div className="company-intro">
                <div className="section-header">
                    <span className="section-label">About Us</span>
                    <h2 className="section-title">회사 소개</h2>
                </div>

                <div className="intro-content">
                    <div className="intro-text">
                        <h3>혁신과 기술로 미래를 만듭니다</h3>
                        <p>
                            Flowenect는 2020년 설립된 IT 전문 기업으로, 최첨단
                            기술과 혁신적인 솔루션을 통해 고객의 비즈니스 성장을
                            돕고 있습니다.
                        </p>
                        <p>
                            우리는 웹 개발, 모바일 앱, AI/ML, 클라우드 컴퓨팅 등
                            다양한 분야에서 전문성을 갖추고 있으며, 200개 이상의
                            성공적인 프로젝트를 수행했습니다.
                        </p>
                    </div>

                    <div className="intro-identity">
                        <div className="identity-card">
                            <div className="identity-icon">🎯</div>
                            <h4>우리의 비전</h4>
                            <p>기술 혁신으로 더 나은 세상을 만든다</p>
                        </div>
                        <div className="identity-card">
                            <div className="identity-icon">💡</div>
                            <h4>우리의 미션</h4>
                            <p>고객의 성공이 곧 우리의 성공</p>
                        </div>
                        <div className="identity-card">
                            <div className="identity-icon">⚡</div>
                            <h4>핵심 가치</h4>
                            <p>혁신, 전문성, 신뢰</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 팀 구성 영역 */}
            <div className="company-team">
                <div className="section-header">
                    <span className="section-label">Our Team</span>
                    <h2 className="section-title">팀 구성</h2>
                </div>

                <div className="team-grid">
                    {team.map((member, index) => (
                        <div className="team-member" key={index}>
                            <div className="member-avatar">{member.avatar}</div>
                            <h3>{member.name}</h3>
                            <p>{member.position}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Company;
