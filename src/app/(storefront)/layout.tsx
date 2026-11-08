import Header from "@/shared/storefront-layouts/Header";
import Footer from "@/shared/storefront-layouts/Footer";
import MiniCart from "@/features/cart-and-order/components/cart/MiniCart";
import SuccessModal from "@/features/cart-and-order/components/cart/SuccessModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront-theme flex flex-col min-h-screen">
      <Header />
      <main className="min-h-[50vh] flex-1">{children}</main>
      <Footer />
      <MiniCart />
      <SuccessModal />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        style={{ zIndex: 999999 }}
        className="!z-[999999]"
      />
    </div>
  );
}

