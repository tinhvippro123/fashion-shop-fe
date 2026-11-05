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
          color: var(--foreground);
          background-color: var(--card);
        }
        .rich-text-container .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: var(--border);
          background-color: color-mix(in oklch, var(--muted), transparent 40%);
        }
        .rich-text-container .ql-editor {
          min-height: 200px;
          color: var(--foreground);
        }
        .rich-text-container .ql-editor.ql-blank::before {
          color: var(--muted-foreground) !important;
          font-style: italic;
        }

        /* Toolbar SVG icons & text */
        .rich-text-container .ql-snow .ql-stroke {
          stroke: var(--foreground) !important;
        }
        .rich-text-container .ql-snow .ql-fill {
          fill: var(--foreground) !important;
        }
        .rich-text-container .ql-snow .ql-picker {
          color: var(--foreground) !important;
        }
        .rich-text-container .ql-snow .ql-picker-label {
          color: var(--foreground) !important;
          border-color: transparent !important;
        }

        /* Hover & active states */
        .rich-text-container .ql-snow.ql-toolbar button:hover,
        .rich-text-container .ql-snow.ql-toolbar button:focus,
        .rich-text-container .ql-snow.ql-toolbar button.ql-active,
        .rich-text-container .ql-snow .ql-picker-label:hover,
        .rich-text-container .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          color: var(--primary) !important;
        }
        .rich-text-container .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-container .ql-snow.ql-toolbar button:focus .ql-stroke,
        .rich-text-container .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .rich-text-container .ql-snow .ql-picker-label:hover .ql-stroke,
        .rich-text-container .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
          stroke: var(--primary) !important;
        }
        .rich-text-container .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-container .ql-snow.ql-toolbar button:focus .ql-fill,
        .rich-text-container .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .rich-text-container .ql-snow .ql-picker-label:hover .ql-fill,
        .rich-text-container .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
          fill: var(--primary) !important;
        }

        /* Dropdown options (Font, Size, Header...) */
        .rich-text-container .ql-snow .ql-picker-options {
          background-color: var(--popover) !important;
          color: var(--popover-foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
          padding: 4px;
        }
        .rich-text-container .ql-snow .ql-picker-item {
          color: var(--popover-foreground) !important;
        }
        .rich-text-container .ql-snow .ql-picker-item:hover {
          color: var(--primary) !important;
        }

        /* Tooltip popup (Link/Image URL) */
        .rich-text-container .ql-snow .ql-tooltip {
          background-color: var(--popover) !important;
          color: var(--popover-foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
        }
        .rich-text-container .ql-snow .ql-tooltip input[type="text"] {
          background-color: var(--card) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
}

