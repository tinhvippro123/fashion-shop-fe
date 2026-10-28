"use client";

import React, { useState } from "react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "nam" | "nu" | "tre-em";

export default function SizeGuideModal({
  isOpen,
  onClose,
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("nu");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex-1"></div>
          <h3 className="text-[20px] md:text-[24px] font-bold uppercase text-gray-900 tracking-wide text-center flex-1 whitespace-nowrap">
            BẢNG TƯ VẤN SIZE
          </h3>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <span className="text-[28px] leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 pt-0">
          <div className="flex flex-wrap justify-center mb-6">
            <button
              className={`px-4 py-2 font-bold text-[14px] lg:text-[15px] border-b-2 transition-colors ${
                activeTab === "nu"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("nu")}
            >
              Nữ
            </button>
            <button
              className={`px-4 py-2 font-bold text-[14px] lg:text-[15px] border-b-2 transition-colors ${
                activeTab === "nam"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("nam")}
            >
              Nam
            </button>
            <button
              className={`px-4 py-2 font-bold text-[14px] lg:text-[15px] border-b-2 transition-colors ${
                activeTab === "tre-em"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("tre-em")}
            >
              Trẻ em
            </button>
          </div>

          <div className="w-full">
            {activeTab === "nu" && (
              <div className="animate-fadeIn">
                <h6 className="font-bold mb-3 text-[15px] uppercase">
                  Size Váy Áo Nữ (cm)
                </h6>
                <div className="overflow-x-auto mb-6 border border-[#dee2e6]">
                  <table className="w-full text-[14px] text-center align-middle whitespace-nowrap min-w-[500px]">
                    <thead className="bg-[#f8f9fa]">
                      <tr>
                        <th className="p-2 border border-[#dee2e6]">THÔNG SỐ</th>
                        <th className="p-2 border border-[#dee2e6]">S</th>
                        <th className="p-2 border border-[#dee2e6]">M</th>
                        <th className="p-2 border border-[#dee2e6]">L</th>
                        <th className="p-2 border border-[#dee2e6]">XL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Vai</td>
                        <td className="p-2 border border-[#dee2e6]">36</td>
                        <td className="p-2 border border-[#dee2e6]">37</td>
                        <td className="p-2 border border-[#dee2e6]">38</td>
                        <td className="p-2 border border-[#dee2e6]">39</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Ngực</td>
                        <td className="p-2 border border-[#dee2e6]">82</td>
                        <td className="p-2 border border-[#dee2e6]">86</td>
                        <td className="p-2 border border-[#dee2e6]">90</td>
                        <td className="p-2 border border-[#dee2e6]">94</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Eo</td>
                        <td className="p-2 border border-[#dee2e6]">66</td>
                        <td className="p-2 border border-[#dee2e6]">70</td>
                        <td className="p-2 border border-[#dee2e6]">74</td>
                        <td className="p-2 border border-[#dee2e6]">78</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Hông</td>
                        <td className="p-2 border border-[#dee2e6]">90</td>
                        <td className="p-2 border border-[#dee2e6]">94</td>
                        <td className="p-2 border border-[#dee2e6]">98</td>
                        <td className="p-2 border border-[#dee2e6]">102</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "nam" && (
              <div className="animate-fadeIn">
                <h6 className="font-bold mb-3 text-[15px] uppercase">
                  Size Áo & Quần Nam (cm)
                </h6>
                <div className="overflow-x-auto mb-6 border border-[#dee2e6]">
                  <table className="w-full text-[14px] text-center align-middle whitespace-nowrap min-w-[500px]">
                    <thead className="bg-[#f8f9fa]">
                      <tr>
                        <th className="p-2 border border-[#dee2e6]">THÔNG SỐ</th>
                        <th className="p-2 border border-[#dee2e6]">S</th>
                        <th className="p-2 border border-[#dee2e6]">M</th>
                        <th className="p-2 border border-[#dee2e6]">L</th>
                        <th className="p-2 border border-[#dee2e6]">XL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Vòng ngực</td>
                        <td className="p-2 border border-[#dee2e6]">86-90</td>
                        <td className="p-2 border border-[#dee2e6]">90-94</td>
                        <td className="p-2 border border-[#dee2e6]">94-98</td>
                        <td className="p-2 border border-[#dee2e6]">98-102</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Vòng eo</td>
                        <td className="p-2 border border-[#dee2e6]">74-78</td>
                        <td className="p-2 border border-[#dee2e6]">78-82</td>
                        <td className="p-2 border border-[#dee2e6]">82-86</td>
                        <td className="p-2 border border-[#dee2e6]">86-90</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Cân nặng (kg)</td>
                        <td className="p-2 border border-[#dee2e6]">60-66</td>
                        <td className="p-2 border border-[#dee2e6]">66-72</td>
                        <td className="p-2 border border-[#dee2e6]">72-78</td>
                        <td className="p-2 border border-[#dee2e6]">78-84</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "tre-em" && (
              <div className="animate-fadeIn">
                <h6 className="font-bold mb-3 text-[15px] uppercase">
                  Size Trẻ Em
                </h6>
                <div className="overflow-x-auto mb-4 border border-[#dee2e6]">
                  <table className="w-full text-[14px] text-center align-middle whitespace-nowrap min-w-[500px]">
                    <thead className="bg-[#f8f9fa]">
                      <tr>
                        <th className="p-2 border border-[#dee2e6]">TUỔI</th>
                        <th className="p-2 border border-[#dee2e6]">4-5</th>
                        <th className="p-2 border border-[#dee2e6]">6-7</th>
                        <th className="p-2 border border-[#dee2e6]">8-9</th>
                        <th className="p-2 border border-[#dee2e6]">10-11</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Chiều cao (cm)</td>
                        <td className="p-2 border border-[#dee2e6]">110</td>
                        <td className="p-2 border border-[#dee2e6]">122</td>
                        <td className="p-2 border border-[#dee2e6]">133</td>
                        <td className="p-2 border border-[#dee2e6]">150</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#dee2e6] font-bold">Cân nặng (kg)</td>
                        <td className="p-2 border border-[#dee2e6]">15-20</td>
                        <td className="p-2 border border-[#dee2e6]">20-25</td>
                        <td className="p-2 border border-[#dee2e6]">23-29</td>
                        <td className="p-2 border border-[#dee2e6]">28-35</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

