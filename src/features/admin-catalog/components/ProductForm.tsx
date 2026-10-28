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
import { UploadCloud, Plus, Trash2, Save, X } from "lucide-react";
import { BackButton } from "@/shared/ui/back-button";
import { cn } from "@/shared/utils/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import dynamic from "next/dynamic";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  AdminCategory,
  IOptionSuggestions,
  RawProductResponseDto,
} from "../types/catalog.admin";
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

const SAMPLE_UPLOADS = [
  "03321697-61dc-4f30-8da7-d25085a78741.webp",
  "121a23af-e7f7-4e5a-8e96-65f25b8a4a3f.webp",
  "1a5d5e10-8bd7-4c72-bfef-c498b5b9dc2f.webp",
  "2f64821f-d03e-4666-a169-27710a6ab2ca.webp",
];

interface ProductFormProps {
  productId?: string;
  mode?: "create" | "edit";
}

export function ProductForm({ productId, mode = "create" }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingInitial, setLoadingInitial] = useState(mode === "edit");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [suggestions, setSuggestions] = useState<IOptionSuggestions>({
    names: ["Màu sắc", "Kích thước"],
    values: {
      "Màu sắc": ["Đen", "Trắng", "Be", "Đỏ đô", "Xanh navy"],
      "Kích thước": ["S", "M", "L", "XL"],
    },
  });
  const [imageInput, setImageInput] = useState("");

  const form = useForm<TProductPayload>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 450000,
      sku: "",
      stock: 20,
      category: "",
      brand: "LUXE",
      images: [SAMPLE_UPLOADS[0]],
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
    setLoadingInitial(true);
    apiFetch<RawProductResponseDto>(`/admin/products/${productId}`)
      .then((prod) => {
        form.reset({
          name: prod.name || "",
          description: prod.description || "",
          price: Number(prod.basePrice || 0),
          sku: prod.sku || "",
          stock: prod.totalStock ?? 0,
          category: prod.category?.slug || "",
          brand: prod.brand || "LUXE",
          images:
            prod.images && prod.images.length > 0
              ? prod.images
              : [SAMPLE_UPLOADS[0]],
          status: prod.isActive ? "published" : "draft",
          options: prod.options || [],
          variants: (prod.adminVariants || []).map((v) => ({
            sku: v.sku,
            price: Number(v.price || prod.basePrice || 0),
            stock: v.stock ?? 0,
            options: v.options || {},
            image: v.image,
          })),
        });
      })
      .catch(() => {
        toast.error("Không tìm thấy sản phẩm cần chỉnh sửa!");
      })
      .finally(() => setLoadingInitial(false));
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

  const currentImages = form.watch("images") || [];

  const handleAddImage = (imgUrl: string) => {
    const trimmed = imgUrl.trim();
    if (!trimmed) return;
    const prev = form.getValues("images") || [];
    if (!prev.includes(trimmed)) {
      form.setValue("images", [...prev, trimmed]);
    }
    setImageInput("");
  };

  const handleRemoveImage = (imgUrl: string) => {
    const prev = form.getValues("images") || [];
    form.setValue(
      "images",
      prev.filter((i) => i !== imgUrl)
    );
  };

  function onSubmit(
    values: TProductPayload,
    status: "draft" | "published" = "published"
  ) {
    startTransition(async () => {
      try {
        const payload = { ...values, status };
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

    const newVariants: TProductVariant[] = combinations.map((combo, i) => ({
      sku: `${baseSku}-${i + 1}`,
      price: basePrice,
      stock: baseStock,
      options: combo,
    }));

    replaceVariants(newVariants);
    toast.success(`Đã tự động tạo ${newVariants.length} biến thể!`);
  };

  const applyFashionPreset = () => {
    replaceOptions([
      { name: "Màu sắc", values: ["Đen", "Trắng"] },
      { name: "Kích thước", values: ["S", "M", "L"] },
    ]);
    toast.success("Đã áp dụng mẫu Thời trang!");
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

  const handleRemoveOptionValue = (optIndex: number, valToRemove: string) => {
    const currentOpt = form.getValues(`options.${optIndex}`);
    if (!currentOpt) return;
    const currentValues = currentOpt.values || [];

    updateOption(optIndex, {
      name: currentOpt.name || "",
      values: currentValues.filter((v) => v !== valToRemove),
    });
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
                          <FormLabel>Mô tả chi tiết</FormLabel>
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
                        <FormItem className="sm:col-span-2">
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Số lượng kho mặc định{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="20"
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
                  </CardContent>
                </Card>
              </div>

              {/* Cột phải: Ảnh và Phân loại */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hình ảnh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {currentImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-2/3 rounded-md overflow-hidden border bg-muted group"
                          >
                            <img
                              src={resolveImageUrl(img)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      onClick={() => {
                        const nextSample =
                          SAMPLE_UPLOADS.find(
                            (s) => !currentImages.includes(s)
                          ) || SAMPLE_UPLOADS[0];
                        handleAddImage(nextSample);
                      }}
                      className="border-2 border-dashed border-border rounded-lg p-5 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <UploadCloud className="h-7 w-7 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">
                        Nhấn để thêm ảnh mẫu nhanh
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hoặc dán đường dẫn URL hình ảnh bên dưới
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="URL ảnh (https://...)"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleAddImage(imageInput)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Phân loại</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
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
                                  {categories.find((c) => c.slug === field.value)
                                    ?.name || field.value || "Chọn danh mục"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.parentName
                                      ? `${cat.parentName} › ${cat.name}`
                                      : cat.name}
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
                      )}
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
                        {optionFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="p-4 border rounded-lg bg-card relative group"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeOption(index)}
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </Button>

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
                                <Label>Giá trị (Nhấn Enter để thêm)</Label>
                                <Input
                                  placeholder="VD: Đỏ, Xanh... rồi ấn Enter"
                                  onKeyDown={(e) =>
                                    handleAddOptionValue(index, e)
                                  }
                                />

                                {(() => {
                                  const currentName = form.watch(
                                    `options.${index}.name`
                                  );
                                  if (
                                    !currentName ||
                                    !suggestions.values[currentName]
                                  )
                                    return null;
                                  return (
                                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                      {suggestions.values[currentName].map(
                                        (sugg: string) => (
                                          <Badge
                                            key={sugg}
                                            variant="outline"
                                            className="cursor-pointer text-[10px] py-0 px-1.5 hover:bg-muted font-normal text-muted-foreground"
                                            onClick={() =>
                                              handleQuickAddValue(index, sugg)
                                            }
                                          >
                                            + {sugg}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  );
                                })()}

                                {(form.watch(`options.${index}.values`) || [])
                                  .length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3 p-2 bg-muted/50 rounded-md border min-h-[42px]">
                                    {(
                                      form.watch(`options.${index}.values`) ||
                                      []
                                    ).map((val, vIdx) => (
                                      <Badge
                                        key={vIdx}
                                        variant="secondary"
                                        className="pl-3 pr-1 py-1 flex items-center gap-1 font-medium"
                                      >
                                        {val}
                                        <div
                                          className="h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer ml-1"
                                          onClick={() =>
                                            handleRemoveOptionValue(index, val)
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                        </div>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                      <div className="border rounded-md divide-y overflow-hidden">
                        <div className="bg-muted/50 p-4 hidden sm:flex items-center gap-4 text-sm font-semibold">
                          <div className="flex-1">Phân loại</div>
                          <div className="w-28">Giá bán</div>
                          <div className="w-20">Kho</div>
                          <div className="w-32">SKU</div>
                          <div className="w-9"></div>
                        </div>

                        {variantFields.map((v, i) => (
                          <div
                            key={v.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex flex-1 items-center gap-3">
                              <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center border text-xs font-medium text-muted-foreground">
                                SKU
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {Object.values(
                                    form.watch(`variants.${i}.options`) || {}
                                  ).join(" / ")}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                              <FormField
                                control={form.control}
                                name={`variants.${i}.price`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    className="w-full sm:w-28 text-sm h-9"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`variants.${i}.stock`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    className="w-full sm:w-20 text-sm h-9"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`variants.${i}.sku`}
                                render={({ field }) => (
                                  <Input
                                    className="w-full sm:w-32 text-sm h-9"
                                    {...field}
                                  />
                                )}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-red-600 self-end sm:self-auto"
                                type="button"
                                onClick={() => removeVariant(i)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
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

