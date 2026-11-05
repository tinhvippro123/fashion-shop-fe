import Link from "next/link";

interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge?: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: "women",
    title: "THỜI TRANG NỮ",
    subtitle: "Đầm, sơ mi & chân váy thanh lịch",
    href: "/danh-muc/nu",
    image: "/uploads/ivy/002eab5bd95091694139ae9e8f046007.webp",
  },
  {
    id: "men",
    title: "THỜI TRANG NAM",
    subtitle: "Polo, sơ mi & quần âu chuẩn phom",
    href: "/danh-muc/nam",
    image: "/uploads/ivy/273101e9-e223-4071-a410-5978071e1617.webp",
  },
  {
    id: "sale",
    title: "HOT DEALS & SALE",
    subtitle: "Ưu đãi hấp dẫn lên tới 50%",
    href: "/danh-muc/sale",
    image: "/uploads/ivy/0284007651a63e1aa34493daa2754ba1.webp",
    badge: "SALE UP TO 50%",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="w-full min-[1200px]:px-[85px] px-[15px] mx-auto my-[50px] xl:my-[70px]">
      <div className="text-center mb-[30px]">
        <h3 className="text-[28px] md:text-[32px] font-bold uppercase tracking-[3px] text-[#000] mb-[8px]">
          DANH MỤC NỔI BẬT
        </h3>
        <p className="text-[14px] text-[#6c757d] uppercase tracking-[1px]">
          Khám phá phong cách thời trang ấn tượng cho mọi dịp
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] xl:gap-[30px]">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative block aspect-[3/4] overflow-hidden rounded-[8px] bg-[#f8f8f8] shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat.image}
              alt={cat.title}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity group-hover:from-black/85" />

            {/* Sale Badge if any */}
            {cat.badge && (
              <span className="absolute top-[16px] left-[16px] px-[12px] py-[5px] bg-[#b5121b] text-white text-[11px] font-bold tracking-wider uppercase rounded-full shadow-sm">
                {cat.badge}
              </span>
            )}

            {/* Content Bottom */}
            <div className="absolute bottom-[20px] left-[20px] right-[20px] text-white z-10">
              <h4 className="text-[20px] md:text-[22px] font-bold tracking-[1.5px] uppercase mb-[4px] drop-shadow-sm">
                {cat.title}
              </h4>
              <p className="text-[13px] text-gray-200 mb-[14px] font-light">
                {cat.subtitle}
              </p>
              <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[1.5px] font-medium text-white pb-[2px] border-b border-white group-hover:border-[#b5121b] group-hover:text-red-300 transition-colors">
                Khám phá ngay <i className="fas fa-arrow-right text-[10px]"></i>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
