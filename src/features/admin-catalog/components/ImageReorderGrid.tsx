"use client";

import React, { useState } from "react";
import { resolveImageUrl } from "@/shared/utils/format";
import { ChevronLeft, ChevronRight, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface ImageReorderGridProps {
  images: string[];
  onReorder: (newImages: string[]) => void;
  onRemove: (imageUrl: string) => void;
  colorName?: string;
  isDefaultColor?: boolean;
}

export function ImageReorderGrid({
  images,
  onReorder,
  onRemove,
  colorName,
}: ImageReorderGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleSetAvatar = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    const reordered = [target, ...remaining];
    onReorder(reordered);
    toast.success(
      colorName
        ? `Đã đặt làm ảnh chính cho màu ${colorName}`
        : "Đã đặt làm ảnh chính sản phẩm"
    );
  };

  const handleSetHover = (index: number) => {
    if (index === 1 || images.length < 2) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    const reordered = [remaining[0], target, ...remaining.slice(1)];
    onReorder(reordered);
    toast.success(
      colorName
        ? `Đã đặt làm ảnh hover cho màu ${colorName}`
        : "Đã đặt làm ảnh hover sản phẩm"
    );
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const reordered = [...images];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    onReorder(reordered);
  };

  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const reordered = [...images];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    onReorder(reordered);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onReorder(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        <span className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 text-muted-foreground/70" />
          Kéo thả để sắp xếp thứ tự, hoặc rê chuột vào ảnh để chọn ảnh chính / ảnh hover.
        </span>
        <span className="font-medium text-foreground/80">{images.length} ảnh</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((imgUrl, imgIdx) => {
          const isDragging = draggedIndex === imgIdx;
          const isDragOver = dragOverIndex === imgIdx && draggedIndex !== imgIdx;

          return (
            <div
              key={`${imgUrl}-${imgIdx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, imgIdx)}
              onDragOver={(e) => handleDragOver(e, imgIdx)}
              onDragLeave={() => handleDragLeave(imgIdx)}
              onDrop={(e) => handleDrop(e, imgIdx)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-3/4 rounded-md overflow-hidden border bg-muted group cursor-grab active:cursor-grabbing transition-all select-none ${
                isDragging
                  ? "opacity-40 scale-95 border-dashed border-foreground"
                  : isDragOver
                  ? "ring-2 ring-foreground ring-offset-2 border-foreground"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(imgUrl)}
                alt={colorName ? `${colorName} ${imgIdx + 1}` : `Ảnh ${imgIdx + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />

              {/* Top Left: Index + Role badge (always visible, never collides with bottom controls) */}
              <div
                className={`absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium z-10 flex items-center gap-1 pointer-events-none shadow-2xs ${
                  imgIdx === 0
                    ? "bg-neutral-900/90 text-white"
                    : imgIdx === 1
                    ? "bg-white/95 text-neutral-900 border border-neutral-300"
                    : "bg-white/90 text-neutral-800 border border-neutral-200/80"
                }`}
                title="Kéo thả đổi vị trí"
              >
                <GripVertical
                  className={`h-2.5 w-2.5 shrink-0 ${
                    imgIdx === 0 ? "text-white/75" : "text-neutral-500"
                  }`}
                />
                <span className="font-mono">#{imgIdx + 1}</span>
                {imgIdx === 0 && <span>· Chính</span>}
                {imgIdx === 1 && <span>· Hover</span>}
              </div>

              {/* Top Right: Delete button (always visible on touch devices, hover-reveal on mouse) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(imgUrl);
                }}
                className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-neutral-900 hover:text-white text-neutral-700 border border-neutral-200/80 rounded-full p-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-all z-20 shadow-2xs cursor-pointer"
                title="Xóa ảnh này"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Action Overlay: always accessible on touch devices, hover-reveal on desktop mouse */}
              <div
                className="absolute inset-x-0 bottom-0 p-1.5 pt-5 bg-gradient-to-t from-black/80 via-black/45 to-transparent flex flex-col gap-1 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Row 1: Set Primary / Hover */}
                {(imgIdx !== 0 || images.length >= 2) && (
                  <div className="flex items-center gap-1 w-full">
                    {imgIdx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetAvatar(imgIdx)}
                        className="flex-1 bg-white hover:bg-neutral-100 text-neutral-900 px-1.5 py-1 rounded text-[10px] font-medium text-center truncate cursor-pointer transition-colors"
                        title="Đặt làm ảnh chính (vị trí #1)"
                      >
                        Đặt chính
                      </button>
                    )}

                    {imgIdx !== 1 && images.length >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleSetHover(imgIdx)}
                        className="flex-1 bg-neutral-900/90 hover:bg-black text-white border border-white/25 px-1.5 py-1 rounded text-[10px] font-medium text-center truncate cursor-pointer transition-colors"
                        title="Đặt làm ảnh hover (vị trí #2)"
                      >
                        Đặt hover
                      </button>
                    )}
                  </div>
                )}

                {/* Row 2: Move Left / Right */}
                {images.length > 1 && (
                  <div className="flex items-center justify-between gap-1 w-full">
                    <button
                      type="button"
                      disabled={imgIdx === 0}
                      onClick={() => handleMoveLeft(imgIdx)}
                      className="flex-1 flex items-center justify-center bg-white/15 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white py-0.5 rounded cursor-pointer transition-colors"
                      title="Dịch sang trái"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={imgIdx === images.length - 1}
                      onClick={() => handleMoveRight(imgIdx)}
                      className="flex-1 flex items-center justify-center bg-white/15 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white py-0.5 rounded cursor-pointer transition-colors"
                      title="Dịch sang phải"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
