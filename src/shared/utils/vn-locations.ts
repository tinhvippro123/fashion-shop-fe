export interface VnWard {
  code: number;
  name: string;
}

export interface VnDistrict {
  code: number;
  name: string;
  wards: VnWard[];
}

export interface VnProvince {
  code: number;
  name: string;
  districts: VnDistrict[];
}

export const FALLBACK_PROVINCES: VnProvince[] = [
  {
    code: 79,
    name: "Thành phố Hồ Chí Minh",
    districts: [
      {
        code: 760,
        name: "Quận 1",
        wards: [
          { code: 26734, name: "Phường Bến Nghé" },
          { code: 26737, name: "Phường Bến Thành" },
          { code: 26740, name: "Phường Đa Kao" },
        ],
      },
      {
        code: 769,
        name: "Thành phố Thủ Đức",
        wards: [
          { code: 26830, name: "Phường Thảo Điền" },
          { code: 26833, name: "Phường An Phú" },
          { code: 26836, name: "Phường Linh Trung" },
        ],
      },
      {
        code: 770,
        name: "Quận 3",
        wards: [
          { code: 27127, name: "Phường Võ Thị Sáu" },
          { code: 27130, name: "Phường 9" },
        ],
      },
      {
        code: 778,
        name: "Quận 7",
        wards: [
          { code: 27487, name: "Phường Tân Phong" },
          { code: 27490, name: "Phường Tân Phú" },
        ],
      },
    ],
  },
  {
    code: 1,
    name: "Thành phố Hà Nội",
    districts: [
      {
        code: 2,
        name: "Quận Hoàn Kiếm",
        wards: [
          { code: 40, name: "Phường Tràng Tiền" },
          { code: 43, name: "Phường Hàng Bài" },
        ],
      },
      {
        code: 5,
        name: "Quận Cầu Giấy",
        wards: [
          { code: 166, name: "Phường Dịch Vọng" },
          { code: 169, name: "Phường Mai Dịch" },
        ],
      },
      {
        code: 9,
        name: "Quận Thanh Xuân",
        wards: [
          { code: 343, name: "Phường Thanh Xuân Trung" },
          { code: 346, name: "Phường Nhân Chính" },
        ],
      },
    ],
  },
  {
    code: 48,
    name: "Thành phố Đà Nẵng",
    districts: [
      {
        code: 492,
        name: "Quận Hải Châu",
        wards: [
          { code: 20242, name: "Phường Hải Châu I" },
          { code: 20245, name: "Phường Nam Dương" },
        ],
      },
      {
        code: 493,
        name: "Quận Sơn Trà",
        wards: [
          { code: 20263, name: "Phường An Hải Bắc" },
          { code: 20266, name: "Phường Phước Mỹ" },
        ],
      },
    ],
  },
  {
    code: 92,
    name: "Thành phố Cần Thơ",
    districts: [
      {
        code: 916,
        name: "Quận Ninh Kiều",
        wards: [
          { code: 31120, name: "Phường Tân An" },
          { code: 31123, name: "Phường Xuân Khánh" },
        ],
      },
    ],
  },
];

export async function loadVnProvinces(): Promise<VnProvince[]> {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
    if (!res.ok) return FALLBACK_PROVINCES;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_PROVINCES;
  } catch {
    return FALLBACK_PROVINCES;
  }
}

export async function loadVnDistricts(
  provinceCode?: number | string,
  provinceName?: string
): Promise<VnDistrict[]> {
  if (!provinceCode && !provinceName) return [];
  const fallbackProvince = FALLBACK_PROVINCES.find(
    (p) =>
      String(p.code) === String(provinceCode) ||
      (provinceName && p.name === provinceName)
  );
  if (provinceCode) {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.districts) && data.districts.length > 0) {
          return data.districts;
        }
      }
    } catch {
      // Fallback below
    }
  }
  return fallbackProvince?.districts || FALLBACK_PROVINCES[0].districts;
}

export async function loadVnWards(
  districtCode?: number | string,
  districtName?: string
): Promise<VnWard[]> {
  if (!districtCode && !districtName) return [];
  if (districtCode) {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.wards) && data.wards.length > 0) {
          return data.wards;
        }
      }
    } catch {
      // Fallback below
    }
  }
  for (const p of FALLBACK_PROVINCES) {
    const found = p.districts.find(
      (d) =>
        String(d.code) === String(districtCode) ||
        (districtName && d.name === districtName)
    );
    if (found) return found.wards;
  }
  return FALLBACK_PROVINCES[0].districts[0].wards;
}
