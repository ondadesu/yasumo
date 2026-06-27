"use client"
import Link from "next/link"
import { CalendarIcon } from "@heroicons/react/24/solid"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#f0f0ee] shadow-md">
      <div className="max-w-6xl mx-auto px-5 h-14 md:h-[80px] flex items-center justify-between gap-3">

        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 md:w-[34px] md:h-[34px] rounded-[8px] md:rounded-[9px] bg-[#c3d60b] flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
            <CalendarIcon className="w-4 h-4 md:w-[18px] md:h-[18px] text-white" />
          </div>
          <div>
            <p className="text-[15px] md:text-[20px] font-black text-[#0d0d0d] leading-none tracking-[-0.04em]">
              YASUMO
            </p>
            <p className="hidden md:block text-[9.5px] text-[#b0b0a8] mt-[3px] font-normal leading-none">
              チームの有給をスマートに管理
            </p>
          </div>
        </Link>

        {/* ボタン */}
        <div className="flex items-center gap-1.5">
          <Link href="/project">
            <button className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 md:px-[14px] py-[6px] text-[11px] font-semibold border border-[#e5e5e3] bg-white text-[#444] hover:border-[#c3d60b] hover:text-[#6e7d06] transition-all duration-150 cursor-pointer">
              <span className="text-sm leading-none">＋</span>
              <span className="hidden sm:inline">案件追加</span>
              <span className="sm:hidden">案件</span>
            </button>
          </Link>
          <Link href="/register">
            <button className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 md:px-[16px] py-[7px] text-[11px] font-bold border-none bg-[#c3d60b] text-white hover:bg-[#afc009] transition-all duration-150 cursor-pointer shadow-[0_1px_3px_#c3d60b55]">
              <span className="text-sm leading-none">＋</span>
              <span className="hidden sm:inline">有給登録</span>
              <span className="sm:hidden">登録</span>
            </button>
          </Link>
        </div>

      </div>
    </header>
  )
}
