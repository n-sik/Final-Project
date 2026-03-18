import styled from "./Service.module.css";

export const ServiceCard = ({ id, title, content }) => {
    const Icon = () => {
        // 직접 만든 SVG (투명 배경, 패키지 설치 불필요)
        // 우주 컨셉에 맞게 "행성/궤도/별자리" 모티프
        switch (id) {
            case 1:
                // Orbit map
                return (
                    <svg
                        className={styled.cardIcon}
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle
                            cx="32"
                            cy="32"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="22"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.55"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="30"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.25"
                        />
                        <circle cx="54" cy="26" r="2.5" fill="currentColor" />
                        <path
                            d="M32 10c9 0 16 7 16 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.55"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            case 2:
                // Rocket
                return (
                    <svg
                        className={styled.cardIcon}
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M36 10c10 4 16 14 18 26-12 2-22 8-26 18-12-2-22-8-26-18 4-10 14-16 26-26Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.9"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M26 38l-10 4 4-10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.7"
                        />
                        <circle
                            cx="38"
                            cy="26"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M32 54c2-6 6-10 12-12"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.55"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            case 3:
                // Constellation
                return (
                    <svg
                        className={styled.cardIcon}
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle cx="18" cy="26" r="2.5" fill="currentColor" />
                        <circle cx="28" cy="18" r="2.5" fill="currentColor" />
                        <circle cx="40" cy="22" r="2.5" fill="currentColor" />
                        <circle cx="46" cy="34" r="2.5" fill="currentColor" />
                        <circle cx="30" cy="40" r="2.5" fill="currentColor" />
                        <path
                            d="M18 26L28 18L40 22L46 34L30 40"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.55"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M30 40L22 48"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.35"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="22"
                            cy="48"
                            r="2"
                            fill="currentColor"
                            opacity="0.85"
                        />
                    </svg>
                );

            case 4:
                // Shield / safety field
                return (
                    <svg
                        className={styled.cardIcon}
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M32 10l18 6v16c0 14-8 22-18 26-10-4-18-12-18-26V16l18-6Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M24 34l6 6 14-14"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M14 26c6-6 14-10 18-10"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.35"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            default:
                // Planet
                return (
                    <svg
                        className={styled.cardIcon}
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle
                            cx="32"
                            cy="34"
                            r="12"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M16 34c8-6 24-10 40-8"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.55"
                            strokeLinecap="round"
                        />
                        <path
                            d="M14 40c10 6 26 10 38 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            opacity="0.35"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="44"
                            cy="22"
                            r="2"
                            fill="currentColor"
                            opacity="0.85"
                        />
                    </svg>
                );
        }
    };

    return (
        <div className={styled.card}>
            <div className={styled.cardHead}>
                <Icon />
                <div className={styled.cardTitle}>{title}</div>
            </div>

            <div className={styled.cardContent}>
                {content.map((con, index) => (
                    <span key={index}>{con}</span>
                ))}
            </div>
        </div>
    );
};
