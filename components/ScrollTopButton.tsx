"use client"

export default function ScrollTopButton(){

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-xl shadow-lg text-white flex items-center justify-center text-xl hover:scale-110 transition"
      style={{background:"#c3d60b"}}
    >
      ↑
    </button>
  )
}