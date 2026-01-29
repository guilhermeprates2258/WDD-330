import { loadHeaderFooter } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";

loadHeaderFooter();

const cartList = document.querySelector(".product-list");
const cart = new ShoppingCart(cartList);
cart.init();
