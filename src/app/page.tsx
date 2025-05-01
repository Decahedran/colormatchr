'use client'

import ColorThief from 'colorthief'
import html2canvas from 'html2canvas'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colors, setColors] = useState<number[][]>([])
  const [hasPaid, setHasPaid] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  function ProUnlocker({ onUnlock }: { onUnlock: () => void }) {
    const searchParams = useSearchParams()

    useEffect(() => {
      if (searchParams.get('unlocked') === 'true') {
        onUnlock()
        localStorage.setItem('colormatchr-pro', 'true')
      } else if (localStorage.getItem('colormatchr-pro') === 'true') {
        onUnlock()
      }
    }, [searchParams, onUnlock])

    return null
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setColors([]) // Reset palette
    }
  }

  const extractColors = () => {
    const img = imgRef.current
    if (img && img.complete) {
      try {
        const colorThief = new ColorThief()
        const palette = colorThief.getPalette(img, 6)
        console.log('🎨 Extracted palette:', palette)
        setColors(palette)
      } catch (err) {
        console.error('❌ Error extracting palette:', err)
      }
    } else {
      console.warn('⏳ Image not ready yet')
    }
  }

  const handleBuyPro = () => {
    window.open('https://orchidsolutions.gumroad.com/l/ColorMatchrPro', '_blank')
  }

  const handleDownload = async () => {
    const target = document.getElementById('capture-target')
    if (!target) {
      alert('Could not find the palette to download.')
      return
    }

    try {
      const canvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        useCORS: true
      })

      const link = document.createElement('a')
      link.download = 'palette.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('❌ Error generating PNG:', error)
      alert('There was an error saving the image. Try again.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <Suspense fallback={null}>
        <ProUnlocker onUnlock={() => setHasPaid(true)} />
      </Suspense>

      <h1 className="text-3xl font-bold mb-6">🎨 ColorMatchr</h1>

      <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4">
        Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {imageUrl && (
        <>
          <img
            src={imageUrl}
            alt="Uploaded"
            ref={imgRef}
            crossOrigin="anonymous"
            onLoad={extractColors}
            className="max-w-xs rounded shadow mb-4"
          />

          {colors.length === 0 && (
            <p className="text-sm text-red-500">⚠️ No colors extracted yet</p>
          )}

          <div className="mt-4 flex justify-center">
            <div
              id="capture-target"
              style={{
                backgroundColor: '#ffffff',
                padding: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
              }}
            >
              {colors.map((color, i) => {
  const [r, g, b] = color
  const hex = `#${color.map(c => c.toString(16).padStart(2, '0')).join('')}`
  const rgbStr = `rgb(${r}, ${g}, ${b})`

  // Convert RGB to CMYK (values between 0–100%)
  const rPerc = r / 255
  const gPerc = g / 255
  const bPerc = b / 255

  const k = 1 - Math.max(rPerc, gPerc, bPerc)
  const c = k < 1 ? (1 - rPerc - k) / (1 - k) : 0
  const m = k < 1 ? (1 - gPerc - k) / (1 - k) : 0
  const y = k < 1 ? (1 - bPerc - k) / (1 - k) : 0

  const cmykStr = `cmyk(${(c * 100).toFixed(0)}%, ${(m * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%, ${(k * 100).toFixed(0)}%)`

  return (
    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '0.5rem',
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      />
      {hasPaid && (
        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left' }}>
          <button
            onClick={() => navigator.clipboard.writeText(hex)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#555',
              display: 'block',
              marginBottom: '2px'
            }}
          >
            {hex} 📋
          </button>
          <div style={{ color: '#555', fontSize: '0.7rem' }}>{rgbStr}</div>
          <div style={{ color: '#555', fontSize: '0.7rem' }}>{cmykStr}</div>
        </div>
      )}
    </div>
  )
})}

            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {colors.length === 0
                ? '🎨 Upload an image to extract colors and unlock Pro features'
                : hasPaid
                ? '✅ Pro unlocked – download your palette and copy HEX codes'
                : '🔒 Download and HEX codes require Pro'}
            </p>

            {colors.length > 0 ? (
              hasPaid ? (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  📥 Download Palette
                </button>
              ) : (
                <button
                  onClick={handleBuyPro}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Buy ColorMatchr Pro
                </button>
              )
            ) : null}
          </div>

          <p className="text-sm mt-2 text-gray-600">Extracted Palette</p>
        </>
      )}
    </main>
  )
}
