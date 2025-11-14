import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ShoppingCart, Share2 } from "react-feather";

import Button from "@/components/Button";
import Loader from "@/components/Loader";
import api from "../api";
import { CartContext, UserContext } from "@/App";

import { Helmet } from "react-helmet";

export default function ProductDetailsPage() {
  const { user } = useContext(UserContext);
  const { cart, cartDispatch } = useContext(CartContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  // URL sản phẩm hiện tại
  const productUrl = window.location.href;

  useEffect(() => {
    (async () => {
      const resp = await api.fetchProduct(id);
      if (resp.status == "error") {
        return history.replace("/404");
      }
      setProduct(resp);
    })();
  }, [id]);

  const addToCart = async (e, quantity = 1) => {
    if (user) {
      const resp = await api.addProductsToCart([{ productID: id, quantity }]);
      if (resp.status === "ok") {
        cartDispatch({
          type: "ADD_PRODUCTS",
          payload: [{ ...product, quantity }],
        });
      }
    } else {
      cartDispatch({
        type: "ADD_PRODUCTS",
        payload: [{ ...product, quantity }],
      });
    }
  };

  if (!product) return <Loader />;

  return (
    <>
      {/* ====== Meta Open Graph cho mạng xã hội ====== */}
      <Helmet>
        <title>{product.title} - Shop ABC</title>
        <meta name="description" content={product.description} />

        {/* Open Graph */}
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Shop ABC" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={product.image} />
      </Helmet>

      <main className="relative mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 py-8 px-4">
          <section className="flex items-center max-h-2xl overflow-hidden my-10 sm:mx-0">
            <img className="object-cover" src={product.image} />
          </section>
          <section className="flex flex-col justify-center space-y-6 text-gray-600">
            <h2 className="text-4xl text-gray-800">{product.title}</h2>
            <p className="text-xl">{product.description}</p>
            <span className="text-2xl font-medium">${product.price}</span>
            {cart.products.some((p) => p.id === id) ? (
              <Link to="/cart">
                <Button link className="sm:max-w-xs text-base">
                  <Check className="mr-2" />
                  <span>Added to Cart</span>
                </Button>
              </Link>
            ) : (
              <Button className="sm:max-w-xs text-base" onClick={addToCart}>
                <ShoppingCart className="opacity-80 mr-4" />
                <span>Add to Cart</span>
              </Button>
            )}

            {/* Nút share Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                productUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:max-w-xs text-base flex items-center justify-center mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Share2 className="mr-2" /> Share on Facebook
            </a>
          </section>
        </div>
        <Button
          onClick={() => navigate(-1)}
          className="absolute top-0 text-lg"
          secondary
        >
          <ChevronLeft className="mr-2" /> Back
        </Button>
      </main>
    </>
  );
}
