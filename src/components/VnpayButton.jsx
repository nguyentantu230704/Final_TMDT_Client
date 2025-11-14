import React, { useContext, useState } from "react";
import { UserContext } from "../App.jsx";
import api from '../api'
// import { useNavigate } from "react-router-dom";

const VnpayButton = ({ amount, address, onSuccess }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để thanh toán");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/vnpay/create_payment_url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({
          amount: Number(amount),
          address,
        }),
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl; // redirect sang VNPay
      } else {
        alert("Không tạo được đường dẫn thanh toán");
        console.log("VNPay response:", data);
      }
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  // React.useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const payment = params.get("payment");
  //   const orderId = params.get("orderId");

  //   if (payment === "success") {
  //     alert('Thanh toán VNPay thành công');
  //     onSuccess && onSuccess(orderId);
  //     navigate('/orders');
  //   } else if (payment === "fail") {
  //     alert('Thanh toán VNPay thất bại');
  //   }
  // }, []);

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white"
          }`}
      >
        {loading && (
          <svg
            className="w-5 h-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            ></path>
          </svg>
        )}
        {loading ? "Đang tạo thanh toán..." : "Thanh toán VNPay"}
      </button>
    </div>
  );
};

export default VnpayButton;
