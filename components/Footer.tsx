"use client"
import { CalendarIcon } from "@heroicons/react/24/solid"

const links = ["利用規約", "プライバシー", "お問い合わせ"]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#333333]">
      <div className="max-w-6xl mx-auto px-5 pt-7 pb-7">

        {/* 上段 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">

          {/* ロゴ＋キャッチ */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#c3d60b] flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4 text-[#0e0e0d]" />
              </div>
              <span className="text-[15px] font-black text-white tracking-[-0.03em]">YASUMO</span>
            </div>
            <p className="text-[11px] text-white mt-3 leading-relaxed">
              チームの有給状況をひと目でスマートに把握
            </p>
          </div>

          {/* リンク — モバイルは縦積み、sm以上は横並び */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 sm:items-center">
            {links.map(label => (
              <a key={label} href="#" className="text-[12px] sm:text-[11px] font-medium text-white hover:text-[#c3d60b] transition-colors duration-150">
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* 下段 */}
        <div className="border-t border-white/[0.06] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white">© {year} yasumo. All rights reserved.</p>
          <span className="text-[9.5px] font-bold tracking-[0.06em] text-[#c3d60b] bg-[#c3d60b]/[0.12] border border-[#c3d60b]/30 rounded-full px-3 py-1">
            有給管理ツール
          </span>
        </div>

      </div>
    </footer>
  )
}
