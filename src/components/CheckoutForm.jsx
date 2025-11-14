import React, { useState, useEffect } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import api from "../api";
import Button from "./Button";
import Loader from "./Loader";
import { X } from "react-feather";
import PayPalCheckout from "./PayPalCheckout";

//import mới
import VnpayButton from "./VnpayButton";

const initialPayPalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

export default function CheckoutForm({ onCancel, onSuccess }) {
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    (async () => {
      const resp = await api.proceedCheckout();
      if (resp.status !== "error") {
        setOrderDetails(resp.finalOrder);
      }
    })();
  }, []);

  return (
    <div>
      <section className="mb-6">
        {orderDetails?.amount && (
          <div className="flex justify-between text-lg mt-2">
            <h4 className="text-lg mb-2">Final Order</h4>
            <span className="font-bold text-xl">${orderDetails.amount}</span>
          </div>
        )}
        {orderDetails?.products?.length ? (
          <ul>
            {orderDetails.products.map((product) => (
              <CheckoutItem
                key={product.productID._id}
                title={product.productID.title}
                price={product.productID.price}
                quantity={product.quantity}
              />
            ))}
          </ul>
        ) : (
          <Loader color="bg-gray-600" />
        )}
      </section>

      {/* thêm thanh toán vnpay */}
      <VnpayButton
        amount={orderDetails.amount}
        address=""
        onSuccess={onSuccess}
      />

      <div className="mt-6">
        <PayPalScriptProvider options={initialPayPalOptions}>
          <PayPalCheckout onSuccess={onSuccess} />
        </PayPalScriptProvider>
        <Button className="w-full mt-4" secondary onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CheckoutItem({ title, price, quantity }) {
  return (
    <li className="flex justify-between">
      <p>{title}</p>
      <div className="flex justify-between items-center">
        {quantity > 1 && (
          <span className="inline-flex items-center text-gray-400 mr-5">
            <X className="" />
            {quantity}
          </span>
        )}
        <span className="text-lg font-light">${quantity * price}</span>
      </div>
    </li>
  );
}
