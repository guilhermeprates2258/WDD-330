import { getLocalStorage, renderListWithTemplate } from "./utils.mjs";

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <a href="../product_pages/?product=${item.Id}" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}">
      </a>

      <a href="../product_pages/?product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>

      <p class="cart-card__color">${item.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">qty: ${item.quantity}</p>
      <p class="cart-card__price">$${item.FinalPrice}</p>
    </li>
  `;
}

export default class ShoppingCart {
  constructor(listElement) {
    this.listElement = listElement;
  }

  init() {
    const cartItems = getLocalStorage("so-cart") || [];
    this.render(cartItems);
  }

  render(cartItems) {
    renderListWithTemplate(
      cartItemTemplate,
      this.listElement,
      cartItems
    );
  }
}
