const API_URL = import.meta.env.VITE_API_URL;

function setAccessToken(token) {
  localStorage.setItem("token", token);
}
function getAccessToken() {
  return localStorage.getItem("token");
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}
function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

async function registerUser({ fullname, email, password }) {
  const resp = await fetch(API_URL + "/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullname, email, password }),
  });
  return await resp.json();
}

async function loginUser({ email, password }) {
  const resp = await fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();

  if (data.accessToken) {
    setAccessToken(data.accessToken);
    await fetchUserDetails();
  }
  return data;
}

function logoutUser() {
  localStorage.clear();
}

async function createUserCart(products) {
  const resp = await fetch(API_URL + "/carts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getAccessToken(),
    },
    body: JSON.stringify(products.length ? { products } : {}),
  });
  return await resp.json();
}

async function getUserCart() {
  const user = getUser();
  if (!user || !user._id) {
    return { products: [] };
  }
  const userID = user._id;
  try {
    const resp = await fetch(API_URL + "/carts/" + userID, {
      headers: {
        "x-access-token": getAccessToken(),
      },
    });
    if (!resp.ok) {
      return { products: [] };
    }
    const cart = await resp.json();
    if (cart && Array.isArray(cart.products)) {
      cart.products = cart.products.map((product) => ({
        id: product.productID?._id,
        title: product.productID?.title,
        price: product.productID?.price,
        image: product.productID?.image,
        quantity: product.quantity,
      }));
      return cart;
    }
    return { products: [] };
  } catch (e) {
    return { products: [] };
  }
}

// function setAuthToken ( token ) {
//   if ( token ) {
//     localStorage.setItem("token", token);
//     instance.defaults.headers.common["x-access-token"] = token;
//   } else {
//     localStorage.removeItem("token");
//     delete instance.defaults.headers.common["x-access-token"];
//   }
// }

async function addProductsToCart(products) {
  const userID = getUser()._id;
  const resp = await fetch(API_URL + "/carts/" + userID, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getAccessToken(),
    },
    body: JSON.stringify({ products }),
  });
  return await resp.json();
}

async function removeProductFromCart(productID) {
  return await patchCart(productID, 0);
}

async function patchCart(productID, quantity) {
  const userID = getUser()._id;
  const resp = await fetch(API_URL + "/carts/" + userID, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getAccessToken(),
    },
    body: JSON.stringify({ productID, quantity }),
  });
  return await resp.json();
}

async function clearCart() {
  const resp = await fetch(API_URL + "/carts/clear", {
    method: "POST",
    headers: {
      "x-access-token": getAccessToken(),
    },
  });
  return await resp.json();
}

async function fetchUserDetails() {
  const resp = await fetch(API_URL + "/users/me", {
    headers: {
      "x-access-token": getAccessToken(),
    },
  });

  if (!resp.ok) {
    console.warn("Server error", resp.status);
    return { status: "error", user: null };
  }
  const data = await resp.json();
  const status = data?.status;
  const user = data?.user;

  if (status === "ok" && user) {
    if (!user.avatarSrc) {
      user.avatarSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}.svg`;
    }

    const img = new window.Image();
    img.onerror = function () {
      user.avatarSrc = "/default-avatar.png";
      setUser(user);
    };
    img.onload = function () {
      setUser(user);
    };
    img.src = user.avatarSrc;

    return { status: "ok", user };
  } else {
    console.warn("fetchUserDetails: user is null or response invalid", data);
    return { status: "error", user: null };
  }
}

async function fetchProducts(category, newArrivals = false) {
  // nếu ko truyền tham số thứ 2, mặc định = false
  let query = `new=${newArrivals ? "true" : "false"}${
    category ? "&category=" + category : ""
  }`;
  const resp = await fetch(API_URL + "/products?" + query);
  return await resp.json();
}
async function fetchProduct(id) {
  const resp = await fetch(API_URL + "/products/" + id);
  return await resp.json();
}

// async function proceedCheckout() {
//   const resp = await fetch(API_URL+"/checkout/payment", {
//     headers: {
//       "Content-Type": "application/json",
//       "x-access-token": getAccessToken(),
//     },
//   })
//   return await resp.json()
// }

async function proceedCheckout() {
  const resp = await fetch(API_URL + "/payment/create-paypal-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getAccessToken(),
    },
  });
  return await resp.json();
}

// on production create the order using stripe webhooks
async function createOrder(products, amount, address) {
  const resp = await fetch(API_URL + "/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": getAccessToken(),
    },
    body: JSON.stringify({
      products: products.map((p) => ({
        productID: p.id,
        quantity: p.quantity,
      })),
      amount,
      address,
    }),
  });
  return await resp.json();
}

async function fetchAllOrders() {
  const userID = getUser()._id;
  const resp = await fetch(API_URL + "/orders/user/" + userID, {
    headers: {
      "x-access-token": getAccessToken(),
    },
  });
  return await resp.json();
}

async function fetchOrderDetails(orderID) {
  const resp = await fetch(API_URL + "/orders/" + orderID, {
    headers: {
      "x-access-token": getAccessToken(),
    },
  });
  return await resp.json();
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  fetchUserDetails,
  fetchProducts,
  fetchProduct,
  createUserCart,
  getUserCart,
  addProductsToCart,
  removeProductFromCart,
  patchCart,
  clearCart,
  proceedCheckout,
  createOrder,
  fetchAllOrders,
  fetchOrderDetails,
  // setAuthToken,
};
