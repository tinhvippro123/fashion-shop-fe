"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, KeyboardEvent, useEffect } from "react";
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
import { UploadCloud, Plus, Trash2, Save, X, Check, Settings, Boxes, PackagePlus } from "lucide-react";
import { BackButton } from "@/shared/ui/back-button";
import { cn } from "@/shared/utils/utils";
import { formatPrice } from "@/shared/utils/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
  TProductPayload,
  TProductVariant,
} from "../schemas/product.schema";
import { getFashionColorHex, isColorAttribute } from "@/shared/utils/color";
import {
  AdminCategory,
  IOptionSuggestions,
  RawProductResponseDto,
  getCategoryFullPath,
} from "../types/catalog.admin";
import {
  getAdminColors,
  deleteAdminColor,
  getAdminSizes,
  deleteAdminSize,
} from "../api/attributes.api";
import { apiFetch } from "@/shared/lib/api";
import { resolveImageUrl } from "@/shared/utils/format";

const RichTextEditor = dynamic(
  () =>
    import("@/shared/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full animate-pulse bg-muted rounded-md flex items-center justify-center text-muted-foreground">
        Đang tải bộ soạn thảo...
      </div>
    ),
  }
);

interface ProductFormProps {
  productId?: string;
  mode?: "create" | "edit";
}

