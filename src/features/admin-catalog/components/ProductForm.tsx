"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  KeyboardEvent,
  DragEvent,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import {
  UploadCloud,
  Plus,
  Trash2,
  Save,
  X,
  Check,
  Settings,
  Boxes,
  PackagePlus,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { BackButton } from "@/shared/ui/back-button";
import { cn } from "@/shared/utils/utils";
import { formatPrice } from "@/shared/utils/format";
import { Badge } from "@/shared/ui/badge";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Switch } from "@/shared/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch, FieldErrors } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  ProductSchema,
  TProductOption,
  TProductPayload,
  TProductVariant,
} from "../schemas/product.schema";
import { getFashionColorHex, isColorAttribute } from "@/shared/utils/color";
import { isSizeAttribute, getSizeSortOrder } from "@/shared/utils/size";
import { toAsciiSkuToken } from "@/shared/utils/validation";
import {
  AdminCategory,
  IOptionSuggestions,
  RawProductResponseDto,
  getCategoryFullPath,
} from "../types/catalog.admin";
import { apiFetch } from "@/shared/lib/api";
import { ImageReorderGrid } from "./ImageReorderGrid";

const RichTextEditor = dynamic(
  () =>
    import("@/shared/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] w-full animate-pulse bg-muted rounded-md flex items-center justify-center text-muted-foreground text-sm">
        Đang tải bộ soạn thảo...
      </div>
    ),
  }
);

interface ProductFormProps {
  productId?: string;
  mode?: "create" | "edit";
}

const GENERAL_UPLOAD_KEY = "__general__";

function sanitizeSkuInput(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "D")
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 25);
}

function buildOptionValueSkuMap(values: string[]): Record<string, string> {
  const shortCodes: Record<string, string> = {};
  const counts: Record<string, number> = {};

  for (const val of values) {
    const token = toAsciiSkuToken(val);
    const words = token.split("-").filter(Boolean);
    let code = "";
    if (words.length === 0) {
      code = "OPT";
    } else if (words.length === 1) {
      code = words[0].slice(0, 5);
    } else {
      code = words.map((w) => w[0] || "").join("");
    }
    shortCodes[val] = code;
    counts[code] = (counts[code] || 0) + 1;
  }

  const finalMap: Record<string, string> = {};
  const usedFinal = new Set<string>();

  for (const val of values) {
    let candidate = shortCodes[val];
    if (counts[candidate] > 1) {
      const words = toAsciiSkuToken(val).split("-").filter(Boolean);
      if (words.length > 1) {
        candidate =
          words[0][0] +
          words
            .slice(1)
            .map((w) => w.slice(0, 3))
            .join("");
      } else if (words.length === 1) {
        candidate = words[0].slice(0, 6);
      }
    }
    let uniqueCandidate = candidate || "V";
    let suffix = 2;
    while (usedFinal.has(uniqueCandidate)) {
      uniqueCandidate = `${candidate}${suffix}`;
      suffix++;
    }
    usedFinal.add(uniqueCandidate);
    finalMap[val] = uniqueCandidate;
  }

  return finalMap;
}

