"use client";

import React from "react";

const ACTIVE_STEPS = [
  { key: "PENDING", label: "Đơn hàng đã đặt" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao hàng" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

const STATUS_TIMELINE_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang chuẩn bị hàng",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Giao thành công",
  CANCELLED: "Đã hủy",
};

interface OrderTrackingTimelineProps {
  status: string;
  createdAt?: string;
  updatedAt?: string;
  cancelReason?: string | null;
  showVerticalDetails?: boolean;
}

export function OrderTrackingTimeline({
  status,
  createdAt,
  updatedAt,
  cancelReason,
  showVerticalDetails = true,
}: OrderTrackingTimelineProps) {
  const isCancelled = status === "CANCELLED";
  const activeStepIdx = isCancelled
    ? 0
    : Math.max(
        0,
        ACTIVE_STEPS.findIndex((s) => s.key === status)
      );

  return (
    <div>
      {/* Horizontal Progress Bar */}
      <div
        className="mb-[40px] border border-[#e1e1e1] px-[24px] lg:px-[48px] py-[28px]"
        style={{ borderRadius: "20px 0 20px 0" }}
      >
        <div className="w-full relative">
          {/* Base rail + active fill (exact center of 14px dots = 7px) */}
          <div className="absolute top-[6px] left-[7px] right-[7px] h-[2px] bg-[#e5e7eb] z-[1] overflow-hidden">
            <div
              className="h-full bg-[#222] transition-all duration-500 ease-out"
              style={{
                width: isCancelled
                  ? "100%"
                  : `${(activeStepIdx / (ACTIVE_STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex justify-between relative z-[2] min-h-[56px]">
            {isCancelled ? (
              <>
                {/* Dot 1: Placed (14px solid black) */}
                <div className="relative w-[14px] flex flex-col items-center">
                  <div className="w-[14px] h-[14px] box-border rounded-full bg-[#222] shrink-0" />
                  <div className="text-[12px] text-[#444] text-center leading-[1.35] absolute top-[24px] left-1/2 -translate-x-1/2 w-[90px]">
                    Đơn hàng đã đặt
                  </div>
                </div>

                {/* Dots 2, 3, 4: Same 14px diameter white dots on black rail */}
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="relative w-[14px] flex flex-col items-center"
                  >
                    <div className="w-[14px] h-[14px] box-border rounded-full bg-white border-[2px] border-[#e5e7eb] shrink-0" />
                  </div>
                ))}

                {/* Dot 5: Cancelled (14px solid black) */}
                <div className="relative w-[14px] flex flex-col items-center">
                  <div className="w-[14px] h-[14px] box-border rounded-full bg-[#222] shrink-0" />
                  <div className="text-[12px] text-[#444] text-center leading-[1.35] absolute top-[24px] left-1/2 -translate-x-1/2 w-max">
                    Đã hủy
                  </div>
                </div>
              </>
            ) : (
              ACTIVE_STEPS.map((step, idx) => {
                const reached = idx <= activeStepIdx;
                return (
                  <div
                    key={step.key}
                    className="relative w-[14px] flex flex-col items-center"
                  >
                    <div
                      className={`w-[14px] h-[14px] box-border rounded-full shrink-0 ${
                        reached
                          ? "bg-[#222]"
                          : "bg-white border-[2px] border-[#e1e1e1]"
                      }`}
                    />
                    <div
                      className={`text-[12px] leading-[1.35] absolute top-[24px] w-max ${
                        idx === 0
                          ? "left-[-4px] text-left"
                          : idx === ACTIVE_STEPS.length - 1
                          ? "right-[-4px] text-right"
                          : "left-1/2 -translate-x-1/2 text-center"
                      } ${
                        reached ? "text-[#222] font-medium" : "text-[#999]"
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Vertical Status Details */}
      {showVerticalDetails && (
        <div className="mb-[40px]">
          <h4 className="font-semibold text-[18px] text-[#222] mb-[26px]">
            Chi tiết trạng thái đơn hàng
          </h4>

          {isCancelled ? (
            <div className="pl-[4px]">
              {/* Dedicated rail wrapper so the black line stops precisely at the center of the last dot */}
              <div className="relative flex flex-col justify-between">
                <div className="absolute top-[10px] bottom-[10px] left-[6px] w-[2px] bg-[#222] z-[1]" />

                {/* Row 1: Đơn hàng đã đặt */}
                <div className="relative z-[2] flex items-center gap-[24px] h-[20px]">
                  <div className="w-[14px] h-[14px] box-border rounded-full bg-[#222] shrink-0" />
                  <div className="flex flex-wrap items-baseline gap-x-[36px] gap-y-1">
                    <span className="text-[14px] text-[#444] w-[160px]">
                      Đơn hàng đã đặt
                    </span>
                    <span className="text-[14px] text-[#6c6d70]">
                      {createdAt || "—"}
                    </span>
                  </div>
                </div>

                {/* 3 Intermediate equal-sized 14px dots centered directly on the rail */}
                <div className="relative z-[2] flex flex-col gap-[22px] py-[18px]">
                  {[1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="w-[14px] h-[14px] box-border rounded-full bg-[#e9e9eb] border border-white shrink-0"
                    />
                  ))}
                </div>

                {/* Row 2: Đã hủy (fixed single-line height so bottom-[10px] matches exact center of dot) */}
                <div className="relative z-[2] flex items-center gap-[24px] h-[20px]">
                  <div className="w-[14px] h-[14px] box-border rounded-full bg-[#222] shrink-0" />
                  <div className="flex flex-wrap items-baseline gap-x-[36px] gap-y-1">
                    <span className="text-[14px] text-[#444] w-[160px]">
                      Đã hủy
                    </span>
                    <span className="text-[14px] text-[#6c6d70]">
                      {updatedAt || createdAt || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason placed cleanly outside the rail wrapper so the line never extends below the last dot */}
              {cancelReason && (
                <p className="text-[13px] text-[#888] mt-2.5 pl-[38px] mb-0">
                  Lý do: {cancelReason}
                </p>
              )}
            </div>
          ) : (
            <div className="pl-[4px]">
              <div className="relative flex flex-col gap-[28px]">
                {status !== "PENDING" && (
                  <div className="absolute top-[10px] bottom-[10px] left-[6px] w-[2px] bg-[#222] z-[1]" />
                )}

                <div className="relative z-[2] flex items-center gap-[24px] h-[20px]">
                  <div className="w-[14px] h-[14px] box-border rounded-full bg-[#222] shrink-0" />
                  <div className="flex flex-wrap items-baseline gap-x-[36px] gap-y-1">
                    <span className="text-[14px] text-[#444] w-[160px]">
                      Đơn hàng đã đặt
                    </span>
                    <span className="text-[14px] text-[#6c6d70]">
                      {createdAt || "—"}
                    </span>
                  </div>
                </div>

                {status !== "PENDING" && (
                  <div className="relative z-[2] flex items-center gap-[24px] h-[20px]">
                    <div className="w-[14px] h-[14px] box-border rounded-full bg-[#222] shrink-0" />
                    <div className="flex flex-wrap items-baseline gap-x-[36px] gap-y-1">
                      <span className="text-[14px] text-[#222] font-medium w-[160px]">
                        {STATUS_TIMELINE_LABELS[status] || status}
                      </span>
                      <span className="text-[14px] text-[#6c6d70]">
                        {updatedAt || "Đã cập nhật trạng thái đơn hàng"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
