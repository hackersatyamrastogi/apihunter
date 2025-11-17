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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0e14',
          backgroundImage: 'linear-gradient(to bottom right, #0a0e14, #1a1f2e)',
          fontFamily: 'monospace',
        }}
      >
        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #00ff41',
            borderRadius: '16px',
            padding: '80px 120px',
            margin: '60px',
          }}
        >
          {/* Status indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
              fontSize: '28px',
              color: '#00d4ff',
            }}
          >
            <span style={{ marginRight: '12px' }}>{'>'}</span>
            <span style={{ color: '#00ff41', letterSpacing: '4px', fontSize: '24px' }}>
              INITIALIZED
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '110px',
              fontWeight: 900,
              color: '#00ff41',
              marginBottom: '30px',
              letterSpacing: '-2px',
            }}
          >
            APIHunter
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '40px',
              color: '#00d4ff',
              marginBottom: '20px',
              fontWeight: 600,
            }}
          >
            Security Testing Terminal
          </div>

          {/* Feature list */}
          <div
            style={{
              fontSize: '26px',
              color: '#00ff41',
              textAlign: 'center',
              opacity: 0.9,
              fontWeight: 500,
            }}
          >
            API Key Validation • JWT Security Testing • 100+ Providers
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            right: '60px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '22px',
              color: '#00d4ff',
            }}
          >
            <span style={{ marginRight: '10px' }}>{'>'}</span>
            <span style={{ color: '#888' }}>www.apihunter.app</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 28px',
              backgroundColor: 'rgba(0, 255, 65, 0.15)',
              border: '2px solid #00ff41',
              borderRadius: '8px',
              color: '#00ff41',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            <span style={{ marginRight: '10px' }}>{'>'}</span>
            <span>by Satyam Rastogi</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
