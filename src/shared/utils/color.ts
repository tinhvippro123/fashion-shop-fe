export const DEFAULT_FASHION_COLORS: Record<string, string> = {
  // 1. Nhóm Đen - Trắng - Xám
  "đen": "#111111",
  "den": "#111111",
  "black": "#111111",
  "trắng": "#FFFFFF",
  "trang": "#FFFFFF",
  "white": "#FFFFFF",
  "trắng sữa": "#F5F5F0",
  "trang sua": "#F5F5F0",
  "xám": "#9CA3AF",
  "xam": "#9CA3AF",
  "gray": "#9CA3AF",
  "grey": "#9CA3AF",
  "xám nhạt": "#E5E7EB",
  "xam nhat": "#E5E7EB",
  "xám đậm": "#374151",
  "xam dam": "#374151",
  "ghi": "#6B7280",

  // 2. Nhóm Be - Kem - Nâu
  "kem": "#FFF4D4",
  "cream": "#FFF4D4",
  "be": "#D8C7B0",
  "beige": "#D8C7B0",
  "be vàng": "#E6C587",
  "be vang": "#E6C587",
  "be sữa": "#EFE5D5",
  "be sua": "#EFE5D5",
  "nâu": "#6F4E37",
  "nau": "#6F4E37",
  "brown": "#6F4E37",
  "nâu tây": "#A67B5B",
  "nau tay": "#A67B5B",
  "nâu bò": "#C17737",
  "nau bo": "#C17737",
  "nâu socola": "#382216",
  "nau socola": "#382216",
  "nâu cà phê": "#4A3728",
  "nau ca phe": "#4A3728",

  // 3. Nhóm Đỏ - Hồng
  "đỏ": "#C92A2A",
  "do": "#C92A2A",
  "red": "#C92A2A",
  "đỏ tươi": "#E02020",
  "do tuoi": "#E02020",
  "đỏ đô": "#800020",
  "do do": "#800020",
  "đỏ mận": "#5B1E31",
  "do man": "#5B1E31",
  "đỏ rượu": "#67162E",
  "do ruou": "#67162E",
  "đỏ ruby": "#A61C1C",
  "do ruby": "#A61C1C",
  "hồng": "#F2A6B3",
  "hong": "#F2A6B3",
  "pink": "#F2A6B3",
  "hồng phấn": "#FFC0CB",
  "hong phan": "#FFC0CB",
  "hồng pastel": "#F9D5DC",
  "hong pastel": "#F9D5DC",
  "hồng đất": "#B86B77",
  "hong dat": "#B86B77",
  "hồng cánh sen": "#D81B60",
  "hong canh sen": "#D81B60",

  // 4. Nhóm Vàng - Cam
  "vàng": "#F5C542",
  "vang": "#F5C542",
  "yellow": "#F5C542",
  "vàng chanh": "#F4E04D",
  "vang chanh": "#F4E04D",
  "vàng mù tạt": "#E1AD01",
  "vang mu tat": "#E1AD01",
  "cam": "#FD7E14",
  "orange": "#FD7E14",
  "cam cháy": "#BF4611",
  "cam chay": "#BF4611",
  "cam đất": "#CF6943",
  "cam dat": "#CF6943",
  "cam san hô": "#FF7F66",
  "cam san ho": "#FF7F66",

  // 5. Nhóm Xanh Dương - Tím Than
  "xanh navy": "#1B365D",
  "navy": "#1B365D",
  "xanh tím than": "#232B3E",
  "xanh tim than": "#232B3E",
  "tím than": "#3B234A",
  "tim than": "#3B234A",
  "xanh đen": "#0F172A",
  "xanh den": "#0F172A",
  "xanh dương": "#2563EB",
  "xanh duong": "#2563EB",
  "blue": "#2563EB",
  "xanh coban": "#0047AB",
  "xanh da trời": "#6BA4FF",
  "xanh da troi": "#6BA4FF",
  "xanh baby": "#89CFF0",

  // 6. Nhóm Xanh Lá
  "xanh lá": "#198754",
  "xanh la": "#198754",
  "green": "#198754",
  "xanh rêu": "#4A5D4E",
  "xanh reu": "#4A5D4E",
  "xanh bơ": "#9DB672",
  "xanh bo": "#9DB672",
  "xanh mint": "#8FE3D4",
  "xanh ngọc": "#20B2AA",
  "xanh ngoc": "#20B2AA",
  "xanh oliu": "#6B7A40",

  // 7. Nhóm Tím
  "tím": "#7952B3",
  "tim": "#7952B3",
  "purple": "#7952B3",
  "tím pastel": "#C3B1E1",
  "tím huế": "#581845",
};