export function ProductForm({ productId, mode = "create" }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);
  const loadingInitial =
    mode === "edit" && Boolean(productId) && loadedProductId !== productId;
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [suggestions, setSuggestions] = useState<IOptionSuggestions>({
    names: ["Màu sắc", "Kích thước"],
    values: {
      "Màu sắc": ["Đen", "Trắng", "Be", "Đỏ đô", "Xanh navy"],
      "Kích thước": ["S", "M", "L", "XL"],
    },
  });

  const form = useForm<TProductPayload>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 450000,
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
      options: [],
      variants: [],
    },
  });

  useEffect(() => {
    Promise.all([
      apiFetch<AdminCategory[]>("/admin/categories").catch(() => []),
      apiFetch<IOptionSuggestions>("/admin/options/suggestions").catch(
        () => null
      ),
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

        // Trích xuất bộ sưu tập ảnh cho từng màu: ưu tiên prod.colorImages, fallback sang prod.productColors
        const resolvedColorImages: Record<string, string[]> = {};
        if (prod.colorImages && Object.keys(prod.colorImages).length > 0) {
          Object.assign(resolvedColorImages, prod.colorImages);
        }
        if (prod.productColors && Array.isArray(prod.productColors)) {
          prod.productColors.forEach((pc) => {
            const cName = pc.color?.name;
            if (cName && pc.images && pc.images.length > 0) {
              if (
                !resolvedColorImages[cName] ||
                resolvedColorImages[cName].length === 0
              ) {
                resolvedColorImages[cName] = pc.images.map(
                  (img) => img.imageUrl
                );
              }
            }
          });
        }

        // Chỉ chọn 1 ảnh làm ảnh bìa đại diện duy nhất (Primary Cover Photo), không gom tất cả ảnh vào bìa
        const primaryCover =
          prod.images?.[0] ||
          Object.values(resolvedColorImages)[0]?.[0] ||
          "";

        form.reset({
          name: prod.name || "",
          description: prod.description || "",
          price: Number(prod.basePrice || 0),
          discountPercent: prod.discountPercent ?? 0,
          isNew: prod.isNew ?? true,
          isBestSeller: prod.isBestSeller ?? false,
          sku: prod.sku || "",
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
            sku: v.sku,
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
  }, [mode, productId, form]);

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

  const watchedImages = useWatch({
    control: form.control,
    name: "images",
  });
  const currentImages = watchedImages || [];
  const watchedOptions = useWatch({
    control: form.control,
    name: "options",
  });
  const watchedVariants = useWatch({
    control: form.control,
    name: "variants",
  });
  const watchedPrice =
    useWatch({
      control: form.control,
      name: "price",
    }) || 0;
  const watchedDiscount =
    useWatch({
      control: form.control,
      name: "discountPercent",
    }) || 0;

  const [generalUrlInput, setGeneralUrlInput] = useState("");

  const handleAddGeneralImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const prev = form.getValues("images") || [];
    if (!prev.includes(trimmed)) {
      form.setValue("images", [...prev, trimmed]);
      toast.success("Đã thêm ảnh sản phẩm!");
    }
    setGeneralUrlInput("");
  };

  const handleRemoveGeneralImage = (url: string) => {
    const prev = form.getValues("images") || [];
    form.setValue(
      "images",
      prev.filter((i) => i !== url)
    );
  };

  const handleGeneralFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
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
        const prev = form.getValues("images") || [];
        form.setValue(
          "images",
          Array.from(new Set([...prev, ...newUrls]))
        );
        toast.success(`Đã thêm ${newUrls.length} ảnh!`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tải ảnh thất bại";
      toast.error(message);
    } finally {
      e.target.value = "";
    }
  };

  const watchedColorImages =
    (useWatch({
      control: form.control,
      name: "colorImages",
    }) as Record<string, string[]>) || {};

  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({});

  const handleAddColorImage = (colorName: string, imgUrl: string) => {
    const trimmed = imgUrl.trim();
    if (!trimmed) return;
    const currentMap = form.getValues("colorImages") || {};
    const prevImgs = currentMap[colorName] || [];
    if (!prevImgs.includes(trimmed)) {
      form.setValue("colorImages", {
        ...currentMap,
        [colorName]: [...prevImgs, trimmed],
      });
      toast.success(`Đã thêm ảnh cho màu ${colorName}!`);
    }
    setColorUrlInputs((prev) => ({ ...prev, [colorName]: "" }));
  };

  const handleRemoveColorImage = (colorName: string, imgUrl: string) => {
    const currentMap = form.getValues("colorImages") || {};
    const prevImgs = currentMap[colorName] || [];
    form.setValue("colorImages", {
      ...currentMap,
      [colorName]: prevImgs.filter((i) => i !== imgUrl),
    });
  };

  const handleColorFileUpload = async (
    colorName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
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
        const currentMap = form.getValues("colorImages") || {};
        const prevImgs = currentMap[colorName] || [];
        const combined = Array.from(new Set([...prevImgs, ...newUrls]));
        form.setValue("colorImages", {
          ...currentMap,
          [colorName]: combined,
        });
        toast.success(`Đã thêm ${newUrls.length} ảnh cho màu ${colorName}!`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Tải ảnh thất bại";
      toast.error(message);
    } finally {
      e.target.value = "";
    }
  };

  const [batchPrice, setBatchPrice] = useState("");

  const applyBatchPrice = () => {
    const p = Number(batchPrice);
    if (isNaN(p) || p < 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }
    const current = form.getValues("variants") || [];
    if (current.length === 0) {
      toast.error("Chưa có biến thể nào để áp dụng");
      return;
    }
    const updated = current.map((v) => ({ ...v, price: p }));
    replaceVariants(updated);
    toast.success(
      `Đã áp dụng giá ${formatPrice(p)} cho tất cả ${current.length} biến thể!`
    );
    setBatchPrice("");
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
        toast.success(
          `Đã chọn "${colorName}" làm màu mặc định (hiển thị có dấu tick đầu tiên)!`
        );
      }
    }
  };

  function onSubmit(
    values: TProductPayload,
    status: "draft" | "published" = "published"
  ) {
    startTransition(async () => {
      try {
        let finalImages = values.images || [];
        if (values.colorImages && Object.keys(values.colorImages).length > 0) {
          const colorOpt = (values.options || []).find((opt) =>
            isColorAttribute(opt.name)
          );
          const firstColor =
            colorOpt?.values?.[0] || Object.keys(values.colorImages)[0];
          const firstColorImgs = values.colorImages[firstColor] || [];
          if (firstColorImgs.length > 0) {
            finalImages = [firstColorImgs[0]];
          } else {
            const anyImg = Object.values(values.colorImages).flat()[0];
            if (anyImg) finalImages = [anyImg];
          }
        }
        const payload = { ...values, images: finalImages, status };
        if (mode === "create") {
          await apiFetch("/admin/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success(
            status === "published"
              ? "Đã thêm sản phẩm mới thành công!"
              : "Đã lưu nháp sản phẩm!"
          );
          router.push("/admin/products");
        } else {
          await apiFetch(`/admin/products/${productId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success(
            status === "published"
              ? "Đã cập nhật sản phẩm thành công!"
              : "Đã cập nhật bản nháp!"
          );
          router.push("/admin/products");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Lỗi kết nối đến máy chủ!"
        );
      }
    });
  }

  const onDraft = () => {
    form.handleSubmit((values) => onSubmit(values, "draft"))();
  };

  const generateVariants = () => {
    const currentOptions = form.getValues("options") || [];
    const validOptions = currentOptions.filter(
      (opt) => opt.name && opt.values && opt.values.length > 0
    );

    if (validOptions.length === 0) {
      toast.error(
        "Vui lòng thêm ít nhất 1 thuộc tính và giá trị trước khi sinh biến thể."
      );
      return;
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

    const basePrice = form.getValues("price") || 0;
    const baseStock = form.getValues("stock") || 0;
    const baseSku = form.getValues("sku") || `LUXE-${Date.now() % 10000}`;
    const existingVariants = form.getValues("variants") || [];

    const newVariants: TProductVariant[] = combinations.map((combo, i) => {
      const matched = existingVariants.find((ev) => {
        const evOpts = ev.options || {};
        return Object.entries(combo).every(
          ([k, v]) =>
            (evOpts[k] || "").toLowerCase() === (v || "").toLowerCase()
        );
      });
      const skuSuffix = Object.values(combo)
        .map((val) =>
          val.length <= 3
            ? val.toUpperCase()
            : val
              .split(/\s+/)
              .map((w) => w[0]?.toUpperCase() || "")
              .join("")
        )
        .join("-");

      return {
        id: matched?.id,
        sku: matched?.sku || `${baseSku}-${skuSuffix || i + 1}`,
        price: matched?.price ?? basePrice,
        costPrice: matched?.costPrice,
        stock: matched?.stock ?? baseStock,
        options: combo,
        image: matched?.image,
      };
    });

    replaceVariants(newVariants);
    toast.success(`Đã tự động tạo ${newVariants.length} biến thể!`);
  };

  const applyFashionPreset = () => {
    const defaultOptions = [
      { name: "Màu sắc", values: ["Đen", "Trắng"] },
      { name: "Kích thước", values: ["S", "M", "L"] },
    ];
    replaceOptions(defaultOptions);

    const basePrice = form.getValues("price") || 0;
    const baseSku = form.getValues("sku") || `LX-${Date.now() % 10000}`;
    const existingVariants = form.getValues("variants") || [];

    const combinations: Record<string, string>[] = [];
    defaultOptions[0].values.forEach((c) => {
      defaultOptions[1].values.forEach((s) => {
        combinations.push({ "Màu sắc": c, "Kích thước": s });
      });
    });

    const newVariants: TProductVariant[] = combinations.map((combo, i) => {
      const matched = existingVariants.find((ev) => {
        const evOpts = ev.options || {};
        return Object.entries(combo).every(
          ([k, v]) =>
            (evOpts[k] || "").toLowerCase() === (v || "").toLowerCase()
        );
      });
      const colorCode = combo["Màu sắc"] === "Đen" ? "C1" : "C2";
      return {
        id: matched?.id,
        sku: matched?.sku || `${baseSku}-${colorCode}-${combo["Kích thước"]}`,
        price: matched?.price ?? basePrice,
        costPrice: matched?.costPrice,
        stock: matched?.stock ?? 0,
        options: combo,
        image: matched?.image,
      };
    });

    replaceVariants(newVariants);
    toast.success("Đã áp dụng mẫu Thời trang & tự động sinh 6 biến thể (Đen, Trắng × S, M, L)!");
  };

  const handleQuickSetName = (index: number, name: string) => {
    const currentOpt = form.getValues(`options.${index}`);
    updateOption(index, { name, values: currentOpt?.values || [] });
  };

  const handleQuickAddValue = (index: number, val: string) => {
    const currentOpt = form.getValues(`options.${index}`);
    if (!currentOpt) return;
    const currentValues = currentOpt.values || [];

    if (!currentValues.includes(val)) {
      updateOption(index, {
        name: currentOpt.name || "",
        values: [...currentValues, val],
      });
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

      const currentOpt = form.getValues(`options.${index}`);
      if (!currentOpt) return;
      const currentValues = currentOpt.values || [];

      if (!currentValues.includes(val)) {
        updateOption(index, {
          name: currentOpt.name || "",
          values: [...currentValues, val],
        });
      }
      e.currentTarget.value = "";
    }
  };

  const handleDeleteSuggestion = async (
    attrName: string,
    valToRemove: string
  ) => {
    try {
      if (isColorAttribute(attrName)) {
        const allColors = await getAdminColors();
        const match = allColors.find(
          (c) => c.name.toLowerCase() === valToRemove.toLowerCase()
        );
        if (match) {
          await deleteAdminColor(match.id);
          toast.success(`Đã xóa màu "${valToRemove}" khỏi danh mục hệ thống`);
        }
      } else {
        const allSizes = await getAdminSizes();
        const match = allSizes.find(
          (s) => s.name.toUpperCase() === valToRemove.toUpperCase()
        );
        if (match) {
          await deleteAdminSize(match.id);
          toast.success(`Đã xóa kích thước "${valToRemove}" khỏi danh mục hệ thống`);
        }
      }
      setSuggestions((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [attrName]: (prev.values[attrName] || []).filter(
            (v) => v !== valToRemove
          ),
        },
      }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Không thể xóa "${valToRemove}"`;
      toast.error(msg);
    }
  };

  const handleRemoveOptionValue = (optIndex: number, valToRemove: string) => {
    const currentOpt = form.getValues(`options.${optIndex}`);
    if (!currentOpt) return;
    const currentValues = currentOpt.values || [];
    const optName = currentOpt.name || "";

    updateOption(optIndex, {
      name: optName,
      values: currentValues.filter((v) => v !== valToRemove),
    });

    // Tự động dọn dẹp các biến thể đang chứa giá trị vừa xóa
    if (optName) {
      const currentVars = form.getValues("variants") || [];
      const updatedVars = currentVars.filter((v) => {
        return v.options?.[optName] !== valToRemove;
      });
      if (updatedVars.length !== currentVars.length) {
        replaceVariants(updatedVars);
      }
    }

    // Nếu xóa giá trị màu sắc, xóa luôn bộ ảnh của màu đó trong colorImages
    if (isColorAttribute(optName)) {
      const currentMap = form.getValues("colorImages") || {};
      if (currentMap[valToRemove]) {
        const nextMap = { ...currentMap };
        delete nextMap[valToRemove];
        form.setValue("colorImages", nextMap);
      }
    }
  };

  const handleRemoveOption = (index: number) => {
    const opt = form.getValues(`options.${index}`);
    const optName = opt?.name || "";
    removeOption(index);

    if (optName) {
      const currentVars = form.getValues("variants") || [];
      const updatedVars = currentVars.map((v) => {
        const newOpts = { ...v.options };
        delete newOpts[optName];
        return { ...v, options: newOpts };
      });
      replaceVariants(updatedVars);

      if (isColorAttribute(optName)) {
        form.setValue("colorImages", {});
      }
    }
  };

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
        onSubmit={form.handleSubmit((values) => onSubmit(values, "published"))}
        className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <BackButton />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {mode === "edit" ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {mode === "edit"
                  ? "Cập nhật thông tin và biến thể của sản phẩm."
                  : "Tạo mới một sản phẩm để đăng bán."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Link
              href="/admin/products"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 sm:flex-none hidden sm:inline-flex"
              )}
            >
              Hủy bỏ
            </Link>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={onDraft}
              disabled={isPending}
            >
              Lưu nháp
            </Button>
            <Button
              type="submit"
              className="gap-2 flex-1 sm:flex-none"
              disabled={isPending}
            >
              <Save className="h-4 w-4" />{" "}
              {isPending ? "Đang lưu..." : "Lưu sản phẩm"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="basic" className="data-[state=active]:bg-card">
              Thông tin cơ bản
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="data-[state=active]:bg-card"
            >
              Phân loại & Biến thể ({variantFields.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-0">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Cột trái: Form thông tin */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>
                      Nhập tên và mô tả cho sản phẩm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
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
                              placeholder="VD: Váy đầm dạ hội nữ..."
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
                                placeholder="Mô tả chất liệu, kiểu dáng..."
                                editorClassName="min-h-[250px] border-none"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="careInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hướng dẫn bảo quản (Tab Bảo quản)</FormLabel>
                          <FormControl>
                            <div className="rounded-md border flex flex-col bg-card">
                              <RichTextEditor
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Nhập lưu ý giặt ủi, in đậm, gạch đầu dòng..."
                                editorClassName="min-h-[160px] border-none"
                              />
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Nếu để trống, hệ thống sẽ tự động hiển thị hướng dẫn bảo quản trang phục tiêu chuẩn của thương hiệu.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Giá và Kho</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
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
                              placeholder="VD: 1500000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
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
                              max={100}
                              placeholder="0"
                              {...field}
                              value={field.value ?? 0}
                              onChange={(e) =>
                                field.onChange(
                                  Math.min(
                                    100,
                                    Math.max(0, Number(e.target.value) || 0)
                                  )
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(() => {
                      if (watchedDiscount <= 0 || watchedPrice <= 0) return null;
                      const effective = Math.round(
                        (watchedPrice * (100 - watchedDiscount)) / 100
                      );
                      return (
                        <div className="col-span-full p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-800 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span>
                              Giá bán sau giảm <b>{watchedDiscount}%</b>:{" "}
                            </span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              {formatPrice(effective)}
                            </span>
                          </div>
                          <span>
                            Tiết kiệm:{" "}
                            <b>{formatPrice(watchedPrice - effective)}</b>
                          </span>
                        </div>
                      );
                    })()}

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã SKU gốc</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="VD: VDH-001"
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
                              <span className="flex items-center gap-1.5 font-semibold">
                                <Boxes className="h-4 w-4 text-primary" />
                                Tồn kho hiện tại (Chỉ đọc)
                              </span>
                              {variantFields.length > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] font-mono font-bold"
                                >
                                  {totalVarStock} SP
                                </Badge>
                              )}
                            </FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  readOnly
                                  disabled
                                  value={displayStock}
                                  className="bg-muted/50 cursor-not-allowed font-bold text-foreground"
                                />
                              </FormControl>
                              {productId && (
                                <Link
                                  href={`/admin/stock-imports?productId=${productId}`}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0 transition-colors shadow-xs"
                                  title="Mở phiếu nhập kho cho sản phẩm này"
                                >
                                  <PackagePlus className="h-4 w-4" />
                                  Nhập kho
                                </Link>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              💡 Số lượng kho được quản lý tự động qua chứng từ{" "}
                              <strong className="text-foreground">Nhập kho</strong>{" "}
                              để đảm bảo lưu vết xuất xứ và tính giá vốn bình quân kế toán.
                            </p>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Cột phải: Phân loại */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Phân loại & Thuộc tính</CardTitle>
                    <CardDescription>
                      Thiết lập danh mục, nhãn hiệu và các nhãn ưu tiên hiển thị cho sản phẩm.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => {
                        const selectedCat = categories.find((c) => c.slug === field.value);
                        const formattedCategories = categories
                          .map((c) => ({
                            ...c,
                            fullPath: getCategoryFullPath(c, categories),
                          }))
                          .sort((a, b) => a.fullPath.localeCompare(b.fullPath, "vi"));

                        return (
                          <FormItem>
                            <FormLabel>
                              Danh mục chính{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn danh mục">
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
                          <div className="space-y-0.5">
                            <FormLabel className="cursor-pointer">
                              Nhãn NEW (Hàng mới)
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Hiển thị huy hiệu NEW màu cam trên ảnh sản phẩm
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
                          <div className="space-y-0.5">
                            <FormLabel className="cursor-pointer">
                              Nhãn BEST SELLER
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Hiển thị huy hiệu BEST SELLER (khi tắt nhãn NEW)
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
          </TabsContent>

          <TabsContent value="variants" className="mt-0">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 flex flex-col gap-6">
                {/* Variant Builder */}
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Thuộc tính sản phẩm</CardTitle>
                      <CardDescription>
                        Thêm các thuộc tính như Màu sắc, Kích thước...
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={applyFashionPreset}
                      >
                        Mẫu Thời Trang
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => appendOption({ name: "", values: [] })}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Thêm
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    {optionFields.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        Chưa có thuộc tính nào. Sản phẩm này sẽ tạo 1 phân loại
                        mặc định (Đen / M).
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {optionFields.map((field, index) => {
                          const currentName = form.watch(`options.${index}.name`);
                          return (
                          <div
                            key={field.id}
                            className="p-4 border rounded-lg bg-card space-y-3"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Nhóm thuộc tính #{index + 1} {currentName ? `• ${currentName}` : ""}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href="/admin/attributes"
                                  target="_blank"
                                  className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-muted"
                                  title="Mở trang Quản lý bảng màu & kích thước trong tab mới"
                                >
                                  <Settings className="h-3 w-3" />
                                  Quản lý bảng thuộc tính
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs px-2.5 py-1 h-7 flex items-center gap-1 border border-transparent hover:border-destructive/20 transition-all"
                                  onClick={() => handleRemoveOption(index)}
                                  type="button"
                                  title="Xóa toàn bộ nhóm thuộc tính này"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  <span className="text-xs text-destructive font-medium">Xóa nhóm</span>
                                </Button>
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                              <FormField
                                control={form.control}
                                name={`options.${index}.name`}
                                render={({ field: nameField }) => (
                                  <FormItem>
                                    <FormLabel>Tên thuộc tính</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="VD: Màu sắc"
                                        {...nameField}
                                      />
                                    </FormControl>
                                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                      {suggestions.names.map((sugg) => (
                                        <Badge
                                          key={sugg}
                                          variant="outline"
                                          className="cursor-pointer text-[10px] py-0 px-1.5 hover:bg-muted font-normal"
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

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Giá trị (Nhấn Enter để thêm)</Label>
                                </div>
                                <Input
                                  placeholder="VD: Đỏ, Xanh... rồi ấn Enter"
                                  onKeyDown={(e) =>
                                    handleAddOptionValue(index, e)
                                  }
                                />

                                {(() => {
                                  const currentName =
                                    watchedOptions?.[index]?.name;
                                  if (
                                    !currentName ||
                                    !suggestions.values[currentName]
                                  )
                                    return null;
                                  const isColor = isColorAttribute(currentName);
                                  const currentValues =
                                    watchedOptions?.[index]?.values || [];
                                  const availableSuggestions = (
                                    suggestions.values[currentName] || []
                                  ).filter((sugg) => !currentValues.includes(sugg));

                                  if (availableSuggestions.length === 0)
                                    return null;

                                  return (
                                    <div className="space-y-1.5 mt-2">
                                      <div className="text-[11px] text-muted-foreground font-medium">
                                        Gợi ý sẵn có ({availableSuggestions.length}):
                                      </div>
                                      <div className="flex gap-1.5 flex-wrap">
                                        {availableSuggestions.map(
                                          (sugg: string) => (
                                            <Badge
                                              key={sugg}
                                              variant="outline"
                                              className="group/sugg text-[10px] py-0 pl-1.5 pr-1 hover:bg-muted font-normal text-muted-foreground flex items-center gap-1 transition-all"
                                            >
                                              <span
                                                className="cursor-pointer flex items-center gap-1 py-0.5"
                                                onClick={() =>
                                                  handleQuickAddValue(index, sugg)
                                                }
                                                title={`Thêm ${sugg}`}
                                              >
                                                {isColor && (
                                                  <span
                                                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block"
                                                    style={{
                                                      backgroundColor:
                                                        getFashionColorHex(sugg),
                                                    }}
                                                  />
                                                )}
                                                + {sugg}
                                              </span>
                                              <button
                                                type="button"
                                                className="opacity-0 group-hover/sugg:opacity-100 hover:text-destructive hover:bg-destructive/15 rounded-full p-0.5 transition-all ml-0.5"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteSuggestion(
                                                    currentName,
                                                    sugg
                                                  );
                                                }}
                                                title={`Xóa vĩnh viễn "${sugg}" khỏi danh mục gợi ý`}
                                              >
                                                <X className="h-2.5 w-2.5" />
                                              </button>
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {(watchedOptions?.[index]?.values || [])
                                  .length > 0 && (
                                  <div className="space-y-1 mt-3">
                                    <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md border min-h-[42px]">
                                      {(
                                        watchedOptions?.[index]?.values || []
                                      ).map((val, vIdx) => {
                                        const isColor = isColorAttribute(
                                          watchedOptions?.[index]?.name
                                        );
                                        const colorHex = isColor
                                          ? getFashionColorHex(val)
                                          : null;
                                        return (
                                          <Badge
                                            key={vIdx}
                                            variant="secondary"
                                            className="pl-2.5 pr-1 py-1 flex items-center gap-1.5 font-medium border bg-muted/60"
                                          >
                                            {isColor && (
                                              <span
                                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 inline-block shadow-xs"
                                                style={{
                                                  backgroundColor:
                                                    colorHex || "#333",
                                                }}
                                                title={`Màu: ${val} (${colorHex})`}
                                              />
                                            )}
                                            <span>{val}</span>
                                            <button
                                              type="button"
                                              className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center cursor-pointer ml-1 transition-colors"
                                              onClick={() =>
                                                handleRemoveOptionValue(index, val)
                                              }
                                              title={`Xóa giá trị "${val}"`}
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic pt-1">
                                      💡 Bấm vào dấu <span className="font-semibold text-destructive">×</span> trên từng ô để xóa kích cỡ hoặc màu sắc.
                                    </p>
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

                {/* Color Image Gallery Card */}
                {(() => {
                  const colorOption = (watchedOptions || []).find((opt) =>
                    isColorAttribute(opt.name)
                  );
                  const activeColorValues = colorOption?.values || [];

                  if (activeColorValues.length === 0) {
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5" /> Bộ sưu tập ảnh sản phẩm
                          </CardTitle>
                          <CardDescription>
                            Sản phẩm chưa có thuộc tính &quot;Màu sắc&quot;. Bạn có thể thêm thuộc tính Màu sắc ở trên để tải ảnh riêng cho từng màu, hoặc tải ảnh chung tại đây. Ảnh đầu tiên sẽ tự động làm ảnh đại diện.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {currentImages.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {currentImages.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative aspect-2/3 rounded-md overflow-hidden border bg-muted group"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={resolveImageUrl(imgUrl)}
                                    alt={`Ảnh ${imgIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {imgIdx === 0 && (
                                    <Badge className="absolute bottom-1 left-1 bg-black/85 text-white text-[9px] px-1.5 py-0 border border-white/20 shadow-xs pointer-events-none">
                                      Ảnh đại diện
                                    </Badge>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGeneralImage(imgUrl)}
                                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Xóa ảnh này"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Chưa có hình ảnh nào cho sản phẩm.
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <label
                              htmlFor="general-image-file-input"
                              className="flex-1 border border-dashed rounded-md px-3 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              <input
                                id="general-image-file-input"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleGeneralFileUpload}
                              />
                              <UploadCloud className="h-4 w-4" />
                              <span>Chọn ảnh từ máy tính (kéo thả)</span>
                            </label>

                            <div className="flex gap-1.5 sm:w-80">
                              <Input
                                placeholder="Dán liên kết ảnh (https://...)"
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
                                className="h-9 px-3"
                                onClick={() => handleAddGeneralImage(generalUrlInput)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UploadCloud className="h-5 w-5" /> Bộ sưu tập ảnh theo Màu sắc
                        </CardTitle>
                        <CardDescription>
                          Tải ảnh riêng cho từng màu sắc. Ảnh đầu tiên của màu mặc định sẽ tự động được sử dụng làm ảnh đại diện sản phẩm ngoài danh mục.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {activeColorValues.map((colorName, colorIdx) => {
                          const colorHex = getFashionColorHex(colorName);
                          const colorImgs =
                            watchedColorImages?.[colorName] || [];

                          return (
                            <div
                              key={colorName}
                              className="p-4 border rounded-lg bg-card/60 space-y-3"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-4 h-4 rounded-full border border-black/20 shadow-xs inline-block shrink-0"
                                    style={{ backgroundColor: colorHex }}
                                  />
                                  <span className="font-semibold text-sm">
                                    Màu sắc: {colorName}
                                  </span>
                                  {colorIdx === 0 ? (
                                    <Badge className="bg-black text-white text-[10px] flex items-center gap-1 font-normal py-0.5">
                                      <Check className="h-2.5 w-2.5" /> Màu mặc định (Ảnh đại diện & Hiển thị đầu tiên)
                                    </Badge>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
                                      onClick={() => setDefaultColor(colorName)}
                                      title="Đặt màu này làm màu được chọn đầu tiên khi khách mở trang"
                                    >
                                      Đặt làm mặc định
                                    </Button>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {colorImgs.length} ảnh
                                  </Badge>
                                </div>
                              </div>

                              {/* Images Grid */}
                              {colorImgs.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                  {colorImgs.map((imgUrl, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative aspect-2/3 rounded-md overflow-hidden border bg-muted group"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={resolveImageUrl(imgUrl)}
                                        alt={`${colorName} ${imgIdx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      {colorIdx === 0 && imgIdx === 0 && (
                                        <Badge className="absolute bottom-1 left-1 bg-black/85 text-white text-[9px] px-1.5 py-0 border border-white/20 shadow-xs pointer-events-none">
                                          Ảnh đại diện
                                        </Badge>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveColorImage(colorName, imgUrl)
                                        }
                                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Xóa ảnh này"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">
                                  Chưa có ảnh riêng cho màu {colorName} (sẽ sử dụng ảnh chung của sản phẩm).
                                </p>
                              )}

                              {/* Upload / URL controls */}
                              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <label
                                  htmlFor={`color-upload-${colorName}`}
                                  className="flex-1 border border-dashed rounded-md px-3 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                  <input
                                    id={`color-upload-${colorName}`}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                      handleColorFileUpload(colorName, e)
                                    }
                                  />
                                  <UploadCloud className="h-4 w-4" />
                                  <span>Chọn ảnh từ máy cho màu {colorName}</span>
                                </label>

                                <div className="flex gap-1.5 sm:w-80">
                                  <Input
                                    placeholder={`Dán URL ảnh cho màu ${colorName}...`}
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
                                    className="h-9 px-2.5"
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
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Variants List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Danh sách Biến thể</CardTitle>
                      <CardDescription>
                        Quản lý giá và kho cho từng phân loại.
                      </CardDescription>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
                      onClick={generateVariants}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Tự động sinh Biến thể
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {variantFields.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                        Hãy thêm thuộc tính và nhấn nút &quot;Tự động sinh Biến
                        thể&quot;.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-muted/40 rounded-lg border text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-muted-foreground">
                              Thiết lập hàng loạt:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                placeholder="Giá chung..."
                                className="h-8 w-28 text-xs bg-card"
                                value={batchPrice}
                                onChange={(e) => setBatchPrice(e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 text-xs px-2.5"
                                onClick={applyBatchPrice}
                              >
                                Áp dụng giá
                              </Button>
                            </div>
                          </div>

                          {productId ? (
                            <Link
                              href={`/admin/stock-imports?productId=${productId}`}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium border border-primary/20 transition-colors shadow-2xs"
                              title="Tạo phiếu nhập kho cho tất cả biến thể của sản phẩm này"
                            >
                              <PackagePlus className="h-3.5 w-3.5" />
                              Nhập kho các biến thể
                            </Link>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              💡 Tồn kho khởi tạo = 0. Sau khi tạo sản phẩm, vui lòng tạo Phiếu nhập kho.
                            </span>
                          )}
                        </div>

                        <div className="border rounded-md divide-y overflow-hidden">
                          <div className="bg-muted/50 p-4 hidden sm:flex items-center gap-4 text-sm font-semibold">
                            <div className="flex-1">Phân loại</div>
                            <div className="w-28">Giá bán</div>
                            <div className="w-20 text-center">Tồn kho</div>
                            <div className="w-32">SKU</div>
                            <div className="w-9"></div>
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
                              className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex flex-1 items-center gap-2.5">
                                <p className="font-semibold text-sm flex items-center gap-2">
                                  {colorHex && (
                                    <span
                                      className="w-4 h-4 rounded-full border border-black/25 shrink-0 inline-block shadow-2xs"
                                      style={{ backgroundColor: colorHex }}
                                    />
                                  )}
                                  <span>
                                    {Object.values(currentOpts).join(" / ")}
                                  </span>
                                </p>
                              </div>
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full sm:w-auto items-center">
                              <div className="col-span-1 sm:w-28 space-y-1">
                                <span className="text-[11px] font-medium text-muted-foreground sm:hidden">Giá bán (đ)</span>
                                <FormField
                                  control={form.control}
                                  name={`variants.${i}.price`}
                                  render={({ field }) => (
                                    <Input
                                      type="number"
                                      placeholder="Giá bán..."
                                      className="w-full text-sm h-9"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  )}
                                />
                              </div>
                              <div className="col-span-1 sm:w-20 space-y-1">
                                <span className="text-[11px] font-medium text-muted-foreground sm:hidden">Tồn kho</span>
                                <div className="h-9 flex items-center justify-center">
                                  <span
                                    className="font-mono text-xs font-bold px-2 py-1.5 rounded bg-muted/80 text-foreground border w-full text-center"
                                    title="Tồn kho hiện tại (Quản lý tự động qua chứng từ Nhập kho)"
                                  >
                                    {watchedVariants?.[i]?.stock ?? v.stock ?? 0}
                                  </span>
                                </div>
                              </div>
                              <div className="col-span-2 sm:col-span-1 sm:w-32 space-y-1">
                                <span className="text-[11px] font-medium text-muted-foreground sm:hidden">Mã SKU</span>
                                <FormField
                                  control={form.control}
                                  name={`variants.${i}.sku`}
                                  render={({ field }) => (
                                    <Input
                                      placeholder="Mã SKU..."
                                      className="w-full text-sm h-9"
                                      {...field}
                                    />
                                  )}
                                />
                              </div>
                              <div className="col-span-2 sm:col-span-1 flex justify-end sm:justify-start">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  type="button"
                                  onClick={() => removeVariant(i)}
                                  title="Xóa riêng biến thể này khỏi sản phẩm"
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

              {/* Sidebar Variants */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mẹo nhập liệu</CardTitle>
                    <CardDescription>
                      Cách sử dụng Trình tạo Biến thể hiệu quả.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3 text-muted-foreground">
                    <p>
                      1. Bấm <b>Mẫu Thời Trang</b> nếu muốn nhanh, hoặc{" "}
                      <b>Thêm</b> để tự định nghĩa Màu sắc & Kích thước.
                    </p>
                    <p>
                      2. Ở mục Giá trị, bạn có thể bấm vào các{" "}
                      <b>gợi ý màu/size</b> bên dưới để điền nhanh.
                    </p>
                    <p>
                      3. Bấm <b>Tự động sinh Biến thể</b> để sinh danh sách SKU
                      kèm giá bán và tồn kho.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}

