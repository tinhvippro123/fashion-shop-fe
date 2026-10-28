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
  if (totalPages <= 1) return null;

  const buildPageHref = (page: number) => {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}page=${page}`;
  };

  return (
    <nav className="mt-[30px] lg:mt-[50px]">
      <ul className="flex flex-wrap justify-center items-center gap-[5px] m-0 p-0 list-none">
        {currentPage > 1 && (
          <>
            <li>
              <Link
                href={buildPageHref(1)}
                className="flex justify-center items-center px-[12px] py-[8px] min-w-[40px] min-h-[40px] text-[#007bff] bg-white border border-[#dee2e6] hover:bg-[#e9ecef] hover:text-[#0056b3] transition-colors rounded-tl-[12px] rounded-br-[12px] whitespace-nowrap"
              >
                Trang đầu
              </Link>
            </li>
            <li>
              <Link
                href={buildPageHref(currentPage - 1)}
                className="flex justify-center items-center px-[12px] py-[8px] min-w-[40px] min-h-[40px] text-[#007bff] bg-white border border-[#dee2e6] hover:bg-[#e9ecef] hover:text-[#0056b3] transition-colors rounded-tl-[12px] rounded-br-[12px]"
              >
                &laquo;
              </Link>
            </li>
          </>
        )}

        {Array.from({ length: totalPages }).map((_, idx) => {
          const page = idx + 1;
          const isActive = page === currentPage;
          return (
            <li key={page}>
              <Link
                href={buildPageHref(page)}
                className={`flex justify-center items-center px-[12px] py-[8px] min-w-[40px] min-h-[40px] border transition-colors rounded-tl-[12px] rounded-br-[12px] ${
                  isActive
                    ? "bg-[#222] border-[#222] text-[#0db7ed] font-bold pointer-events-none"
                    : "bg-white border-[#dee2e6] text-[#007bff] hover:bg-[#e9ecef] hover:text-[#0056b3]"
                }`}
              >
                {page}
              </Link>
            </li>
          );
        })}

        {currentPage < totalPages && (
          <>
            <li>
              <Link
                href={buildPageHref(currentPage + 1)}
                className="flex justify-center items-center px-[12px] py-[8px] min-w-[40px] min-h-[40px] text-[#007bff] bg-white border border-[#dee2e6] hover:bg-[#e9ecef] hover:text-[#0056b3] transition-colors rounded-tl-[12px] rounded-br-[12px]"
              >
                &raquo;
              </Link>
            </li>
            <li>
              <Link
                href={buildPageHref(totalPages)}
                className="flex justify-center items-center px-[12px] py-[8px] min-w-[40px] min-h-[40px] text-[#007bff] bg-white border border-[#dee2e6] hover:bg-[#e9ecef] hover:text-[#0056b3] transition-colors rounded-tl-[12px] rounded-br-[12px] whitespace-nowrap"
              >
                Trang cuối
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

