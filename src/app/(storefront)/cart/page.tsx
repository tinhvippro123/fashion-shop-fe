import CartDetail from "@/features/cart-and-order/components/cart/CartDetail";

export const metadata = {
  title: "Giỏ hàng | Luxe Fashion",
  description: "Giỏ hàng của bạn tại Luxe Fashion",
};

export default function CartPage() {
  return (
    <>
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mt-[2.5rem]">
        {/* Progress Bar Container */}
        <div className="max-w-[800px] mx-auto px-[20px] md:px-[40px]">
          {/* Progress Bar */}
          <div className="flex justify-between relative mb-[40px] md:mb-[50px] mt-[20px] md:mt-[30px]">
            {/* Background Line */}
            <div className="absolute top-[5px] md:top-[7px] left-[50px] right-[50px] h-[2px] bg-[#e0e0e0] z-[1]"></div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-[#222] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] font-normal text-[#222]">
                Giỏ hàng
              </div>
            </div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-white border-[2px] border-[#e0e0e0] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] text-[#999]">
                Đặt hàng
              </div>
            </div>

            <div className="relative z-[2] text-center w-[100px]">
              <div className="w-[12px] h-[12px] md:w-[16px] md:h-[16px] mx-auto rounded-full bg-white border-[2px] border-[#e0e0e0] mb-[5px] md:mb-[10px] relative z-10"></div>
              <div className="text-[12px] md:text-[14px] text-[#999]">
                Hoàn thành đơn
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartDetail />
    </>
  );
}

