"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "nam" | "nu" | "tre-em";

interface TableRowData {
  stt: number;
  label: string;
  values: string[];
}

interface SizeTableConfig {
  title: string;
  headers: string[];
  rows: TableRowData[];
  footerNote?: string;
}

const MEN_SIZE_TABLES: SizeTableConfig[] = [
  {
    title: "SIZE ÁO",
    headers: ["STT", "TÊN GỌI/SIZE", "S", "M", "L", "XL", "XXL"],
    rows: [
      { stt: 1, label: "Cổ", values: ["36", "38", "40", "42", "44"] },
      { stt: 2, label: "Vai", values: ["44", "45", "46", "47", "48"] },
      { stt: 3, label: "Ngực", values: ["90", "94", "98", "102", "106"] },
      { stt: 4, label: "Eo", values: ["88", "92", "96", "100", "104"] },
    ],
  },
  {
    title: "SIZE QUẦN",
    headers: ["STT", "TÊN GỌI/SIZE", "S(29)", "M(30)", "L(31)", "XL(32)", "XXL(33)"],
    rows: [
      { stt: 1, label: "Vòng Eo", values: ["76", "80", "84", "86", "90"] },
      { stt: 2, label: "Vòng Mông", values: ["91", "95", "99", "104", "109"] },
      { stt: 3, label: "Cân nặng (kg)", values: ["62 - 68", "68 - 70", "70 - 74", "74 - 78", "78 - 82"] },
      { stt: 4, label: "Chiều Cao (cm)", values: ["162 - 168", "168 - 172", "172 - 176", "176 - 180", "180 - 184"] },
    ],
  },
];

const WOMEN_SIZE_TABLES: SizeTableConfig[] = [
  {
    title: "SIZE VÁY ÁO NỮ",
    headers: ["STT", "TÊN GỌI/SIZE", "S", "M", "L", "XL", "XXL"],
    rows: [
      { stt: 1, label: "Vai", values: ["36", "37", "38", "39", "40"] },
      { stt: 2, label: "Ngực", values: ["82", "86", "90", "94", "98"] },
      { stt: 3, label: "Eo", values: ["66", "70", "74", "78", "82"] },
      { stt: 4, label: "Hông", values: ["90", "94", "98", "102", "106"] },
    ],
  },
  {
    title: "SIZE QUẦN",
    headers: ["STT", "TÊN GỌI/SIZE", "S(26)", "M(27)", "L(28)", "XL(29)", "XXL(30)"],
    rows: [
      { stt: 1, label: "Vòng Eo", values: ["66", "70", "74", "78", "82"] },
      { stt: 2, label: "Vòng Mông", values: ["90", "94", "98", "102", "106"] },
      { stt: 3, label: "Vòng Bụng", values: ["68", "72", "76", "80", "84"] },
      { stt: 4, label: "Dài Quần", values: ["96", "97", "99", "100", "101"] },
    ],
  },
];

const KIDS_SIZE_TABLES: SizeTableConfig[] = [
  {
    title: "SIZE VÁY ÁO Trẻ em",
    headers: ["STT", "CỠ / TUỔI", "4-5", "6-7", "8-9", "10-11", "12-13"],
    rows: [
      { stt: 1, label: "CHIỀU CAO (CM)", values: ["110", "122", "133", "150", "155"] },
      { stt: 2, label: "CÂN NẶNG (KG)", values: ["15-20", "20-25", "23-29", "28-35", "34-43"] },
      { stt: 3, label: "RỘNG VAI", values: ["29", "30", "31", "32", "33"] },
      { stt: 4, label: "VÒNG NGỰC", values: ["59", "65", "68", "74", "79"] },
      { stt: 5, label: "VÒNG BỤNG", values: ["54", "59", "62", "65", "69"] },
      { stt: 6, label: "VÒNG MÔNG", values: ["61", "66", "70", "75", "80"] },
      { stt: 7, label: "DÀI TAY", values: ["40", "43", "47", "50", "53"] },
      { stt: 8, label: "CHIỀU DÀI TỪ ĐŨNG ĐẾN ỐNG", values: ["42", "52", "59", "66", "72"] },
    ],
    footerNote: '* Số đo trong "BẢNG THÔNG SỐ" là số đo cơ thể không phải số đo quần áo',
  },
];

export default function SizeGuideModal({
  isOpen,
  onClose,
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("nam");

  if (!isOpen) return null;

  const tabs: { key: TabType; label: string }[] = [
    { key: "nam", label: "Nam" },
    { key: "nu", label: "Nữ" },
    { key: "tre-em", label: "Trẻ Em" },
  ];

  const renderTableSection = (tables: SizeTableConfig[]) => (
    <div className="space-y-8 animate-fadeIn">
      {tables.map((table, tIdx) => (
        <div key={tIdx}>
          <h4 className="font-bold text-[14px] sm:text-[15px] uppercase tracking-wide text-[#222] mb-3">
            {table.title}
          </h4>
          {/* Framed table box */}
          <div className="border border-[#dee2e6] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] sm:text-[14px] border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-[#dee2e6] bg-[#f8f9fa]">
                    {table.headers.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className={`py-3 px-3 font-semibold text-[#222] uppercase tracking-wider text-[12px] sm:text-[13px] ${
                          hIdx === 0
                            ? "w-[60px] text-center"
                            : hIdx === 1
                            ? "text-left pl-4 w-[220px]"
                            : "text-center"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rIdx) => (
                    <tr
                      key={row.stt}
                      className={`transition-colors hover:bg-gray-50/60 ${
                        rIdx < table.rows.length - 1 ? "border-b border-[#dee2e6]" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-gray-700 font-normal">
                        {row.stt}
                      </td>
                      <td className="py-3 px-3 text-left pl-4 text-gray-800 font-normal">
                        {row.label}
                      </td>
                      {row.values.map((val, vIdx) => (
                        <td
                          key={vIdx}
                          className="py-3 px-3 text-center text-gray-700 font-normal"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {table.footerNote && (
              <div className="p-3 text-[12px] sm:text-[13px] text-gray-700 font-medium border-t border-[#dee2e6] bg-[#fafafa]">
                {table.footerNote}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-[2px] transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col relative animate-fadeIn my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Đóng"
          className="absolute top-4 right-4 sm:top-5 sm:right-6 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="pt-6 sm:pt-8 pb-3 px-6 text-center">
          <h3 className="text-[18px] sm:text-[22px] font-bold uppercase text-[#111] tracking-wider">
            BẢNG TƯ VẤN SIZE
          </h3>
        </div>

        {/* Tab Headers */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2.5 text-[14px] sm:text-[15px] transition-all relative cursor-pointer ${
                    isActive
                      ? "text-black font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black"
                      : "text-gray-500 hover:text-black font-normal"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
          {activeTab === "nam" && renderTableSection(MEN_SIZE_TABLES)}
          {activeTab === "nu" && renderTableSection(WOMEN_SIZE_TABLES)}
          {activeTab === "tre-em" && renderTableSection(KIDS_SIZE_TABLES)}
        </div>
      </div>
    </div>
  );
}
