"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-62.5 w-full border rounded-md flex items-center justify-center bg-muted/50 text-muted-foreground">
      Đang tải công cụ soạn thảo...
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  editorClassName,
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [
          { header: [1, 2, 3, 4, 5, 6, false] },
          { size: ["small", false, "large", "huge"] },
        ],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ direction: "rtl" }, { align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className={`rich-text-container ${className || ""}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "Nhập nội dung..."}
        className={editorClassName}
      />
      <style jsx global>{`
        .rich-text-container .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-color: var(--border);
          font-family: inherit;
          font-size: 0.875rem;
        }
        .rich-text-container .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: var(--border);
          background-color: color-mix(in oklch, var(--muted), transparent 50%);
        }
        .rich-text-container .ql-editor {
          min-height: 250px;
        }
      `}</style>
    </div>
  );
}

