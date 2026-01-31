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

  // esconde se estiver vazio
  if (cartItems.length === 0) {
    cartFooter.classList.add("hide");
    return;
  }

  // mostra se tiver itens
  cartFooter.classList.remove("hide");

  // soma preços (com fallback seguro)
  const total = cartItems.reduce((sum, item) => {
    const price = Number(item.FinalPrice ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 1); // se não existir, assume 1
    return sum + price * qty;
  }, 0);

  cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// Atualiza ao carregar
updateCartTotal();

// Atualiza após remover item (delegação)
// (o X tem a classe "remove" no seu CSS e no template padrão do carrinho)
cartList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove")) {
    // espera o ShoppingCart salvar/atualizar o localStorage e re-renderizar
    setTimeout(updateCartTotal, 0);
  }
});
