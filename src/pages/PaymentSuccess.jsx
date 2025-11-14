import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null); // lưu thông tin order
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`, {
        headers: {
          "x-access-token": token, // hoặc "Authorization": `Bearer ${token}`
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [orderId]);

  const handleReturn = (target) => {
    if (target === "home") navigate("/");
    else if (target === "shopping") navigate("/products");
  };

  if (loading) return <p>Đang tải thông tin đơn hàng...</p>;

  return (
    <main>
      <h1>Thanh toán thành công</h1>
      <h2>Mã đơn hàng của bạn là: {orderId}</h2>

      {order ? (
        <div>
          <p>Khách hàng: {order.customerName}</p>
          <p>Địa chỉ: {order.address}</p>
          <p>Tổng tiền: {order.amount}</p>
          <h3>Danh sách sản phẩm:</h3>
          <ul>
            {order.products.map((p) => (
              <li key={p.productID}>
                {p.name} x {p.quantity} - {p.price}đ
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Không tìm thấy thông tin đơn hàng.</p>
      )}

      <button onClick={() => handleReturn("home")}>Trở về trang chủ</button>
      <button onClick={() => handleReturn("shopping")}>
        Tiếp tục mua sắm?
      </button>
    </main>
  );
}
