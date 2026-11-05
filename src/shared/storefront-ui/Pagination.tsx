"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages < 1) return null;

  const buildPageHref = (page: number) => {
    try {
      const isRelative = !baseUrl.startsWith("http");
      const url = new URL(baseUrl, "http://localhost");
      url.searchParams.set("page", String(page));
      return isRelative ? `${url.pathname}${url.search}` : url.toString();
    } catch {
      const sep = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${sep}page=${page}`;
    }
  };

  const handleScrollUp = () => {
    if (typeof window === "undefined") return;
    const el = document.getElementById("product-grid-top");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  // Sliding window of up to 5 visible page numbers
  const maxVisible = 5;
  let startPage = 1;
  let endPage = Math.min(totalPages, maxVisible);
  if (safePage > 3 && totalPages > maxVisible) {
    startPage = Math.min(safePage - 2, totalPages - maxVisible + 1);
    endPage = Math.min(startPage + maxVisible - 1, totalPages);
  }

  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-[40px] mb-[30px] flex justify-center w-full">
      <ul className="flex flex-wrap justify-center items-center gap-[8px] m-0 p-0 list-none">
        {/* Previous page « */}
        <li>
          {safePage > 1 ? (
            <Link
              href={buildPageHref(safePage - 1)}
              scroll={false}
              onClick={handleScrollUp}
              className="flex justify-center items-center w-[40px] h-[40px] bg-white border border-[#e1e1e1] text-[#333] hover:border-[#333] hover:text-[#000] transition-all rounded-tl-[10px] rounded-br-[10px] text-[16px] leading-none"
              aria-label="Trang trước"
            >
              &laquo;
            </Link>
          ) : (
            <span className="flex justify-center items-center w-[40px] h-[40px] bg-white border border-[#e1e1e1] text-[#bbb] rounded-tl-[10px] rounded-br-[10px] text-[16px] leading-none cursor-default select-none">
              &laquo;
            </span>
          )}
        </li>

        {/* Page numbers: 1, 2, 3, 4, 5 */}
        {pageNumbers.map((page) => {
          const isActive = page === safePage;
          return (
            <li key={page}>
              {isActive ? (
                <span className="flex justify-center items-center w-[40px] h-[40px] bg-[#222] border border-[#222] text-white font-medium rounded-tl-[10px] rounded-br-[10px] text-[15px] select-none shadow-sm">
                  {page}
                </span>
              ) : (
                <Link
                  href={buildPageHref(page)}
                  scroll={false}
                  onClick={handleScrollUp}
                  className="flex justify-center items-center w-[40px] h-[40px] bg-white border border-[#e1e1e1] text-[#333] hover:border-[#333] hover:text-[#000] transition-all rounded-tl-[10px] rounded-br-[10px] text-[15px]"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        {/* Next page » */}
        <li>
          {safePage < totalPages ? (
            <Link
              href={buildPageHref(safePage + 1)}
              scroll={false}
              onClick={handleScrollUp}
              className="flex justify-center items-center w-[40px] h-[40px] bg-white border border-[#e1e1e1] text-[#333] hover:border-[#333] hover:text-[#000] transition-all rounded-tl-[10px] rounded-br-[10px] text-[16px] leading-none"
              aria-label="Trang sau"
            >
              &raquo;
            </Link>
          ) : (
            <span className="flex justify-center items-center w-[40px] h-[40px] bg-white border border-[#e1e1e1] text-[#bbb] rounded-tl-[10px] rounded-br-[10px] text-[16px] leading-none cursor-default select-none">
              &raquo;
            </span>
          )}
        </li>

        {/* Trang cuối */}
        <li>
          {safePage < totalPages ? (
            <Link
              href={buildPageHref(totalPages)}
              scroll={false}
              onClick={handleScrollUp}
              className="flex justify-center items-center px-[18px] h-[40px] bg-white border border-[#e1e1e1] text-[#333] hover:border-[#333] hover:text-[#000] transition-all rounded-tl-[10px] rounded-br-[10px] text-[14px] whitespace-nowrap"
            >
              Trang cuối
            </Link>
          ) : (
            <span className="flex justify-center items-center px-[18px] h-[40px] bg-white border border-[#e1e1e1] text-[#bbb] rounded-tl-[10px] rounded-br-[10px] text-[14px] whitespace-nowrap cursor-default select-none">
              Trang cuối
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
