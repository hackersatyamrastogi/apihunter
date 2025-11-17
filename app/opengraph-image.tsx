import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'APIHunter - API Security Testing Tool';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Terminal-style border */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '2px solid #00ff41',
            borderRadius: '8px',
            display: 'flex',
          }}
        />

        {/* Grid background effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(#00ff4120 1px, transparent 1px), linear-gradient(90deg, #00ff4120 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            opacity: 0.3,
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Terminal prompt */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              color: '#00d4ff',
              fontSize: '32px',
            }}
          >
            <span style={{ marginRight: '15px' }}>{'>'}</span>
            <span style={{ color: '#00ff41', fontSize: '24px', letterSpacing: '3px' }}>
              INITIALIZED
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '100px',
              fontWeight: 'bold',
              color: '#00ff41',
              marginBottom: '20px',
              textShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
              display: 'flex',
            }}
          >
            APIHunter
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '36px',
              color: '#00d4ff',
              marginBottom: '15px',
              display: 'flex',
            }}
          >
            Security Testing Terminal
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: '#00ff41',
              opacity: 0.8,
              textAlign: 'center',
              maxWidth: '900px',
              display: 'flex',
            }}
          >
            API Key Validation • JWT Security Testing • 100+ Providers
          </div>

          {/* Footer prompt */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
              color: '#00d4ff',
              fontSize: '20px',
            }}
          >
            <span style={{ marginRight: '10px' }}>{'>'}</span>
            <span style={{ color: '#888' }}>www.apihunter.app</span>
          </div>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid #00ff41',
            borderRadius: '6px',
            color: '#00ff41',
            fontSize: '18px',
          }}
        >
          <span style={{ marginRight: '8px' }}>{'>'}</span>
          <span>by Satyam Rastogi</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
