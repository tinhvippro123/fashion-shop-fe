"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { apiFetch } from "@/shared/lib/api";

export default function ContactPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isAuthenticated
      ? user?.fullName || user?.name || "Khách hàng LUXE"
      : fullName.trim();
    const finalEmail = isAuthenticated
      ? user?.email || "khachhang@luxe.vn"
      : email.trim();
    const finalPhone = isAuthenticated ? user?.phone || "" : phone.trim();

    setSubmitting(true);
    try {
      await apiFetch("/contacts", {
        method: "POST",
        body: JSON.stringify({
          fullName: finalName,
          email: finalEmail,
          phone: finalPhone,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      toast.success("Tin nhắn của bạn đã được gửi tới LUXE Fashion!");
      setFullName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-luxe px-[15px] min-[1200px]:px-[85px] mx-auto mt-[30px] mb-[80px] font-['Montserrat',sans-serif]">
      {/* Breadcrumb */}
      <div className="mb-[30px] text-[15px] font-medium flex items-center gap-[8px]">
        <Link
          href="/"
          className="text-[#666] hover:text-[#222] transition-colors"
        >
          Trang chủ
        </Link>
        <span className="text-[#999]">-</span>
        <span className="text-[#666]">Liên hệ</span>
      </div>

      {/* Banner */}
      <div className="mb-[40px] lg:mb-[60px] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/client/img/bg_contact.jpg"
          alt="Banner Liên hệ"
          className="w-full object-cover max-h-[400px]"
          style={{ borderRadius: "80px 0 80px 0" }}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-[30px]">
        {/* Left: Info Cards */}
        <div className="w-full lg:w-4/12 flex flex-col gap-[24px]">
          <div
            className="flex items-center p-[24px] border border-[#e1e1e1] bg-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] hover:-translate-y-[2px]"
            style={{ borderRadius: "40px 0 0 0" }}
          >
            <div className="w-[80px] h-[80px] rounded-full bg-[#f8f9fa] flex items-center justify-center shrink-0 mr-[24px]">
              <i className="fas fa-map-marker-alt text-[#666] text-[20px]"></i>
            </div>
            <div>
              <h6 className="font-bold mb-[8px] text-[#222] text-[16px]">
                Địa chỉ
              </h6>
              <p className="text-[#6c6d70] text-[14px] leading-[1.6]">
                Tầng 14, Tòa nhà Hapulico Complex 24T- 85 Vũ Trọng Phụng - Quận
                Thanh Xuân, HN
              </p>
            </div>
          </div>

          <div className="flex items-center p-[24px] border border-[#e1e1e1] bg-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] hover:-translate-y-[2px]">
            <div className="w-[80px] h-[80px] rounded-full bg-[#f8f9fa] flex items-center justify-center shrink-0 mr-[24px]">
              <i className="fas fa-envelope text-[#666] text-[20px]"></i>
            </div>
            <div>
              <h6 className="font-bold mb-[8px] text-[#222] text-[16px]">
                Email
              </h6>
              <p className="text-[#6c6d70] text-[14px] leading-[1.6]">
                cskh@luxe.com.vn
              </p>
            </div>
          </div>

          <div className="flex items-center p-[24px] border border-[#e1e1e1] bg-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] hover:-translate-y-[2px]">
            <div className="w-[80px] h-[80px] rounded-full bg-[#f8f9fa] flex items-center justify-center shrink-0 mr-[24px]">
              <i className="fas fa-phone-alt text-[#666] text-[20px]"></i>
            </div>
            <div>
              <h6 className="font-bold mb-[8px] text-[#222] text-[16px]">
                Mua hàng online
              </h6>
              <p className="text-[#6c6d70] text-[14px] leading-[1.6]">
                0246 662 3434
              </p>
            </div>
          </div>

          <div
            className="flex items-center p-[24px] border border-[#e1e1e1] bg-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.05)] hover:-translate-y-[2px]"
            style={{ borderRadius: "0 0 40px 0" }}
          >
            <div className="w-[80px] h-[80px] rounded-full bg-[#f8f9fa] flex items-center justify-center shrink-0 mr-[24px]">
              <i className="fas fa-headset text-[#666] text-[20px]"></i>
            </div>
            <div>
              <h6 className="font-bold mb-[8px] text-[#222] text-[16px]">
                Chăm sóc khách hàng
              </h6>
              <p className="text-[#6c6d70] text-[14px] leading-[1.6]">
                Email: cskh@luxe.com.vn
                <br />
                Hotline: 0905 89 86 83
                <br />
                Thứ Hai đến Thứ Bảy, từ 8:00 đến 17:30
              </p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-8/12">
          <div
            className="p-[40px] lg:p-[48px] border border-[#f0f0f0] bg-white"
            style={{ borderRadius: "40px 0 40px 0" }}
          >
            <h4 className="font-bold mb-[12px] text-[24px] text-[#222]">
              Email to LUXE fashion
            </h4>
            <p className="text-[#6c6d70] text-[14px] leading-[1.6] mb-[32px]">
              Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của
              bạn. Hãy gửi nội dung bên dưới để đội ngũ CSKH phản hồi sớm nhất.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                {!isAuthenticated && (
                  <>
                    <div className="flex items-center border border-[#ced4da] rounded-[4px] focus-within:border-[#222] transition-colors h-[48px] overflow-hidden">
                      <div className="w-[48px] h-full flex items-center justify-center bg-white text-[#999] shrink-0">
                        <i className="far fa-user"></i>
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="flex-1 h-full outline-none text-[14px] text-[#222] pr-[15px]"
                        placeholder="Họ và tên"
                        required
                      />
                    </div>

                    <div className="flex items-center border border-[#ced4da] rounded-[4px] focus-within:border-[#222] transition-colors h-[48px] overflow-hidden">
                      <div className="w-[48px] h-full flex items-center justify-center bg-white text-[#999] shrink-0">
                        <i className="fas fa-phone-alt text-[14px]"></i>
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 h-full outline-none text-[14px] text-[#222] pr-[15px]"
                        placeholder="Điện thoại"
                        required
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 flex items-center border border-[#ced4da] rounded-[4px] focus-within:border-[#222] transition-colors h-[48px] overflow-hidden">
                      <div className="w-[48px] h-full flex items-center justify-center bg-white text-[#999] shrink-0">
                        <i className="far fa-envelope"></i>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 h-full outline-none text-[14px] text-[#222] pr-[15px]"
                        placeholder="Địa chỉ email"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="col-span-1 md:col-span-2 flex items-center border border-[#ced4da] rounded-[4px] focus-within:border-[#222] transition-colors h-[48px] overflow-hidden">
                  <div className="w-[48px] h-full flex items-center justify-center bg-white text-[#999] shrink-0">
                    <i className="far fa-file-alt"></i>
                  </div>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 h-full outline-none text-[14px] text-[#222] pr-[15px]"
                    placeholder="Chủ đề"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2 flex items-start border border-[#ced4da] rounded-[4px] focus-within:border-[#222] transition-colors overflow-hidden">
                  <div className="w-[48px] pt-[15px] flex justify-center bg-white text-[#999] shrink-0">
                    <i className="far fa-comment-dots text-[16px]"></i>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 outline-none text-[14px] text-[#222] p-[14px] pl-0 resize-y min-h-[120px]"
                    placeholder="Nội dung"
                    required
                  ></textarea>
                </div>

                <div className="col-span-1 md:col-span-2 mt-[8px]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#222] text-white px-[48px] py-[10px] text-[15px] font-medium uppercase hover:bg-white hover:text-[#222] border border-[#222] transition-colors disabled:opacity-60"
                    style={{ borderRadius: "20px 0 20px 0" }}
                  >
                    {submitting ? "ĐANG GỬI..." : "GỬI"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex flex-col lg:flex-row gap-[40px] mt-[60px] lg:mt-[80px] pt-[20px]">
        <div className="w-full lg:w-4/12 flex flex-col justify-center">
          <h3 className="font-bold mb-[24px] text-[32px] text-[#222]">
            Find us on Google Maps
          </h3>
          <p className="text-[#6c6d70] text-justify text-[15px] leading-[1.8]">
            LUXE Fashion là thương hiệu thời trang Việt Nam với mong muốn đem
            lại vẻ đẹp hiện đại và sự tự tin cho khách hàng, thông qua các dòng
            sản phẩm thời trang thể hiện cá tính và xu hướng. Một trong những
            &ldquo;tôn chỉ&rdquo; về thiết kế của LUXE Fashion chính là sự đa
            dạng, với mong muốn mang đến cho người mặc những sản phẩm phù hợp
            nhất với ngoại hình và quan trọng hơn cả là cá tính của chính mình.
          </p>
        </div>
        <div className="w-full lg:w-8/12">
          <div
            className="overflow-hidden border border-[#f0f0f0] shadow-[0_5px_15px_rgba(0,0,0,0.05)]"
            style={{ borderRadius: "40px 0 40px 0" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.7788390772427!2d105.8038753147627!3d21.00149798601322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135acbd365af3cb%3A0xc6bf31f4a9b57560!2zVGjhu51pIFRyYW5nIEl2eSBNb2Rh!5e0!3m2!1svi!2s!4v1655883296068!5m2!1svi!2s"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

