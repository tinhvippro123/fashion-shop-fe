"use client";

import React, { useState } from "react";
import { resolveImageUrl } from "@/shared/utils/format";
import { Badge } from "@/shared/ui/badge";
import { Star, Eye, ChevronLeft, ChevronRight, X, GripVertical } from "lucide-react";
import { toast } from "react-toastify";

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
        ? `Đã chọn làm Ảnh đại diện cho màu ${colorName}!`
        : "Đã chọn làm Ảnh đại diện sản phẩm!"
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
        ? `Đã chọn làm Ảnh hover khi lướt chuột cho màu ${colorName}!`
        : "Đã chọn làm Ảnh hover khi lướt chuột!"
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        <span className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 text-muted-foreground/70" />
          Kéo thả chuột để đổi vị trí, hoặc dùng các nút thao tác nhanh bên dưới:
        </span>
        <span className="font-medium text-foreground/80">{images.length} ảnh</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
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
              className={`relative aspect-2/3 rounded-md overflow-hidden border bg-muted group cursor-grab active:cursor-grabbing transition-all select-none ${
                isDragging
                  ? "opacity-40 scale-95 border-dashed border-primary"
                  : isDragOver
                  ? "ring-2 ring-primary ring-offset-2 scale-102 border-primary"
                  : "hover:shadow-md hover:border-foreground/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(imgUrl)}
                alt={colorName ? `${colorName} ${imgIdx + 1}` : `Ảnh ${imgIdx + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />

              {/* Top Left: Drag handle badge */}
              <div
                className="absolute top-1 left-1 bg-black/60 text-white/90 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center pointer-events-none shadow"
                title="Kéo thả đổi vị trí"
              >
                <GripVertical className="h-3 w-3" />
              </div>

              {/* Top Right: Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(imgUrl);
                }}
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-20 shadow cursor-pointer"
                title="Xóa ảnh này"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Bottom Badge: Avatar / Hover / Index */}
              {imgIdx === 0 ? (
                <Badge className="absolute bottom-1.5 left-1.5 bg-black/90 text-amber-300 text-[10px] px-1.5 py-0.5 border border-amber-400/40 shadow-md flex items-center gap-1 font-semibold pointer-events-none z-10">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  <span>Ảnh đại diện</span>
                </Badge>
              ) : imgIdx === 1 ? (
                <Badge className="absolute bottom-1.5 left-1.5 bg-blue-900/90 text-blue-200 text-[10px] px-1.5 py-0.5 border border-blue-400/40 shadow-md flex items-center gap-1 font-semibold pointer-events-none z-10">
                  <Eye className="h-3 w-3 text-blue-300" />
                  <span>Ảnh hover</span>
                </Badge>
              ) : (
                <span className="absolute bottom-1.5 left-1.5 bg-black/65 text-white/90 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none z-10">
                  #{imgIdx + 1}
                </span>
              )}

              {/* Action Toolbar on Hover */}
              <div
                className="absolute inset-x-1 bottom-7 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {imgIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(imgIdx)}
                    className="bg-black/80 hover:bg-black text-white p-1 rounded text-xs shadow-md transition-transform hover:scale-110 cursor-pointer"
                    title="Dịch sang trái"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                )}

                {imgIdx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetAvatar(imgIdx)}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-1.5 py-1 rounded text-[10px] font-medium flex items-center gap-0.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
                    title="Đặt làm Ảnh đại diện (đưa lên vị trí #1)"
                  >
                    <Star className="h-3 w-3 fill-white" />
                    <span>Đại diện</span>
                  </button>
                )}

                {imgIdx !== 1 && images.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => handleSetHover(imgIdx)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-1.5 py-1 rounded text-[10px] font-medium flex items-center gap-0.5 shadow-md transition-transform hover:scale-105 cursor-pointer"
                    title="Đặt làm Ảnh hover khi lướt chuột (đưa vào vị trí #2)"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Hover</span>
                  </button>
                )}

                {imgIdx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveRight(imgIdx)}
                    className="bg-black/80 hover:bg-black text-white p-1 rounded text-xs shadow-md transition-transform hover:scale-110 cursor-pointer"
                    title="Dịch sang phải"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
