import LeftFooter from './LeftFooter.jsx';   // .jsx 추가
import RightFooter from './RightFooter.jsx'; // .jsx 추가
import './Footer.css';

const Footer = () => {
  const handleCtaClick = () => {
    const jspUrl = `${window.location.protocol}//${window.location.hostname}/`;
    window.open(jspUrl, "_blank");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <LeftFooter />
        <RightFooter onCtaClick={handleCtaClick} />
      </div>
    </footer>
  );
};

export default Footer;