export function getFashionColorHex(name?: string | null): string {
  if (!name) return "#6c757d";
  const clean = name.trim().toLowerCase();

  // 1. Khớp chính xác từ điển
  if (DEFAULT_FASHION_COLORS[clean]) {
    return DEFAULT_FASHION_COLORS[clean];
  }

  // 2. Nhận diện các màu ghép phức hợp (Ưu tiên từ khóa dài và đặc thù trước)
  // Be - Kem
  if (clean.includes("be vàng") || clean.includes("be vang")) return "#E6C587";
  if (clean.includes("be sữa") || clean.includes("be sua")) return "#EFE5D5";
  if (clean.includes("kem") || clean.includes("cream")) return "#FFF4D4";
  if (clean.includes("be") || clean.includes("beige")) return "#D8C7B0";

  // Đỏ - Hồng
  if (clean.includes("đỏ đô") || clean.includes("do do") || clean.includes("ruby")) return "#800020";
  if (clean.includes("đỏ mận") || clean.includes("do man") || clean.includes("rượu") || clean.includes("ruou")) return "#5B1E31";
  if (clean.includes("hồng đất") || clean.includes("hong dat")) return "#B86B77";
  if (clean.includes("hồng phấn") || clean.includes("hong phan")) return "#FFC0CB";
  if (clean.includes("hồng pastel") || clean.includes("hong pastel")) return "#F9D5DC";
  if (clean.includes("cánh sen") || clean.includes("canh sen")) return "#D81B60";
  if (clean.includes("hồng") || clean.includes("hong") || clean.includes("pink")) return "#F2A6B3";
  if (clean.includes("đỏ") || clean.includes("do") || clean.includes("red")) return "#C92A2A";

  // Xanh dương & Tối
  if (clean.includes("xanh tím than") || clean.includes("xanh tim than")) return "#232B3E";
  if (clean.includes("tím than") || clean.includes("tim than")) return "#3B234A";
  if (clean.includes("xanh đen") || clean.includes("xanh den")) return "#0F172A";
  if (clean.includes("navy")) return "#1B365D";
  if (clean.includes("coban") || clean.includes("cobalt")) return "#0047AB";
  if (clean.includes("da trời") || clean.includes("da troi") || clean.includes("baby")) return "#6BA4FF";

  // Xanh lá & Rêu
  if (clean.includes("xanh bơ") || clean.includes("xanh bo")) return "#9DB672";
  if (clean.includes("xanh mint") || clean.includes("mint")) return "#8FE3D4";
  if (clean.includes("xanh ngọc") || clean.includes("ngoc")) return "#20B2AA";
  if (clean.includes("rêu") || clean.includes("reu") || clean.includes("oliu")) return "#4A5D4E";
  if (clean.includes("lá") || clean.includes("la")) return "#198754";
  if (clean.includes("xanh") || clean.includes("blue")) return "#2563EB";

  // Nâu
  if (clean.includes("nâu tây") || clean.includes("nau tay")) return "#A67B5B";
  if (clean.includes("nâu bò") || clean.includes("nau bo")) return "#C17737";
  if (clean.includes("socola") || clean.includes("chocolate")) return "#382216";
  if (clean.includes("nâu") || clean.includes("nau") || clean.includes("brown")) return "#6F4E37";

  // Cam
  if (clean.includes("cam cháy") || clean.includes("cam chay")) return "#BF4611";
  if (clean.includes("cam đất") || clean.includes("cam dat")) return "#CF6943";
  if (clean.includes("san hô") || clean.includes("san ho")) return "#FF7F66";
  if (clean.includes("cam")) return "#FD7E14";

  // Vàng
  if (clean.includes("chanh")) return "#F4E04D";
  if (clean.includes("mù tạt") || clean.includes("mu tat")) return "#E1AD01";
  if (clean.includes("vàng") || clean.includes("vang")) return "#F5C542";

  // Trắng & Đen & Xám
  if (clean.includes("trắng sữa") || clean.includes("trang sua")) return "#F5F5F0";
  if (clean.includes("trắng") || clean.includes("trang") || clean.includes("white")) return "#FFFFFF";
  if (clean.includes("đen") || clean.includes("den") || clean.includes("black")) return "#111111";
  if (clean.includes("xám đậm") || clean.includes("xam dam")) return "#374151";
  if (clean.includes("xám nhạt") || clean.includes("xam nhat")) return "#E5E7EB";
  if (clean.includes("xám") || clean.includes("xam") || clean.includes("ghi")) return "#9CA3AF";
  if (clean.includes("tím") || clean.includes("tim")) return "#7952B3";

  return "#8C8C8C";
}

export function isLightColor(hex?: string | null): boolean {
  if (!hex || hex === "transparent") return false;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  // Perceived luminance formula (ITU-R BT.601)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 165;
}

export function isColorAttribute(attributeName?: string | null): boolean {
  if (!attributeName) return false;
  const lower = attributeName.trim().toLowerCase();
  return lower.includes("màu") || lower.includes("color");
}
