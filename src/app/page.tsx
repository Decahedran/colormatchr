'use client'

import ColorThief from 'colorthief'
import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colors, setColors] = useState<number[][]>([])
  const [hasPaid, setHasPaid] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

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
    window.open('https://derekmcauley.gumroad.com/l/ColorMatchrPro', '_blank')
    // Uncomment below line for local testing
    // setHasPaid(true)
  }

  const handleDownload = async () => {
    const palette = document.getElementById('palette-area')
    if (palette) {
      const canvas = await html2canvas(palette)
      const link = document.createElement('a')
      link.download = 'palette.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
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

          <div id="palette-area" className="flex flex-wrap gap-3 justify-center mt-4">
            {colors.map((color, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg shadow-md"
                style={{ backgroundColor: `rgb(${color.join(',')})` }}
              />
            ))}
          </div>

          <div className="mt-4 text-center">
  <p className="text-sm text-gray-600 mb-2">
    {colors.length === 0
      ? '🎨 Upload an image to extract colors and unlock Pro features'
      : hasPaid
      ? '✅ Pro unlocked – download your palette!'
      : '🔒 Download requires Pro'}
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
