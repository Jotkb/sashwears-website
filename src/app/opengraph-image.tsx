import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Sashwears — Women\'s Fashion, Accra'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1C1A18',
          color: '#FAF7F2',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 72, letterSpacing: '0.1em', marginBottom: 24 }}>
          SASHWEARS
        </div>
        <div style={{ fontSize: 20, letterSpacing: '0.2em', opacity: 0.6, textTransform: 'uppercase' }}>
          Women&apos;s Fashion · Accra, Ghana
        </div>
      </div>
    ),
    size
  )
}
