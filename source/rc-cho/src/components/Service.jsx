import './Service.css';

const Service = () => {
  const services = [
    {
      icon: '🌐',
      name: 'Web Platform',
      description: '차세대 웹 플랫폼 솔루션',
      features: [
        '반응형 디자인',
        '빠른 로딩 속도',
        'SEO 최적화',
      ],
    },
    {
      icon: '📱',
      name: 'Mobile App',
      description: '크로스 플랫폼 모바일 애플리케이션',
      features: [
        'iOS/Android 지원',
        '네이티브 성능',
        '직관적인 UI/UX',
      ],
    },
    {
      icon: '☁️',
      name: 'Cloud Solution',
      description: '확장 가능한 클라우드 인프라',
      features: [
        '자동 스케일링',
        '고가용성 보장',
        '비용 최적화',
      ],
    },
    {
      icon: '🤖',
      name: 'AI/ML Service',
      description: '인공지능 기반 데이터 분석',
      features: [
        '예측 모델링',
        '자연어 처리',
        '이미지 인식',
      ],
    },
  ];

  return (
    <section id="service" className="service">
      <div className="section-header">
        <span className="section-label">Our Services</span>
        <h2 className="section-title">서비스 소개</h2>
        <p className="section-description">
          혁신적인 기술로 완성하는 최고의 솔루션
        </p>
      </div>

      <div className="service-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-name">{service.name}</h3>
            <p className="service-description">{service.description}</p>
            
            <div className="service-features">
              <h4>핵심 기능</h4>
              <ul>
                {service.features.map((feature, i) => (
                  <li key={i}>
                    <span className="feature-dot">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button className="service-detail-btn">
              자세히 보기
              <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Service;