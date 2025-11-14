import React, { useContext, useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { ShoppingBag } from "react-feather"

import { CartContext, UserContext } from "@/App"
import CartList from "@/ui/CartList"
import CartSummary from "@/ui/CartSummary"
import Button from "@/components/Button"
import PageHeader from "@/components/PageHeader"
import api from "@/api"
import CheckoutModal from '../components/Checkout'

export default function CartPage() {
	const [showCheckoutModal, setShowCheckoutModal] = useState(false)
	const {user} = useContext(UserContext)
	const {cart, cartDispatch} = useContext(CartContext)
	const [loading, setLoading] = useState(false);

	// load cart tu server khi login
	useEffect(() => {
		if (!user) {
			return 
		}
		(async () => {
			try {
				const res = await api.getUserCart();
				if (res.products) {
					cartDispatch({ type: "SET_PRODUCTS", payload: res.products })
				}
			} catch (error) {
				console.error('Lỗi load giỏ hàng', error);
			}
		})();
	}, [user]);

	const setProductQuantity = async (id, quantity) => {
		if (quantity < 1) {
			cartDispatch({type: "REMOVE_PRODUCT", payload: id})
			if (user) api.removeProductFromCart(id)
		} else {
			cartDispatch({type: "SET_PRODUCT_QUANTITY", payload: {id, quantity}})
			if(user) api.patchCart(id, quantity)
		}
	}

	// const handleCreateOrder = async () => {
	// 	const resp = await api.createOrder(cart.products, cart.total, "abc street, abc city, abc state, abc zip")
	// 	if (resp.status === "ok") {
	// 		console.log(resp.orderID)
	// 		api.clearCart()
	// 		// cartDispatch({type: "CLEAR_CART"})
	// 	}
	// }

	const handleCreateOrder = async () => {
		if (!user) {
			alert('Bạn cần đăng nhập để thanh toán')
			return
		}
		setLoading(true)

		try {
			const address = "abc street, abc city, abc zip";
			const res = await api.createOrder(cart.products, cart.amount, cart.address);

			if (res.success) {
				// clear cuc bo
				cartDispatch({ type: "CLEAR_CART"})
				await api.clearCart();
				alert('Thanh toán thành công')
			} else {
				alert('Thanh toán thất bại' + res.message)
			}
		} catch (error) {
			console.error('Lỗi tạo đơn', error);
			alert('Có lỗi xảy ra khi tạo đơn hàng')
		} finally {
			setLoading(false)
		}
	};

	if (cart.products.length === 0) {
		return (
			<main className="h-screen flex flex-col items-center text-center my-14 p-4">
				<PageHeader>Your Shopping Cart is Empty</PageHeader>
				<Link to="/products">
					<Button link className="text-xl">
						<ShoppingBag className="mr-2" />
						Continue Shopping
					</Button>
				</Link>
			</main>
		)
	}

	return (
		<main className="my-14">
			<PageHeader>Your Shopping Cart</PageHeader>
			<section className="max-w-6xl mx-auto my-16 relative gap-8 flex flex-col p-4 md:(flex-row items-start)">
				<section className="flex-1 sm:min-w-md divide-y divide-gray-200 border border-gray-300 rounded shadow">
					{/* <CartList 
						items={cart.products} 
						setItemQuantity={(id, qty) => setProductQuantity(id, qty)}
					/>		 */}
					<CartList
						items={cart.products}
						setItemQuantity={setProductQuantity}
					/>
				</section>

				<section className="w-full md:w-auto border border-gray-300 rounded shadow py-4 md:(sticky top-20)">
					<CartSummary 
						onCheckout={() => setShowCheckoutModal(true)}
						subtotal={cart.total} 
						charges={[
							{name: "Shipping Charges", amount: 9},
						]}
						discounts={[
							{name: "Shipping Discount", amount: 9},
						]}
					/>
				</section>
			</section>

			{showCheckoutModal && 
				<CheckoutModal 
					onCancel={() => setShowCheckoutModal(false)} 
					onSuccess={handleCreateOrder}
				/>
			}
		</main>
	)
}