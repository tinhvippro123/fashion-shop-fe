"use client";

import { useCartStore } from "@/features/cart-and-order/stores/cart.store";

export default function SuccessModal() {
  const { isSuccessModalOpen } = useCartStore();

  if (!isSuccessModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 transition-opacity">
      <div className="bg-white p-[40px] text-center max-w-[500px] w-[90%] relative animate-fadeInUp shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
        <button
          onClick={() => useCartStore.setState({ isSuccessModalOpen: false })}
          className="absolute top-[15px] right-[20px] text-[#999] hover:text-[#000] text-[24px] font-light bg-transparent border-none cursor-pointer leading-none"
        >
          &times;
        </button>

        <div className="flex justify-center mb-[25px] mt-[10px]">
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 40 L80 40 L85 90 L15 90 Z"
              stroke="#000"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M35 40 C 35 20, 65 20, 65 40"
              stroke="#000"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M40 60 L48 68 L62 52"
              stroke="#000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h5 className="font-medium mt-[1rem] text-[18px] text-[#222] uppercase tracking-[0.5px]">
          THÊM VÀO GIỎ HÀNG THÀNH CÔNG !
        </h5>
      </div>
    </div>
  );
}