function buildVariantCombinations(
  options: TProductOption[],
  existingVariants: TProductVariant[],
  basePrice: number,
  skuPrefix: string
): TProductVariant[] {
  // If user has a Color attribute group present on screen with 0 values chosen yet,
  // wait until at least 1 color is picked (unless they remove the Color group).
  const hasEmptyColorGroup = options.some(
    (opt) => isColorAttribute(opt.name) && (!opt.values || opt.values.length === 0)
  );
  if (hasEmptyColorGroup) {
    return [];
  }

  const validOptions = options
    .map((opt) => {
      if (isSizeAttribute(opt.name)) {
        return {
          ...opt,
          values: [...(opt.values || [])].sort(
            (a, b) => getSizeSortOrder(a) - getSizeSortOrder(b)
          ),
        };
      }
      return opt;
    })
    .filter((opt) => opt.name?.trim() && opt.values && opt.values.length > 0);

  if (validOptions.length === 0) return [];

  const codeMapsByOptName: Record<string, Record<string, string>> = {};
  for (const opt of validOptions) {
    codeMapsByOptName[opt.name] = buildOptionValueSkuMap(opt.values);
  }

  let combinations: Record<string, string>[] = [{}];
  for (const opt of validOptions) {
    const nextCombinations: Record<string, string>[] = [];
    for (const combo of combinations) {
      for (const val of opt.values) {
        nextCombinations.push({ ...combo, [opt.name]: val });
      }
    }
    combinations = nextCombinations;
  }

  const cleanPrefix = toAsciiSkuToken(skuPrefix) || "LX-10001";
  const usedSkus = new Set<string>();

  return combinations.map((combo, i) => {
    const matched = existingVariants.find((ev) => {
      const evOpts = ev.options || {};
      const comboEntries = Object.entries(combo);
      return (
        Object.keys(evOpts).length === comboEntries.length &&
        comboEntries.every(
          ([k, v]) => (evOpts[k] || "").toLowerCase() === (v || "").toLowerCase()
        )
      );
    });

    const suffixParts = Object.entries(combo)
      .map(([optName, optVal]) => codeMapsByOptName[optName]?.[optVal] || toAsciiSkuToken(optVal))
      .filter(Boolean);
    const suffix = suffixParts.join("-") || String(i + 1);
    const autoSku = `${cleanPrefix}-${suffix}`.slice(0, 40);

    const existingCleaned = matched?.sku ? toAsciiSkuToken(matched.sku) : "";
    let resolvedSku = existingCleaned || autoSku;
    if (usedSkus.has(resolvedSku)) {
      resolvedSku = `${autoSku}-${i + 1}`.slice(0, 40);
    }
    usedSkus.add(resolvedSku);

    const resolvedPrice =
      matched?.price && matched.price > 0 ? matched.price : basePrice;

    return {
      id: matched?.id,
      sku: resolvedSku,
      price: resolvedPrice,
      costPrice: matched?.costPrice,
      stock: matched?.stock ?? 0,
      options: combo,
      image: matched?.image,
    };
  });
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function ProductForm({ productId, mode = "create" }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);
  const loadingInitial =
    mode === "edit" && Boolean(productId) && loadedProductId !== productId;

  const [autoSkuFallback] = useState(
    () => `LX-${10000 + Math.floor(Math.random() * 90000)}`
  );
  const prevBasePriceRef = useRef<number>(0);
  const prevSkuPrefixRef = useRef<string>(autoSkuFallback);

  const [showCareEditor, setShowCareEditor] = useState(false);
  const [uploadingTargets, setUploadingTargets] = useState<Record<string, boolean>>({});
  const [dragActiveTarget, setDragActiveTarget] = useState<string | null>(null);
  const [generalUrlInput, setGeneralUrlInput] = useState("");
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({});
  const [batchPrice, setBatchPrice] = useState("");
  const [batchStock, setBatchStock] = useState("");

  const [createdProductPrompt, setCreatedProductPrompt] = useState<{
    id: string | number;
    name: string;
  } | null>(null);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [suggestions, setSuggestions] = useState<IOptionSuggestions>({
    names: ["Màu sắc", "Kích thước"],
    values: {
      "Màu sắc": ["Đen", "Trắng", "Kem Be", "Đỏ đô", "Xanh Navy"],
      "Kích thước": ["S", "M", "L", "XL"],
    },
  });

  const form = useForm<TProductPayload>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercent: 0,
      isNew: true,
      isBestSeller: false,
      sku: "",
      stock: 0,
      category: "",
      brand: "LUXE",
      material: "",
      careInstructions: "",
      images: [],
      colorImages: {},
      status: "published",
      options:
        mode === "create"
          ? [
              { name: "Màu sắc", values: [] },
              { name: "Kích thước", values: ["S", "M", "L"] },
            ]
          : [],
      variants: [],
    },
  });

  useEffect(() => {
    Promise.all([
      apiFetch<AdminCategory[]>("/admin/categories").catch(() => []),
      apiFetch<IOptionSuggestions>("/admin/options/suggestions").catch(() => null),
    ]).then(([cats, sugg]) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
        if (mode === "create" && !form.getValues("category")) {
          form.setValue("category", cats[0].slug);
        }
      }
      if (sugg && sugg.names?.length) {
        setSuggestions(sugg);
      }
    });
  }, [mode, form]);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    let active = true;
    apiFetch<RawProductResponseDto>(`/admin/products/${productId}`)
      .then((prod) => {
        if (!active) return;

        const resolvedColorImages: Record<string, string[]> = {};
        if (prod.colorImages && Object.keys(prod.colorImages).length > 0) {
          Object.assign(resolvedColorImages, prod.colorImages);
        }
        if (prod.productColors && Array.isArray(prod.productColors)) {
          prod.productColors.forEach((pc) => {
            if (pc.isActive === false) return;
            const cName = pc.color?.name;
            if (cName && pc.images && pc.images.length > 0) {
              if (
                !resolvedColorImages[cName] ||
                resolvedColorImages[cName].length === 0
              ) {
                resolvedColorImages[cName] = pc.images.map((img) => img.imageUrl);
              }
            }
          });
        }

        const primaryCover =
          prod.images?.[0] ||
          Object.values(resolvedColorImages)[0]?.[0] ||
          "";

        if (prod.careInstructions && prod.careInstructions.trim().length > 0) {
          setShowCareEditor(true);
        }

        const loadedPrice = Number(prod.basePrice || 0);
        const loadedSku = prod.sku || "";
        prevBasePriceRef.current = loadedPrice;
        prevSkuPrefixRef.current = toAsciiSkuToken(loadedSku) || autoSkuFallback;

        form.reset({
          name: prod.name || "",
          description: prod.description || "",
          price: loadedPrice,
          discountPercent: prod.discountPercent ?? 0,
          isNew: prod.isNew ?? true,
          isBestSeller: prod.isBestSeller ?? false,
          sku: loadedSku,
          stock: prod.totalStock ?? 0,
          category: prod.category?.slug || "",
          brand: prod.brand || "LUXE",
          material: prod.material || "",
          careInstructions: prod.careInstructions || "",
          images: primaryCover ? [primaryCover] : [],
          colorImages: resolvedColorImages,
          status: prod.isActive ? "published" : "draft",
          options: prod.options || [],
          variants: (prod.adminVariants || []).map((v) => ({
            id: v.id,
            sku: toAsciiSkuToken(v.sku) || v.sku,
            price: Number(v.price || prod.basePrice || 0),
            costPrice:
              v.costPrice !== undefined ? Number(v.costPrice) : undefined,
            stock: v.stock ?? 0,
            options: v.options || {},
            image: v.image,
          })),
        });
      })
      .catch(() => {
        if (active) {
          toast.error("Không tìm thấy sản phẩm cần chỉnh sửa!");
        }
      })
      .finally(() => {
        if (active) setLoadedProductId(productId);
      });
    return () => {
      active = false;
    };
  }, [mode, productId, form, autoSkuFallback]);

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
    replace: replaceOptions,
  } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const {
    fields: variantFields,
    replace: replaceVariants,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const watchedName = useWatch({ control: form.control, name: "name" }) || "";
  const watchedCategory = useWatch({ control: form.control, name: "category" }) || "";
  const watchedImages = useWatch({ control: form.control, name: "images" });
  const currentImages = watchedImages || [];
  const watchedOptions = useWatch({ control: form.control, name: "options" });
  const watchedVariants = useWatch({ control: form.control, name: "variants" });
  const watchedPrice = useWatch({ control: form.control, name: "price" }) || 0;
  const watchedSku = useWatch({ control: form.control, name: "sku" }) || "";
  const watchedDiscount =
    useWatch({ control: form.control, name: "discountPercent" }) || 0;
  const watchedCare = useWatch({ control: form.control, name: "careInstructions" }) || "";
  const watchedColorImages =
    (useWatch({
      control: form.control,
      name: "colorImages",
    }) as Record<string, string[]>) || {};

  const getEffectivePrefix = (rawSku?: string) => {
    const clean = toAsciiSkuToken(rawSku ?? form.getValues("sku") ?? "");
    return clean || autoSkuFallback;
  };

  // Auto-sync variants whenever options change, keeping existing prices/SKUs/stocks intact
  const syncVariantsFromOptions = (
    nextOptions: TProductOption[],
    forceRebuildSkus = false
  ) => {
    const basePrice = form.getValues("price") || 0;
    const skuPrefix = getEffectivePrefix();
    const existingVariants = forceRebuildSkus
      ? (form.getValues("variants") || []).map((v) => ({ ...v, sku: "" }))
      : form.getValues("variants") || [];
    const synced = buildVariantCombinations(
      nextOptions,
      existingVariants,
      basePrice,
      skuPrefix
    );
    replaceVariants(synced);
  };

  const uploadImageFiles = async (files: FileList | File[], targetKey: string) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP...).");
      return;
    }

    setUploadingTargets((prev) => ({ ...prev, [targetKey]: true }));
    try {
      const formData = new FormData();
      for (const file of imageFiles) {
        formData.append("file", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải ảnh lên");
      }

      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        if (targetKey === GENERAL_UPLOAD_KEY) {
          const prev = form.getValues("images") || [];
          form.setValue("images", Array.from(new Set([...prev, ...newUrls])), {
            shouldDirty: true,
          });
          toast.success(`Đã tải lên ${newUrls.length} ảnh sản phẩm`);
        } else {
          const currentMap = form.getValues("colorImages") || {};
          const prevImgs = currentMap[targetKey] || [];
          form.setValue(
            "colorImages",
            {
              ...currentMap,
              [targetKey]: Array.from(new Set([...prevImgs, ...newUrls])),
            },
            { shouldDirty: true }
          );
          toast.success(`Đã tải lên ${newUrls.length} ảnh cho màu ${targetKey}`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tải ảnh thất bại";
      toast.error(message);
    } finally {
      setUploadingTargets((prev) => ({ ...prev, [targetKey]: false }));
    }
  };

  const handleFileInputChange = async (
    targetKey: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadImageFiles(files, targetKey);
    e.target.value = "";
  };

  const handleDropFiles = async (targetKey: string, e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTarget(null);
    if (uploadingTargets[targetKey]) return;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await uploadImageFiles(files, targetKey);
    }
  };

  const handleAddGeneralImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const prev = form.getValues("images") || [];
    if (!prev.includes(trimmed)) {
      form.setValue("images", [...prev, trimmed], { shouldDirty: true });
      toast.success("Đã thêm ảnh sản phẩm");
    }
    setGeneralUrlInput("");
  };

  const handleRemoveGeneralImage = (url: string) => {
    const prev = form.getValues("images") || [];
    form.setValue(
      "images",
      prev.filter((i) => i !== url),
      { shouldDirty: true }
    );
  };

  const handleReorderGeneralImages = (newImages: string[]) => {
    form.setValue("images", newImages, { shouldDirty: true });
  };

  const handleAddColorImage = (colorName: string, imgUrl: string) => {
    const trimmed = imgUrl.trim();
    if (!trimmed) return;
    const currentMap = form.getValues("colorImages") || {};
    const prevImgs = currentMap[colorName] || [];
    if (!prevImgs.includes(trimmed)) {
      form.setValue(
        "colorImages",
        {
          ...currentMap,
          [colorName]: [...prevImgs, trimmed],
        },
        { shouldDirty: true }
      );
      toast.success(`Đã thêm ảnh cho màu ${colorName}`);
    }
    setColorUrlInputs((prev) => ({ ...prev, [colorName]: "" }));
  };

  const handleRemoveColorImage = (colorName: string, imgUrl: string) => {
    const currentMap = form.getValues("colorImages") || {};
    const prevImgs = currentMap[colorName] || [];
    form.setValue(
      "colorImages",
      {
        ...currentMap,
        [colorName]: prevImgs.filter((i) => i !== imgUrl),
      },
      { shouldDirty: true }
    );
  };

  const handleReorderColorImages = (colorName: string, newImages: string[]) => {
    const currentMap = form.getValues("colorImages") || {};
    form.setValue(
      "colorImages",
      {
        ...currentMap,
        [colorName]: newImages,
      },
      { shouldDirty: true }
    );
  };

  const applyBatchPrice = (customValue?: number) => {
    const p = customValue !== undefined ? customValue : Number(batchPrice);
    if (isNaN(p) || p <= 0) {
      toast.error("Vui lòng nhập giá bán lớn hơn 0");
      return;
    }
    const current = form.getValues("variants") || [];
    if (current.length === 0) {
      toast.error("Chưa có biến thể nào để áp dụng");
      return;
    }
    const updated = current.map((v) => ({ ...v, price: Math.round(p) }));
    replaceVariants(updated);
    toast.success(
      `Đã áp dụng giá ${formatPrice(Math.round(p))} cho tất cả ${current.length} biến thể`
    );
    if (customValue === undefined) setBatchPrice("");
  };

  const applyBatchStock = () => {
    const qty = Math.round(Number(batchStock));
    if (isNaN(qty) || qty < 0 || qty > 10000) {
      toast.error("Số lượng tồn kho phải từ 0 đến 10.000");
      return;
    }
    const current = form.getValues("variants") || [];
    if (current.length === 0) {
      toast.error("Chưa có biến thể nào để áp dụng");
      return;
    }
    const updated = current.map((v) => ({ ...v, stock: qty }));
    replaceVariants(updated);
    toast.success(
      `Đã đặt tồn kho đầu kỳ ${qty} SP cho tất cả ${current.length} biến thể`
    );
    setBatchStock("");
  };

  const setDefaultColor = (colorName: string) => {
    const currentOpts = form.getValues("options") || [];
    const colorOptIndex = currentOpts.findIndex((opt) =>
      isColorAttribute(opt.name)
    );
    if (colorOptIndex !== -1) {
      const vals = currentOpts[colorOptIndex].values || [];
      if (vals.includes(colorName)) {
        const reordered = [colorName, ...vals.filter((v) => v !== colorName)];
        const updatedOpts = [...currentOpts];
        updatedOpts[colorOptIndex] = {
          ...updatedOpts[colorOptIndex],
          values: reordered,
        };
        replaceOptions(updatedOpts);
        syncVariantsFromOptions(updatedOpts);
        toast.success(`Đã đặt "${colorName}" làm màu mặc định`);
      }
    }
  };

  const handleManualSyncVariants = () => {
    const currentOptions = form.getValues("options") || [];
    const hasValid = currentOptions.some(
      (opt) => opt.name?.trim() && opt.values && opt.values.length > 0
    );
    if (!hasValid) {
      toast.error("Vui lòng chọn ít nhất 1 màu sắc hoặc kích cỡ trước.");
      scrollToSection("section-options");
      return;
    }
    syncVariantsFromOptions(currentOptions, true);
    const count = (form.getValues("variants") || []).length;
    toast.success(`Đã làm mới mã SKU và đồng bộ ${count} biến thể`);
  };

  const applyFashionPreset = () => {
    const existingOpts = form.getValues("options") || [];
    const existingColor = existingOpts.find((o) => isColorAttribute(o.name));
    const existingSize = existingOpts.find((o) => isSizeAttribute(o.name));

    const defaultOptions: TProductOption[] = [
      { name: "Màu sắc", values: existingColor?.values || [] },
      {
        name: "Kích thước",
        values:
          existingSize?.values && existingSize.values.length > 0
            ? existingSize.values
            : ["S", "M", "L"],
      },
    ];
    replaceOptions(defaultOptions);
    syncVariantsFromOptions(defaultOptions);
    toast.success(
      "Đã khởi tạo nhóm Màu sắc & Kích thước (S, M, L). Bấm chọn màu để tạo biến thể!"
    );
  };

  const handleQuickAddPresetOption = (name: string) => {
    const currentOpts = form.getValues("options") || [];
    const exists = currentOpts.some(
      (opt) => opt.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast.info(`Đã có nhóm "${name}" rồi`);
      return;
    }
    appendOption({ name, values: [] });
  };

  const handleQuickSetName = (index: number, name: string) => {
    const currentOpts = [...(form.getValues("options") || [])];
    const currentOpt = currentOpts[index];
    const updatedOpt = { name, values: currentOpt?.values || [] };
    updateOption(index, updatedOpt);
    currentOpts[index] = updatedOpt;
    syncVariantsFromOptions(currentOpts, true);
  };

  const handleQuickAddValue = (index: number, rawVal: string) => {
    const val = rawVal.trim();
    if (!val) return;
    const currentOpts = [...(form.getValues("options") || [])];
    const currentOpt = currentOpts[index];
    if (!currentOpt) return;
    const currentValues = currentOpt.values || [];

    if (!currentValues.some((v) => v.toLowerCase() === val.toLowerCase())) {
      // Preserve general images if user uploaded photos before choosing the very first color
      if (isColorAttribute(currentOpt.name) && currentValues.length === 0) {
        const generalImgs = (form.getValues("images") || []).filter(Boolean);
        const existingColorMap = form.getValues("colorImages") || {};
        if (
          generalImgs.length > 0 &&
          (!existingColorMap[val] || existingColorMap[val].length === 0)
        ) {
          form.setValue(
            "colorImages",
            { ...existingColorMap, [val]: generalImgs },
            { shouldDirty: true }
          );
          form.setValue("images", [], { shouldDirty: true });
          toast.info(`Đã tự động gán ${generalImgs.length} ảnh vừa tải cho màu ${val}`);
        }
      }

      const nextValues = [...currentValues, val];
      if (isSizeAttribute(currentOpt.name)) {
        nextValues.sort((a, b) => getSizeSortOrder(a) - getSizeSortOrder(b));
      }
      const updatedOpt = { name: currentOpt.name || "", values: nextValues };
      updateOption(index, updatedOpt);
      currentOpts[index] = updatedOpt;
      syncVariantsFromOptions(currentOpts);
    }
  };

  const handleAddOptionValue = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (!val) return;
      handleQuickAddValue(index, val);
      e.currentTarget.value = "";
    }
  };

  const handleRemoveOptionValue = (optIndex: number, valToRemove: string) => {
    const currentOpts = [...(form.getValues("options") || [])];
    const currentOpt = currentOpts[optIndex];
    if (!currentOpt) return;
    const optName = currentOpt.name || "";
    const nextValues = (currentOpt.values || []).filter((v) => v !== valToRemove);

    const updatedOpt = { name: optName, values: nextValues };
    updateOption(optIndex, updatedOpt);
    currentOpts[optIndex] = updatedOpt;
    syncVariantsFromOptions(currentOpts);

    if (isColorAttribute(optName)) {
      const currentMap = form.getValues("colorImages") || {};
      if (currentMap[valToRemove]) {
        const nextMap = { ...currentMap };
        delete nextMap[valToRemove];
        form.setValue("colorImages", nextMap, { shouldDirty: true });
      }
    }
  };

  const handleRemoveOption = (index: number) => {
    const currentOpts = [...(form.getValues("options") || [])];
    const optName = currentOpts[index]?.name || "";
    removeOption(index);
    const nextOpts = currentOpts.filter((_, idx) => idx !== index);
    syncVariantsFromOptions(nextOpts);

    if (isColorAttribute(optName)) {
      form.setValue("colorImages", {}, { shouldDirty: true });
    }
  };

  const onInvalid = (errors: FieldErrors<TProductPayload>) => {
    if (errors.name?.message) {
      toast.error(String(errors.name.message));
      scrollToSection("section-basic");
      return;
    }
    if (
      errors.price?.message ||
      errors.discountPercent?.message ||
      errors.sku?.message
    ) {
      toast.error(
        String(
          errors.price?.message ||
            errors.discountPercent?.message ||
            errors.sku?.message
        )
      );
      scrollToSection("section-pricing");
      return;
    }
    if (errors.category?.message) {
      toast.error(String(errors.category.message));
      scrollToSection("section-classification");
      return;
    }
    if (errors.options) {
      toast.error("Vui lòng kiểm tra lại tên thuộc tính phân loại.");
      scrollToSection("section-options");
      return;
    }
    if (errors.variants) {
      toast.error("Vui lòng kiểm tra các dòng báo đỏ trong Danh sách biến thể.");
      scrollToSection("section-variants-table");
      return;
    }
    toast.error("Vui lòng kiểm tra lại các thông tin bắt buộc còn thiếu.");
  };

  function onSubmit(
    values: TProductPayload,
    status: "draft" | "published" = "published"
  ) {
    const cleanedOptions = (values.options || []).filter(
      (opt) => opt.name?.trim() && opt.values && opt.values.length > 0
    );
    const colorOption = cleanedOptions.find((opt) => isColorAttribute(opt.name));
    const activeColorValues = (colorOption?.values || []).filter(Boolean);

    if (status === "published") {
      if (!values.price || values.price < 1000) {
        form.setError("price", {
          message: "Giá niêm yết tối thiểu 1.000đ khi đăng bán",
        });
        toast.error("Vui lòng nhập giá niêm yết tối thiểu 1.000đ (hoặc bấm Lưu nháp).");
        scrollToSection("section-pricing");
        return;
      }

      const variants = values.variants || [];
      if (variants.length === 0) {
        toast.error(
          "Vui lòng chọn ít nhất 1 màu sắc/kích cỡ để tạo biến thể trước khi đăng bán (hoặc bấm Lưu nháp)."
        );
        scrollToSection("section-options");
        return;
      }

      if (activeColorValues.length > 0) {
        const missingColors = activeColorValues.filter((cName) => {
          const imgs = values.colorImages?.[cName] || [];
          return imgs.filter(Boolean).length === 0;
        });
        if (missingColors.length > 0) {
          toast.error(
            `Màu ${missingColors.join(", ")} chưa có ảnh. Vui lòng tải ít nhất 1 ảnh cho từng màu (hoặc bấm Lưu nháp).`
          );
          scrollToSection("section-media");
          return;
        }
      } else {
        const baseImgs = (values.images || []).filter(Boolean);
        if (baseImgs.length === 0) {
          toast.error(
            "Vui lòng tải lên ít nhất 1 ảnh sản phẩm trước khi đăng bán (hoặc bấm Lưu nháp)."
          );
          scrollToSection("section-media");
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        let finalImages = (values.images || []).filter(Boolean);
        let normalizedColorImages = values.colorImages || {};

        if (activeColorValues.length > 0) {
          const nextMap: Record<string, string[]> = {};
          for (const cName of activeColorValues) {
            nextMap[cName] = (values.colorImages?.[cName] || []).filter(Boolean);
          }
          normalizedColorImages = nextMap;
          finalImages = [];
        }

        const effectiveRootSku = getEffectivePrefix(values.sku);
        const normalizedVariants = (values.variants || []).map((v) => ({
          ...v,
          sku: toAsciiSkuToken(v.sku) || v.sku,
          price: v.price > 0 ? v.price : values.price,
          stock: Math.max(0, Math.round(Number(v.stock) || 0)),
        }));

        const totalInitialStock = normalizedVariants.reduce(
          (sum, v) => sum + (v.stock || 0),
          0
        );

        const payload = {
          ...values,
          sku: effectiveRootSku,
          options: cleanedOptions,
          variants: normalizedVariants,
          images: finalImages,
          colorImages: normalizedColorImages,
          status,
        };

        if (mode === "create") {
          const created = await apiFetch<{
            id?: number | string;
            name?: string;
            totalStock?: number;
          }>("/admin/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          if (status === "published" && created?.id && totalInitialStock === 0) {
            toast.success("Đã tạo sản phẩm mới thành công");
            setCreatedProductPrompt({
              id: created.id,
              name: created.name || values.name,
            });
          } else {
            toast.success(
              status === "draft"
                ? "Đã lưu nháp sản phẩm thành công"
                : totalInitialStock > 0
                ? `Đã đăng bán sản phẩm & nhập kho đầu kỳ (${totalInitialStock} SP)!`
                : "Đã thêm sản phẩm mới thành công"
            );
            router.push("/admin/products");
          }
        } else {
          await apiFetch(`/admin/products/${productId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success(
            status === "published"
              ? "Đã cập nhật sản phẩm thành công"
              : "Đã cập nhật bản nháp"
          );
          router.push("/admin/products");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Lỗi kết nối đến máy chủ!"
        );
      }
    });
  }

  const onDraft = () => {
    form.setValue("status", "draft");
    form.handleSubmit((values) => onSubmit(values, "draft"), onInvalid)();
  };

  const onPublishSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    form.setValue("status", "published");
    form.handleSubmit((values) => onSubmit(values, "published"), onInvalid)(e);
  };

  // Derived states for Checklist & Media Gallery
  const colorOption = (watchedOptions || []).find((opt) =>
    isColorAttribute(opt.name)
  );
  const activeColorValues = (colorOption?.values || []).filter(Boolean);

  const hasBasicAndPrice =
    watchedName.trim().length >= 2 && Number(watchedPrice) >= 1000;
  const hasCategory = Boolean(watchedCategory);
  const hasAllImages =
    activeColorValues.length > 0
      ? activeColorValues.every(
          (cName) => (watchedColorImages?.[cName] || []).filter(Boolean).length > 0
        )
      : currentImages.filter(Boolean).length > 0;
  const hasVariants = variantFields.length > 0;

  const checklistItems = [
    {
      label: "Thông tin & Giá bán",
      done: hasBasicAndPrice,
      target: watchedName.trim().length < 2 ? "section-basic" : "section-pricing",
      hint:
        watchedName.trim().length < 2
          ? "Chưa nhập tên"
          : Number(watchedPrice) < 1000
          ? "Chưa nhập giá"
          : formatPrice(Number(watchedPrice)),
    },
    {
      label: "Danh mục sản phẩm",
      done: hasCategory,
      target: "section-classification",
      hint: hasCategory ? "Đã chọn" : "Chưa chọn",
    },
    {
      label: "Màu sắc & Hình ảnh",
      done: hasAllImages,
      target: activeColorValues.length === 0 && Boolean(colorOption) ? "section-options" : "section-media",
      hint:
        activeColorValues.length > 0
          ? `${
              activeColorValues.filter(
                (c) => (watchedColorImages?.[c] || []).filter(Boolean).length > 0
              ).length
            }/${activeColorValues.length} màu có ảnh`
          : `${currentImages.length} ảnh`,
    },
    {
      label: "Danh sách Biến thể",
      done: hasVariants,
      target: hasVariants ? "section-variants-table" : "section-options",
      hint: `${variantFields.length} biến thể`,
    },
  ];

  const completedChecklistCount = checklistItems.filter((i) => i.done).length;
  const isAnyUploading = Object.values(uploadingTargets).some(Boolean);
  const previewRootSku = toAsciiSkuToken(watchedSku) || autoSkuFallback;

  if (loadingInitial) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onPublishSubmit}
        className="flex flex-col gap-6 w-full pb-12"
      >
        {/* Sticky Top Action Bar */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <BackButton />
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">
                  {mode === "edit" ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground truncate">
                  {mode === "edit"
                    ? "Cập nhật thông tin, hình ảnh theo màu và bảng biến thể."
                    : "Điền Tên & Giá → Chọn Màu & Size → Tải ảnh theo màu → Nhập tồn kho & Đăng bán."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/admin/products"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "hidden sm:inline-flex"
                )}
              >
                Hủy bỏ
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={onDraft}
                disabled={isPending || isAnyUploading}
              >
                Lưu nháp
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 flex-1 sm:flex-none"
                disabled={isPending || isAnyUploading}
              >
                <Save className="h-4 w-4" />
                {isPending
                  ? "Đang lưu..."
                  : mode === "create"
                  ? "Đăng bán sản phẩm"
                  : "Lưu & Cập nhật"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Single-Page Layout */}
        <div className="max-w-6xl mx-auto w-full grid gap-5 sm:gap-6 xl:grid-cols-12 items-start">
          {/* LEFT COLUMN (2/3 on Desktop) */}
          <div className="xl:col-span-8 flex flex-col gap-5 sm:gap-6 min-w-0">
            {/* THÔNG TIN CƠ BẢN */}
            <Card id="section-basic" className="scroll-mt-40 sm:scroll-mt-36">
              <CardHeader>
                <CardTitle>Thông tin sản phẩm</CardTitle>
                <CardDescription>
                  Tên hiển thị và mô tả chi tiết cho sản phẩm.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          maxLength={100}
                          placeholder="VD: Đầm A xếp ly Rose Cobalt..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết (Tab Giới thiệu)</FormLabel>
                      <FormControl>
                        <div className="rounded-md border flex flex-col bg-card">
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Mô tả phom dáng, chất liệu, điểm nhấn thiết kế..."
                            editorClassName="min-h-[220px] border-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Collapsible Care Instructions */}
                <div className="rounded-md border bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setShowCareEditor((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-muted/40 transition-colors rounded-md cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        Hướng dẫn bảo quản (Tab Bảo quản)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {watchedCare && watchedCare.replace(/<[^>]*>/g, "").trim().length > 0
                          ? "· Đã tùy chỉnh riêng"
                          : "· Đang dùng mặc định thương hiệu"}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      {showCareEditor ? (
                        <>
                          Thu gọn <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Tùy chỉnh <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </span>
                  </button>

                  {showCareEditor && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t">
                      <FormField
                        control={form.control}
                        name="careInstructions"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <div className="rounded-md border flex flex-col bg-card">
                                <RichTextEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Nhập lưu ý giặt ủi riêng cho chất liệu sản phẩm này..."
                                  editorClassName="min-h-[150px] border-none"
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Nếu để trống, hệ thống tự hiển thị hướng dẫn bảo quản tiêu chuẩn của LUXE.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GIÁ BÁN & MÃ THIẾT KẾ (SKU) */}
            <Card id="section-pricing" className="scroll-mt-40 sm:scroll-mt-36">
              <CardHeader>
                <CardTitle>
                  {mode === "edit" ? "Giá bán, Mã SKU & Tồn kho" : "Giá bán & Mã sản phẩm (SKU)"}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá niêm yết (VNĐ){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100000000}
                          placeholder="VD: 1432000"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const nextPrice =
                              raw === "" ? 0 : Math.max(0, Math.round(Number(raw)));
                            const prevPrice = prevBasePriceRef.current;
                            prevBasePriceRef.current = nextPrice;
                            field.onChange(nextPrice);

                            // Auto-sync price to variants that still hold 0 or previous basePrice
                            const currentVars = form.getValues("variants") || [];
                            if (currentVars.length > 0 && nextPrice > 0) {
                              let updatedAny = false;
                              const nextVars = currentVars.map((v) => {
                                if (!v.price || v.price === 0 || v.price === prevPrice) {
                                  updatedAny = true;
                                  return { ...v, price: nextPrice };
                                }
                                return v;
                              });
                              if (updatedAny) {
                                replaceVariants(nextVars);
                              }
                            }
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      {watchedPrice > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Hiển thị: <strong className="text-foreground">{formatPrice(Number(watchedPrice))}</strong>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khuyến mãi (% giảm giá)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={90}
                          placeholder="0"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(
                              Math.min(
                                90,
                                Math.max(0, Math.round(Number(e.target.value) || 0))
                              )
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedDiscount > 0 && watchedPrice > 0 && (() => {
                  const effective = Math.round(
                    (watchedPrice * (100 - watchedDiscount)) / 100
                  );
                  return (
                    <div className="col-span-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs text-neutral-700 dark:text-neutral-300 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span>
                          Giá bán sau giảm <b>{watchedDiscount}%</b>:{" "}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(effective)}
                        </span>
                      </div>
                      <span>
                        Tiết kiệm:{" "}
                        <b className="text-foreground">
                          {formatPrice(watchedPrice - effective)}
                        </b>
                      </span>
                    </div>
                  );
                })()}

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className={mode === "create" ? "sm:col-span-2" : ""}>
                      <FormLabel>Mã thiết kế / SKU hiển thị (kiểu IVY moda)</FormLabel>
                      <FormControl>
                        <Input
                          maxLength={25}
                          placeholder={`VD: 41M8939 (bỏ trống sẽ tự lấy ${autoSkuFallback})`}
                          className="font-mono"
                          name={field.name}
                          ref={field.ref}
                          value={field.value || ""}
                          onChange={(e) => {
                            const sanitized = sanitizeSkuInput(e.target.value);
                            field.onChange(sanitized);

                            const nextPrefix = toAsciiSkuToken(sanitized) || autoSkuFallback;
                            const prevPrefix = prevSkuPrefixRef.current;
                            if (nextPrefix !== prevPrefix) {
                              prevSkuPrefixRef.current = nextPrefix;
                              const currentVars = form.getValues("variants") || [];
                              if (currentVars.length > 0) {
                                const updatedVars = currentVars.map((v) => {
                                  if (v.sku && v.sku.startsWith(prevPrefix + "-")) {
                                    return {
                                      ...v,
                                      sku: (
                                        nextPrefix +
                                        "-" +
                                        v.sku.slice(prevPrefix.length + 1)
                                      ).slice(0, 40),
                                    };
                                  }
                                  return v;
                                });
                                replaceVariants(updatedVars);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            const clean = toAsciiSkuToken(e.target.value);
                            if (clean !== e.target.value) {
                              field.onChange(clean);
                            }
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Mã hiển thị cố định ngoài trang sản phẩm:{" "}
                        <strong className="font-mono text-foreground">{previewRootSku}</strong>{" "}
                        (các biến thể kho tự ghép hậu tố không dấu bên dưới).
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === "edit" && (
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => {
                      const totalVarStock = (watchedVariants || []).reduce(
                        (acc, v) => acc + (Number(v.stock) || 0),
                        0
                      );
                      const displayStock =
                        variantFields.length > 0
                          ? totalVarStock
                          : field.value || 0;
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Boxes className="h-4 w-4 text-muted-foreground" />
                              Tổng tồn kho
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-mono"
                            >
                              {displayStock} SP
                            </Badge>
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="number"
                                readOnly
                                disabled
                                value={displayStock}
                                className="bg-muted/50 cursor-not-allowed font-semibold text-foreground"
                              />
                            </FormControl>
                            {productId && (
                              <Link
                                href={`/admin/stock-imports?productId=${productId}`}
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0 transition-colors"
                                title="Mở phiếu nhập kho cho sản phẩm này"
                              >
                                <PackagePlus className="h-4 w-4" />
                                Nhập kho
                              </Link>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* MÀU SẮC, KÍCH CỠ */}
            <Card id="section-options" className="scroll-mt-40 sm:scroll-mt-36">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle>Phân loại (Màu sắc & Kích cỡ)</CardTitle>
                  <CardDescription>
                    Bấm chọn nhanh màu sắc & kích cỡ bên dưới — khung tải ảnh theo màu và mã biến thể không dấu sẽ tự động sinh.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-nowrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    className="whitespace-nowrap"
                    onClick={applyFashionPreset}
                  >
                    Khởi tạo Màu & Size
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="whitespace-nowrap"
                    onClick={() => appendOption({ name: "", values: [] })}
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Thêm nhóm
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {optionFields.length === 0 ? (
                  <div className="text-center py-7 px-4 text-muted-foreground bg-muted/40 rounded-lg border border-dashed space-y-3">
                    <p className="text-sm">
                      Chưa chọn thuộc tính phân loại nào. Chọn nhanh để tạo bảng màu, ảnh và biến thể:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={applyFashionPreset}
                      >
                        Khởi tạo Màu & Size (Size S, M, L)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAddPresetOption("Màu sắc")}
                      >
                        + Thêm Màu sắc
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAddPresetOption("Kích thước")}
                      >
                        + Thêm Kích thước
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {optionFields.map((field, index) => {
                      const currentName = watchedOptions?.[index]?.name || "";
                      const currentValues = watchedOptions?.[index]?.values || [];
                      const isColor = isColorAttribute(currentName);
                      const availableSuggestions = (
                        suggestions.values[currentName] || []
                      ).filter(
                        (sugg) =>
                          !currentValues.some(
                            (cv) => cv.toLowerCase() === sugg.toLowerCase()
                          )
                      );

                      return (
                        <div
                          key={field.id}
                          className="p-4 border rounded-lg bg-card space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Nhóm #{index + 1} {currentName ? `· ${currentName}` : ""}
                            </span>
                            <div className="flex items-center gap-2">
                              <Link
                                href="/admin/attributes"
                                target="_blank"
                                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-muted"
                                title="Mở trang Quản lý bảng màu & kích thước trong tab mới"
                              >
                                <Settings className="h-3 w-3" />
                                Bảng màu & size
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs px-2 h-7 gap-1"
                                onClick={() => handleRemoveOption(index)}
                                type="button"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Xóa nhóm
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-[190px_1fr]">
                            <FormField
                              control={form.control}
                              name={`options.${index}.name`}
                              render={({ field: nameField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Tên thuộc tính</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="VD: Màu sắc"
                                      {...nameField}
                                      onBlur={(e) => {
                                        nameField.onBlur();
                                        const opts = form.getValues("options") || [];
                                        if (e.target.value.trim()) {
                                          syncVariantsFromOptions(opts);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                    {suggestions.names.map((sugg) => (
                                      <Badge
                                        key={sugg}
                                        variant={
                                          currentName.toLowerCase() ===
                                          sugg.toLowerCase()
                                            ? "secondary"
                                            : "outline"
                                        }
                                        className="cursor-pointer text-[11px] py-0.5 px-2 hover:bg-muted font-normal"
                                        onClick={() =>
                                          handleQuickSetName(index, sugg)
                                        }
                                      >
                                        {sugg}
                                      </Badge>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2.5">
                              <Label className="text-xs">
                                Giá trị (bấm nhanh gợi ý bên dưới hoặc tự gõ rồi nhấn Enter)
                              </Label>
                              <Input
                                placeholder={
                                  isColor
                                    ? "VD: Nâu socola, Xanh tím than, Đỏ... rồi nhấn Enter"
                                    : "VD: S, M, L, XL, XXL... rồi nhấn Enter"
                                }
                                onKeyDown={(e) => handleAddOptionValue(index, e)}
                              />

                              {availableSuggestions.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap pt-0.5">
                                  {availableSuggestions.map((sugg: string) => (
                                    <button
                                      key={sugg}
                                      type="button"
                                      onClick={() =>
                                        handleQuickAddValue(index, sugg)
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background hover:bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                      title={`Thêm ${sugg}`}
                                    >
                                      {isColor && (
                                        <span
                                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                          style={{
                                            backgroundColor:
                                              getFashionColorHex(sugg),
                                          }}
                                        />
                                      )}
                                      <span>+ {sugg}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {currentValues.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2.5 bg-muted/40 rounded-md border min-h-[42px]">
                                  {currentValues.map((val, vIdx) => {
                                    const colorHex = isColor
                                      ? getFashionColorHex(val)
                                      : null;
                                    return (
                                      <Badge
                                        key={`${val}-${vIdx}`}
                                        variant="secondary"
                                        className="pl-2.5 pr-1 py-1 flex items-center gap-1.5 font-medium border bg-background"
                                      >
                                        {isColor && (
                                          <span
                                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                            style={{
                                              backgroundColor: colorHex || "#333",
                                            }}
                                          />
                                        )}
                                        <span>{val}</span>
                                        <button
                                          type="button"
                                          className="h-4 w-4 rounded-full hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 text-muted-foreground flex items-center justify-center cursor-pointer ml-0.5 transition-colors"
                                          onClick={() =>
                                            handleRemoveOptionValue(index, val)
                                          }
                                          title={`Bỏ "${val}"`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* HÌNH ẢNH SẢN PHẨM / ẢNH THEO MÀU */}
            <Card id="section-media" className="scroll-mt-40 sm:scroll-mt-36">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  {activeColorValues.length > 0
                    ? "Hình ảnh theo từng Màu sắc"
                    : "Hình ảnh sản phẩm"}
                </CardTitle>
                <CardDescription>
                  {activeColorValues.length > 0
                    ? "Mỗi màu cần ít nhất 1 ảnh riêng khi đăng bán. Ảnh #1 của màu mặc định sẽ làm ảnh đại diện ngoài gian hàng."
                    : Boolean(colorOption)
                    ? "Hãy bấm chọn các Màu sắc của sản phẩm ở khung Phân loại phía trên để hiện ô tải ảnh riêng cho từng màu."
                    : "Kéo thả ảnh từ máy tính hoặc thêm thuộc tính Màu sắc ở trên để tải ảnh riêng cho từng màu."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {activeColorValues.length === 0 ? (
                  <div className="space-y-2.5">
                    {currentImages.length > 0 && (
                      <ImageReorderGrid
                        images={currentImages}
                        onReorder={handleReorderGeneralImages}
                        onRemove={handleRemoveGeneralImage}
                      />
                    )}

                    <label
                      htmlFor="general-image-file-input"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActiveTarget(GENERAL_UPLOAD_KEY);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDragActiveTarget(GENERAL_UPLOAD_KEY);
                      }}
                      onDragLeave={() => setDragActiveTarget(null)}
                      onDrop={(e) => handleDropFiles(GENERAL_UPLOAD_KEY, e)}
                      className={cn(
                        "w-full border border-dashed rounded-md px-4 py-4 flex items-center justify-center gap-2 transition-colors text-xs font-medium",
                        uploadingTargets[GENERAL_UPLOAD_KEY]
                          ? "opacity-60 cursor-wait bg-muted/40"
                          : "cursor-pointer hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                        dragActiveTarget === GENERAL_UPLOAD_KEY &&
                          "border-foreground bg-muted/70 text-foreground"
                      )}
                    >
                      <input
                        id="general-image-file-input"
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={Boolean(uploadingTargets[GENERAL_UPLOAD_KEY])}
                        className="hidden"
                        onChange={(e) =>
                          handleFileInputChange(GENERAL_UPLOAD_KEY, e)
                        }
                      />
                      {uploadingTargets[GENERAL_UPLOAD_KEY] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Đang tải ảnh lên...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
                          <span>Kéo thả ảnh vào đây hoặc bấm để chọn từ máy</span>
                        </>
                      )}
                    </label>

                    <div className="flex gap-1.5">
                      <Input
                        placeholder="Hoặc dán liên kết ảnh (https://...) rồi nhấn Enter"
                        className="h-9 text-xs"
                        value={generalUrlInput}
                        onChange={(e) => setGeneralUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddGeneralImage(generalUrlInput);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 shrink-0"
                        onClick={() => handleAddGeneralImage(generalUrlInput)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeColorValues.map((colorName, colorIdx) => {
                      const colorHex = getFashionColorHex(colorName);
                      const colorImgs = watchedColorImages?.[colorName] || [];
                      const isUploadingColor = Boolean(uploadingTargets[colorName]);
                      const isDragOverColor = dragActiveTarget === colorName;

                      return (
                        <div
                          key={colorName}
                          className="p-3.5 sm:p-4 border rounded-lg bg-card/60 space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: colorHex }}
                              />
                              <span className="font-semibold text-sm">
                                Màu {colorName}
                              </span>
                              {colorIdx === 0 ? (
                                <Badge className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] flex items-center gap-1 font-normal py-0.5">
                                  <Check className="h-2.5 w-2.5" /> Màu mặc định
                                </Badge>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
                                  onClick={() => setDefaultColor(colorName)}
                                >
                                  Đặt mặc định
                                </Button>
                              )}
                            </div>

                            {colorImgs.length > 0 ? (
                              <Badge variant="secondary" className="text-xs font-normal">
                                {colorImgs.length} ảnh
                              </Badge>
                            ) : (
                              <StatusBadge tone="warning" size="sm">
                                Chưa có ảnh
                              </StatusBadge>
                            )}
                          </div>

                          {colorImgs.length > 0 && (
                            <ImageReorderGrid
                              images={colorImgs}
                              onReorder={(imgs) =>
                                handleReorderColorImages(colorName, imgs)
                              }
                              onRemove={(url) =>
                                handleRemoveColorImage(colorName, url)
                              }
                              colorName={colorName}
                              isDefaultColor={colorIdx === 0}
                            />
                          )}

                          <div className="space-y-2 pt-0.5">
                            <label
                              htmlFor={`color-upload-${colorName}`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragActiveTarget(colorName);
                              }}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                setDragActiveTarget(colorName);
                              }}
                              onDragLeave={() => setDragActiveTarget(null)}
                              onDrop={(e) => handleDropFiles(colorName, e)}
                              className={cn(
                                "w-full border border-dashed rounded-md px-3 py-3 flex items-center justify-center gap-2 transition-colors text-xs font-medium",
                                isUploadingColor
                                  ? "opacity-60 cursor-wait bg-muted/40"
                                  : "cursor-pointer hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                                isDragOverColor &&
                                  "border-foreground bg-muted/70 text-foreground"
                              )}
                            >
                              <input
                                id={`color-upload-${colorName}`}
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={isUploadingColor}
                                className="hidden"
                                onChange={(e) =>
                                  handleFileInputChange(colorName, e)
                                }
                              />
                              {isUploadingColor ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Đang tải ảnh màu {colorName}...</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="h-4 w-4" />
                                  <span>
                                    Kéo thả hoặc chọn ảnh cho màu {colorName}
                                  </span>
                                </>
                              )}
                            </label>

                            <div className="flex gap-1.5">
                              <Input
                                placeholder={`Hoặc dán URL ảnh màu ${colorName} rồi nhấn Enter...`}
                                className="h-9 text-xs"
                                value={colorUrlInputs[colorName] || ""}
                                onChange={(e) =>
                                  setColorUrlInputs((prev) => ({
                                    ...prev,
                                    [colorName]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddColorImage(
                                      colorName,
                                      colorUrlInputs[colorName] || ""
                                    );
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 shrink-0"
                                onClick={() =>
                                  handleAddColorImage(
                                    colorName,
                                    colorUrlInputs[colorName] || ""
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DANH SÁCH BIẾN THỂ */}
            <Card id="section-variants-table" className="scroll-mt-40 sm:scroll-mt-36">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle>Danh sách Biến thể</CardTitle>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {variantFields.length} SKU
                    </Badge>
                    {mode === "edit" &&
                      variantFields.some(
                        (v, idx) =>
                          (watchedVariants?.[idx]?.stock ?? v.stock ?? 0) <= 5
                      ) && (
                        <StatusBadge tone="warning" size="sm">
                          {
                            variantFields.filter(
                              (v, idx) =>
                                (watchedVariants?.[idx]?.stock ?? v.stock ?? 0) <= 5
                            ).length
                          }{" "}
                          biến thể sắp hết
                        </StatusBadge>
                      )}
                  </div>
                  <CardDescription>
                    {mode === "edit"
                      ? "Tự động đồng bộ từ Màu sắc & Kích cỡ. Chỉnh giá bán, mã kho hoặc bấm Nhập kho."
                      : "Tự sinh mã biến thể không dấu. Bạn có thể nhập luôn Tồn đầu kỳ để bán ngay (hệ thống tự tạo Phiếu nhập kho)."}
                  </CardDescription>
                </div>

                {optionFields.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="gap-1.5 shrink-0"
                    onClick={handleManualSyncVariants}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Đồng bộ lại
                  </Button>
                )}
              </CardHeader>

              <CardContent>
                {variantFields.length === 0 ? (
                  <div className="text-center py-8 px-4 text-sm text-muted-foreground bg-muted/40 rounded-lg border border-dashed">
                    {Boolean(colorOption) && activeColorValues.length === 0 ? (
                      <>
                        Hãy bấm chọn ít nhất 1 <strong>Màu sắc</strong> ở phần{" "}
                        <strong>Phân loại</strong> phía trên để hệ thống tự sinh bảng biến thể (hoặc bấm <em>Xóa nhóm</em> Màu sắc nếu sản phẩm không chia màu).
                      </>
                    ) : (
                      <>
                        Chọn Màu sắc và Kích cỡ ở phần <strong>Phân loại</strong> phía trên để hệ thống tự động sinh bảng biến thể tại đây.
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Batch Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-muted/40 rounded-lg border text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-muted-foreground">
                            Áp giá:
                          </span>
                          <Input
                            type="number"
                            placeholder="Nhập giá..."
                            className="h-8 w-28 text-xs bg-card"
                            value={batchPrice}
                            onChange={(e) => setBatchPrice(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs px-2.5"
                            onClick={() => applyBatchPrice()}
                          >
                            Áp dụng
                          </Button>
                          {watchedPrice > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs px-2.5"
                              onClick={() => applyBatchPrice(Number(watchedPrice))}
                            >
                              Theo giá gốc
                            </Button>
                          )}
                        </div>

                        {mode === "create" && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-muted-foreground">
                              Tồn đầu kỳ:
                            </span>
                            <Input
                              type="number"
                              min={0}
                              max={10000}
                              placeholder="VD: 20"
                              className="h-8 w-20 text-xs bg-card"
                              value={batchStock}
                              onChange={(e) => setBatchStock(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-8 text-xs px-2.5"
                              onClick={applyBatchStock}
                            >
                              Điền đều
                            </Button>
                          </div>
                        )}
                      </div>

                      {mode === "edit" && productId && (
                        <Link
                          href={`/admin/stock-imports?productId=${productId}`}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium border border-primary/20 transition-colors"
                        >
                          <PackagePlus className="h-3.5 w-3.5" />
                          Nhập kho biến thể
                        </Link>
                      )}
                    </div>

                    {/* Variants Table */}
                    <div className="border rounded-md divide-y overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 hidden md:flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="flex-1">Phân loại</div>
                        <div className="w-32">Giá bán (đ)</div>
                        <div className="w-24 text-center">
                          {mode === "create" ? "Tồn đầu kỳ" : "Tồn kho"}
                        </div>
                        <div className="w-40">Mã kho (SKU)</div>
                        <div className="w-9" />
                      </div>

                      {variantFields.map((v, i) => {
                        const currentOpts =
                          watchedVariants?.[i]?.options || v.options || {};
                        const colorEntry = Object.entries(currentOpts).find(
                          ([k]) => isColorAttribute(k)
                        );
                        const colorVal = colorEntry ? colorEntry[1] : null;
                        const colorHex = colorVal
                          ? getFashionColorHex(colorVal)
                          : null;

                        return (
                          <div
                            key={v.id}
                            className="px-3.5 sm:px-4 py-3 flex flex-col md:flex-row md:items-start gap-3 md:gap-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex flex-1 items-center justify-between gap-2.5 min-w-0 md:pt-1.5">
                              <p className="font-medium text-sm flex items-center gap-2 truncate">
                                {colorHex && (
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/25 shrink-0"
                                    style={{ backgroundColor: colorHex }}
                                  />
                                )}
                                <span className="truncate">
                                  {Object.values(currentOpts).join(" / ")}
                                </span>
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 md:hidden text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                type="button"
                                onClick={() => removeVariant(i)}
                                title="Xóa riêng biến thể này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 md:flex gap-2.5 md:gap-4 w-full md:w-auto items-start">
                              <div className="col-span-1 md:w-32 space-y-1">
                                <span className="text-[11px] font-medium text-muted-foreground md:hidden">
                                  Giá bán (đ)
                                </span>
                                <FormField
                                  control={form.control}
                                  name={`variants.${i}.price`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-1">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min={0}
                                          placeholder="Giá bán..."
                                          className="w-full text-sm h-9"
                                          value={field.value === 0 ? "" : field.value}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            field.onChange(
                                              raw === ""
                                                ? 0
                                                : Math.max(0, Math.round(Number(raw)))
                                            );
                                          }}
                                          onBlur={field.onBlur}
                                          name={field.name}
                                          ref={field.ref}
                                        />
                                      </FormControl>
                                      <FormMessage className="text-[11px]" />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="col-span-1 md:w-24 space-y-1">
                                <span className="text-[11px] font-medium text-muted-foreground md:hidden">
                                  {mode === "create" ? "Tồn đầu kỳ" : "Tồn kho"}
                                </span>
                                {mode === "create" ? (
                                  <FormField
                                    control={form.control}
                                    name={`variants.${i}.stock`}
                                    render={({ field }) => (
                                      <FormItem className="space-y-1">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={10000}
                                            placeholder="0"
                                            className="w-full text-sm h-9 text-center font-mono"
                                            value={field.value ?? 0}
                                            onChange={(e) => {
                                              const raw = e.target.value;
                                              field.onChange(
                                                raw === ""
                                                  ? 0
                                                  : Math.min(
                                                      10000,
                                                      Math.max(0, Math.round(Number(raw)))
                                                    )
                                              );
                                            }}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                          />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                      </FormItem>
                                    )}
                                  />
                                ) : (
                                  <div className="h-9 flex items-center justify-center">
                                    {(() => {
                                      const stockVal =
                                        watchedVariants?.[i]?.stock ?? v.stock ?? 0;
                                      if (stockVal === 0) {
                                        return (
                                          <StatusBadge
                                            tone="danger"
                                            size="sm"
                                            className="w-full justify-center py-1.5 font-mono"
                                            title="Hết hàng (0 SP). Vui lòng lập phiếu nhập kho."
                                          >
                                            0 · Hết
                                          </StatusBadge>
                                        );
                                      }
                                      if (stockVal <= 5) {
                                        return (
                                          <StatusBadge
                                            tone="warning"
                                            size="sm"
                                            className="w-full justify-center py-1.5 font-mono"
                                            title={`Sắp hết hàng: còn ${stockVal} sản phẩm`}
                                          >
                                            {stockVal} · Ít
                                          </StatusBadge>
                                        );
                                      }
                                      return (
                                        <span
                                          className="font-mono text-xs font-medium px-2 py-1.5 rounded bg-muted/60 text-foreground border border-border w-full text-center"
                                          title={`Tồn kho: ${stockVal} sản phẩm`}
                                        >
                                          {stockVal}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>

                              <div className="col-span-2 md:col-span-1 md:w-40 space-y-1">
                                <span className="text-[11px] font-medium text-muted-foreground md:hidden">
                                  Mã kho (SKU)
                                </span>
                                <FormField
                                  control={form.control}
                                  name={`variants.${i}.sku`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-1">
                                      <FormControl>
                                        <Input
                                          placeholder="Mã SKU..."
                                          className="w-full text-xs h-9 font-mono"
                                          name={field.name}
                                          ref={field.ref}
                                          value={field.value || ""}
                                          onChange={(e) => {
                                            const sanitized = e.target.value
                                              .normalize("NFD")
                                              .replace(/[\u0300-\u036f]/g, "")
                                              .replace(/[đĐ]/g, "D")
                                              .toUpperCase()
                                              .replace(/\s+/g, "-")
                                              .replace(/[^A-Z0-9_-]/g, "")
                                              .slice(0, 40);
                                            field.onChange(sanitized);
                                          }}
                                          onBlur={field.onBlur}
                                        />
                                      </FormControl>
                                      <FormMessage className="text-[11px]" />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="hidden md:flex justify-start">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  type="button"
                                  onClick={() => removeVariant(i)}
                                  title="Xóa riêng biến thể này"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (1/3 on Desktop >= 1280px, STICKY): Checklist + Classification */}
          <div className="xl:col-span-4 flex flex-col gap-5 sm:gap-6 xl:sticky xl:top-36">
            {/* Readiness Checklist & Quick Jump */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Sẵn sàng đăng bán</CardTitle>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {completedChecklistCount}/{checklistItems.length}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Bấm vào từng mục để cuộn nhanh tới vị trí nhập.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {checklistItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => scrollToSection(item.target)}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                          item.done
                            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900"
                            : "border-neutral-300 dark:border-neutral-700"
                        )}
                      >
                        {item.done && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </span>
                      <span
                        className={cn(
                          "text-xs truncate",
                          item.done
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {item.hint}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Classification & Storefront Badges */}
            <Card id="section-classification" className="scroll-mt-40 sm:scroll-mt-36">
              <CardHeader>
                <CardTitle className="text-base">Phân loại & Hiển thị</CardTitle>
                <CardDescription className="text-xs">
                  Danh mục, thương hiệu, chất liệu và nhãn nổi bật.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => {
                    const selectedCat = categories.find(
                      (c) => c.slug === field.value
                    );
                    const formattedCategories = categories
                      .map((c) => ({
                        ...c,
                        fullPath: getCategoryFullPath(c, categories),
                      }))
                      .sort((a, b) => a.fullPath.localeCompare(b.fullPath, "vi"));

                    return (
                      <FormItem>
                        <FormLabel>
                          Danh mục chính <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full max-w-full min-w-0">
                              <SelectValue
                                placeholder="Chọn danh mục"
                                className="truncate"
                              >
                                {selectedCat
                                  ? getCategoryFullPath(selectedCat, categories)
                                  : field.value || "Chọn danh mục"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-72">
                            {formattedCategories.length > 0 ? (
                              formattedCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                  {cat.fullPath}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="ao-so-mi-nu">
                                  Áo sơ mi nữ
                                </SelectItem>
                                <SelectItem value="dam-cong-so">
                                  Đầm công sở
                                </SelectItem>
                                <SelectItem value="ao-vest-blazer">
                                  Áo Vest & Blazer
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhãn hiệu</FormLabel>
                      <FormControl>
                        <Input
                          maxLength={50}
                          placeholder="LUXE"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chất liệu vải (Tab Chi tiết)</FormLabel>
                      <FormControl>
                        <Input
                          maxLength={150}
                          placeholder="VD: Vải Tuytsi, Lụa tơ tằm, Cotton..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3 space-y-0">
                      <div className="space-y-0.5 pr-2">
                        <FormLabel className="cursor-pointer text-xs font-medium">
                          Nhãn NEW (Hàng mới)
                        </FormLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Hiển thị huy hiệu NEW trên ảnh sản phẩm
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBestSeller"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3 space-y-0">
                      <div className="space-y-0.5 pr-2">
                        <FormLabel className="cursor-pointer text-xs font-medium">
                          Nhãn BEST SELLER
                        </FormLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Hiển thị trong mục Best Seller & Hot Deals
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Post-create Stock Import Prompt */}
      <Dialog
        open={Boolean(createdProductPrompt)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedProductPrompt(null);
            router.push("/admin/products");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đã tạo sản phẩm thành công</DialogTitle>
            <DialogDescription className="pt-1 leading-relaxed">
              Sản phẩm{" "}
              <strong className="text-foreground">
                {createdProductPrompt?.name}
              </strong>{" "}
              hiện có tồn kho bằng 0. Bạn có muốn lập phiếu nhập kho ngay cho các
              biến thể vừa tạo không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreatedProductPrompt(null);
                router.push("/admin/products");
              }}
            >
              Để sau
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                const targetId = createdProductPrompt?.id;
                setCreatedProductPrompt(null);
                router.push(`/admin/stock-imports?productId=${targetId}`);
              }}
            >
              <PackagePlus className="h-4 w-4" />
              Nhập kho ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
