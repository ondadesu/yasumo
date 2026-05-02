"use client"

import Link from "next/link"
import { CalendarIcon } from "@heroicons/react/24/solid"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-2">
        
        {/* ロゴエリア */}
        <div className="fade-left shrink-0">
          <h1 className="flex items-center text-2xl md:text-3xl font-bold text-black">
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-[#c3d60b] mr-1.5 md:mr-2" />
            YASUMO
          </h1>
          {/* PCでのみ表示 */}
          <p className="hidden md:block text-xs text-gray-500 mt-1 ml-1">
            ～チームの有給状況を、ひと目でスマートに把握～
          </p>
        </div>

        {/* ボタンエリア */}
        <div className="fade-right flex items-center gap-2 md:gap-4">
          <Link href="/project">
            <button
              className="
                whitespace-nowrap rounded-full 
                px-3.5 py-2 md:px-7 md:py-2.5
                text-xs md:text-sm font-semibold shadow-sm
                bg-black border border-transparent text-white
                hover:text-black hover:bg-white hover:border-black transition cursor-pointer
              "
            >
              ＋ 案件追加
            </button>
          </Link>

          <Link href="/register">
            <button
              className="
                whitespace-nowrap rounded-full 
                px-3.5 py-2 md:px-7 md:py-2.5
                text-xs md:text-sm font-semibold shadow-sm
                bg-[#c3d60b] border border-transparent text-white
                hover:text-[#c3d60b] hover:bg-white hover:border-[#c3d60b] transition cursor-pointer
              "
            >
              ＋ 有給登録
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}