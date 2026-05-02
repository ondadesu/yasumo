"use client"

import React from "react"

export default function Footer () {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black text-white py-6">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-3">

        {/* © 表示 */}
        <div className="text-sm opacity-80">
          © {year} yasumo
        </div>

        {/* リンク類 */}
        <div className="flex gap-6 text-sm opacity-80">
          <a href="#" className="hover:opacity-100 transition">利用規約</a>
          <a href="#" className="hover:opacity-100 transition">プライバシー</a>
          <a href="#" className="hover:opacity-100 transition">お問い合わせ</a>
        </div>

      </div>
    </footer>
  )
}