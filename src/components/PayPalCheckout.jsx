import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';

export default function PayPalCheckout({ onSuccess }) {
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;
    
    const createOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để thanh toán.');
            throw new Error('No token');
        }
        try {
            const response = await fetch(`${API_URL}/payment/create-paypal-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });
            if (!response.ok) {
                const err = await response.text();
                alert('Không thể tạo đơn PayPal: ' + err);
                throw new Error('Create order failed: ' + err);
            }
            const data = await response.json();
            const orderId = data.paypalOrder?.id;
            if (!orderId) {     
                alert('Không nhận được orderId từ server.');
                throw new Error('No orderId');
            }
            return orderId;
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            throw error;
        }
    };

    const onApprove = async (data) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để thanh toán.');
            throw new Error('No token');
        }
        try {
            const response = await fetch(`${API_URL}/payment/capture-paypal-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({
                    orderID: data.orderID
                })
            });
            if (!response.ok) {
                const err = await response.text();
                alert('Không thể xác nhận thanh toán PayPal: ' + err);
                throw new Error('Capture payment failed: ' + err);
            }
            const result = await response.json();
            if (result.status === 'COMPLETED') {
                onSuccess && onSuccess();
                navigate('/account');
            } else {
                alert('Thanh toán PayPal chưa hoàn tất.');
            }
        } catch (error) {
            console.error('Error capturing PayPal payment:', error);
            throw error;
        }
    };

    return (
        <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            style={{ layout: "horizontal" }}
        />
    );
}
