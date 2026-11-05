import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const SERVICES = [
  {
    icon: Truck,
    title: "MIỄN PHÍ VẬN CHUYỂN",
    description: "Cho toàn bộ đơn hàng giá trị từ 500.000₫",
  },
  {
    icon: RotateCcw,
    title: "ĐỔI HÀNG 15 NGÀY",
    description: "Thủ tục đổi trả tiện lợi và nhanh chóng",
  },
  {
    icon: ShieldCheck,
    title: "100% CHÍNH HÃNG",
    description: "Thiết kế chuẩn phom & chất liệu cao cấp",
  },
  {
    icon: Headphones,
    title: "HỖ TRỢ 24/7",
    description: "Đội ngũ chuyên viên tư vấn tận tâm",
  },
];

export default function ServiceHighlights() {
  return (
    <section className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto my-[50px] xl:my-[60px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] p-[30px] md:p-[40px] bg-[#fbfbfb] border border-[#f0f0f0] rounded-[16px]">
        {SERVICES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-[16px] p-[10px] transition-transform hover:-translate-y-1 duration-300"
            >
              <div className="shrink-0 w-[48px] h-[48px] rounded-full bg-[#111] text-white flex items-center justify-center shadow-sm">
                <Icon className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h5 className="text-[14px] font-bold tracking-[1px] uppercase text-[#111] mb-[4px]">
                  {item.title}
                </h5>
                <p className="text-[13px] text-[#6c757d] leading-[1.4]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
