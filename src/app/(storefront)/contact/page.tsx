"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiRequestWithMeta } from "@/shared/lib/api";
import { useAuthStore } from "@/features/users/stores/auth.store";
import {
  VN_NAME_ERROR,
  VN_PHONE_ERROR,
  isValidEmail,
  isValidVnName,
  isValidVnPhone,
  normalizeVnName,
  sanitizeVnPhone,
} from "@/shared/utils/validation";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Send } from "lucide-react";

const SUBJECT_PRESETS = [
  "Tư vấn chọn size & sản phẩm",
  "Hỗ trợ đơn hàng",
  "Đổi trả & Bảo hành",
  "Hợp tác & Góp ý",
  "Khác",
];

export default function ContactPage() {
  const { user } = useAuthStore();

  const [fullNameInput, setFullNameInput] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>(SUBJECT_PRESETS[0]);
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const fullName = fullNameInput ?? (user?.fullName || user?.name || "");
  const email = emailInput ?? (user?.email || "");
  const phone = phoneInput ?? (user?.phone || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidVnName(fullName)) {
      toast.error(VN_NAME_ERROR);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ (tối đa 100 ký tự)");
      return;
    }
    if (phone.trim() && !isValidVnPhone(phone)) {
      toast.error(VN_PHONE_ERROR);
      return;
    }
    if (subject.trim().length < 3 || subject.trim().length > 100) {
      toast.error("Chủ đề liên hệ phải từ 3 đến 100 ký tự");
      return;
    }
    if (message.trim().length < 10 || message.trim().length > 1000) {
      toast.error("Nội dung liên hệ phải từ 10 đến 1000 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      const { message: serverMsg } = await apiRequestWithMeta("/contact", {
        method: "POST",
        body: JSON.stringify({
          fullName: normalizeVnName(fullName),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      toast.success(
        serverMsg ||
          "Đã gửi liên hệ thành công! Chúng tôi sẽ phản hồi qua email sớm nhất."
      );
      setSubmittedEmail(email.trim());
      setMessage("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể gửi liên hệ lúc này, vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-[70px]">
      {/* Breadcrumb */}
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto">
        <div className="text-[13px] font-normal text-[#6c757d] border-b border-[#f0f0f0] py-[16px] mb-[36px] flex flex-wrap items-center">
          <Link
            href="/"
            className="text-[#6c757d] hover:text-[#000] transition-colors"
          >
            Trang chủ
          </Link>
          <span className="mx-[8px] text-[#999]">-</span>
          <span className="text-[#221F20] font-medium">Liên hệ</span>
        </div>
      </div>

      {/* Header */}
      <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto">
        <div className="text-center max-w-[640px] mx-auto mb-[44px]">
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#221F20] tracking-[1px] uppercase mb-[10px]">
            Liên hệ với LUXE
          </h1>
          <p className="text-[14px] text-[#6c6d70] leading-[22px]">
            Bạn cần tư vấn chọn size, hỗ trợ đơn hàng hoặc góp ý dịch vụ? Hãy để
            lại lời nhắn — đội ngũ LUXE Fashion sẽ phản hồi trực tiếp qua email
            của bạn.
          </p>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] lg:gap-[48px] items-start">
          {/* Left Column: Store Information & Map */}
          <div className="lg:col-span-5 space-y-[24px]">
            <div className="border border-[#e5e5e5] rounded-[8px] p-[24px] sm:p-[28px] bg-white space-y-[20px]">
              <h2 className="text-[16px] font-semibold uppercase tracking-[0.8px] text-[#221F20] pb-[12px] border-b border-[#f0f0f0]">
                Thông tin showroom & CSKH
              </h2>

              <div className="space-y-[18px] text-[14px]">
                <div className="flex items-start gap-[14px]">
                  <MapPin
                    className="w-[18px] h-[18px] text-[#221F20] shrink-0 mt-[2px]"
                    strokeWidth={1.6}
                  />
                  <div>
                    <div className="font-semibold text-[#221F20] mb-[2px]">
                      Showroom chính
                    </div>
                    <p className="text-[#6c6d70] leading-[21px]">
                      68 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-[14px]">
                  <Phone
                    className="w-[18px] h-[18px] text-[#221F20] shrink-0 mt-[2px]"
                    strokeWidth={1.6}
                  />
                  <div>
                    <div className="font-semibold text-[#221F20] mb-[2px]">
                      Hotline tư vấn
                    </div>
                    <a
                      href="tel:18002026"
                      className="text-[#6c6d70] hover:text-[#000] transition-colors"
                    >
                      1800 2026 (Miễn phí)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-[14px]">
                  <Mail
                    className="w-[18px] h-[18px] text-[#221F20] shrink-0 mt-[2px]"
                    strokeWidth={1.6}
                  />
                  <div>
                    <div className="font-semibold text-[#221F20] mb-[2px]">
                      Email hỗ trợ
                    </div>
                    <a
                      href="mailto:cskh@luxe.vn"
                      className="text-[#6c6d70] hover:text-[#000] transition-colors"
                    >
                      cskh@luxe.vn
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-[14px]">
                  <Clock
                    className="w-[18px] h-[18px] text-[#221F20] shrink-0 mt-[2px]"
                    strokeWidth={1.6}
                  />
                  <div>
                    <div className="font-semibold text-[#221F20] mb-[2px]">
                      Giờ mở cửa
                    </div>
                    <p className="text-[#6c6d70]">
                      08:30 – 22:00 (Thứ 2 – Chủ nhật, kể cả ngày lễ)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="border border-[#e5e5e5] rounded-[8px] overflow-hidden bg-[#f8f8f8] aspect-[16/10]">
              <iframe
                title="Bản đồ LUXE Fashion Showroom"
                src="https://www.google.com/maps?q=68+Nguyen+Hue,+Quan+1,+Ho+Chi+Minh&output=embed"
                className="w-full h-full border-0 grayscale-[20%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="border border-[#e5e5e5] rounded-[8px] p-[24px] sm:p-[36px] bg-white">
              <h2 className="text-[18px] font-semibold text-[#221F20] mb-[6px]">
                Gửi tin nhắn cho chúng tôi
              </h2>
              <p className="text-[13px] text-[#6c6d70] mb-[24px]">
                Mọi yêu cầu sẽ được tiếp nhận trực tiếp vào hệ thống CSKH và
                phản hồi qua email của bạn.
              </p>

              {submittedEmail && (
                <div className="mb-[24px] border border-[#e5e5e5] border-l-[3px] border-l-[#221F20] bg-[#fafafa] rounded-[6px] p-[16px] flex items-start gap-[12px]">
                  <CheckCircle2
                    className="w-[18px] h-[18px] text-[#16a34a] shrink-0 mt-[2px]"
                    strokeWidth={2}
                  />
                  <div className="text-[13px] text-[#333] leading-[20px]">
                    <div className="font-semibold text-[#221F20] mb-[2px]">
                      Đã tiếp nhận yêu cầu hỗ trợ của bạn
                    </div>
                    <p className="text-[#555]">
                      Email xác nhận đã được gửi tới{" "}
                      <strong className="text-[#221F20]">
                        {submittedEmail}
                      </strong>
                      . Đội ngũ LUXE Fashion sẽ phản hồi trong vòng 24 giờ làm
                      việc.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-[18px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                  <div>
                    <label
                      htmlFor="contact-fullname"
                      className="block text-[13px] font-medium text-[#221F20] mb-[6px]"
                    >
                      Họ và tên <span className="text-[#e10600]">*</span>
                    </label>
                    <input
                      id="contact-fullname"
                      type="text"
                      required
                      minLength={2}
                      maxLength={50}
                      value={fullName}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder="Nhập họ tên của bạn"
                      className="w-full h-[44px] px-[14px] text-[14px] text-[#221F20] border border-[#d8d8d8] rounded-[4px] outline-none focus:border-[#221F20] transition-colors bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-[13px] font-medium text-[#221F20] mb-[6px]"
                    >
                      Số điện thoại{" "}
                      <span className="text-[12px] font-normal text-[#888]">
                        (không bắt buộc)
                      </span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) =>
                        setPhoneInput(sanitizeVnPhone(e.target.value))
                      }
                      placeholder="VD: 0901234567 (10 số)"
                      className="w-full h-[44px] px-[14px] text-[14px] text-[#221F20] border border-[#d8d8d8] rounded-[4px] outline-none focus:border-[#221F20] transition-colors bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[13px] font-medium text-[#221F20] mb-[6px]"
                    >
                      Email nhận phản hồi{" "}
                      <span className="text-[#e10600]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={100}
                      value={email}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full h-[44px] px-[14px] text-[14px] text-[#221F20] border border-[#d8d8d8] rounded-[4px] outline-none focus:border-[#221F20] transition-colors bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-[13px] font-medium text-[#221F20] mb-[6px]"
                    >
                      Chủ đề liên hệ <span className="text-[#e10600]">*</span>
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-[44px] px-[12px] text-[14px] text-[#221F20] border border-[#d8d8d8] rounded-[4px] outline-none focus:border-[#221F20] transition-colors bg-white"
                    >
                      {SUBJECT_PRESETS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-[6px]">
                    <label
                      htmlFor="contact-message"
                      className="block text-[13px] font-medium text-[#221F20]"
                    >
                      Nội dung chi tiết <span className="text-[#e10600]">*</span>
                    </label>
                    <span className="text-[11px] text-[#888]">
                      {message.length}/1000 ký tự
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    required
                    rows={6}
                    minLength={10}
                    maxLength={1000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                    placeholder="Mô tả câu hỏi của bạn (kèm mã đơn hàng hoặc chiều cao, cân nặng nếu cần tư vấn size)..."
                    className="w-full px-[14px] py-[12px] text-[14px] text-[#221F20] border border-[#d8d8d8] rounded-[4px] outline-none focus:border-[#221F20] transition-colors bg-white resize-y"
                  />
                </div>

                <div className="pt-[4px]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-[8px] w-full sm:w-auto min-w-[210px] h-[46px] px-[28px] bg-[#221F20] text-white text-[13px] font-semibold uppercase tracking-[1px] rounded-tl-[16px] rounded-br-[16px] border border-[#221F20] hover:bg-white hover:text-[#221F20] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-[15px] h-[15px]" strokeWidth={1.8} />
                    <span>
                      {submitting ? "Đang gửi..." : "Gửi yêu cầu liên hệ"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
