import { loadHeaderFooter, getLocalStorage } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

loadHeaderFooter();

const cartList = document.querySelector(".product-list");
const cart = new ShoppingCart(cartList);
cart.init();

// --- Total in Cart ---
function updateCartTotal() {
  const cartItems = getLocalStorage("so-cart") || [];

  const cartFooter = document.querySelector(".cart-footer");
  const cartTotalEl = document.querySelector(".cart-total");

  if (cartItems.length === 0) {
    cartFooter.classList.add("hide");
    return;
  }

  cartFooter.classList.remove("hide");

  const total = cartItems.reduce((sum, item) => {
    const price = Number(item.FinalPrice ?? 0);
    const qty = Number(item.quantity ?? 1);
    return sum + price * qty;
  }, 0);

  cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// Atualiza ao carregar
updateCartTotal();

// Atualiza sempre que o carrinho mudar (remove/add/etc)
document.addEventListener("cart:updated", updateCartTotal);
