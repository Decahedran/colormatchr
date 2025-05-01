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
    const palette = document.getElementById('palette-area')
    if (!palette) {
      alert('Could not find the palette to download.')
      return
    }
  
    try {
      const canvas = await html2canvas(palette, {
        backgroundColor: '#ffffff',
        useCORS: true,
        ignoreElements: (el) =>
          getComputedStyle(el).color.includes('oklch') ||
          getComputedStyle(el).backgroundColor.includes('oklch')
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

          <div id="palette-area" className="flex flex-wrap gap-4 justify-center mt-4">
            {colors.map((color, i) => {
              const hex = `#${color.map(c => c.toString(16).padStart(2, '0')).join('')}`
              return (
                <div key={i} className="flex flex-col items-center space-y-1">
                  <div
                    className="w-14 h-14 rounded-lg shadow-md"
                    style={{ backgroundColor: `rgb(${color.join(',')})` }}
                  />
                  {hasPaid && (
                    <button
                      onClick={() => navigator.clipboard.writeText(hex)}
                      className="text-xs text-gray-600 hover:text-black"
                    >
                      {hex} 📋
                    </button>
                  )}
                </div>
              )
            })}
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
