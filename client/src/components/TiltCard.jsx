import { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', id = '', style = {} }) => {
    const cardRef = useRef(null);
    const [tiltStyle, setTiltStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const box = card.getBoundingClientRect();
        
        // Calculate mouse position relative to card
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        
        // Normalize coordinates to range [-0.5, 0.5]
        const px = x / box.width - 0.5;
        const py = y / box.height - 0.5;
        
        // Max tilt angles in degrees
        const maxTilt = 12;
        
        // Calculate tilt rotation
        const rotateX = -py * maxTilt;
        const rotateY = px * maxTilt;
        
        setTiltStyle({
            transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(108, 99, 255, 0.25)',
            transition: 'all 0.1s ease-out',
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            boxShadow: '',
            transition: 'all 0.5s ease',
        });
    };

    return (
        <div
            ref={cardRef}
            className={className}
            id={id}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                ...tiltStyle,
                transformStyle: 'preserve-3d',
                cursor: 'pointer',
            }}
        >
            <div style={{ transform: 'translateZ(25px)', transformStyle: 'preserve-3d' }}>
                {children}
            </div>
        </div>
    );
};

export default TiltCard;
