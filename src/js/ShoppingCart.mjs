import { getLocalStorage, setLocalStorage, renderListWithTemplate } from "./utils.mjs";

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <span class="remove" data-id="${item.Id}" aria-label="Remove item">X</span>

      <a href="../product_pages/?product=${item.Id}" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}">
      </a>

      <a href="../product_pages/?product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>

      <p class="cart-card__color">${item.Colors?.[0]?.ColorName ?? ""}</p>
      <p class="cart-card__quantity">qty: ${item.quantity ?? 1}</p>
      <p class="cart-card__price">$${item.FinalPrice}</p>
    </li>
  `;
}

export default class ShoppingCart {
  constructor(listElement) {
    this.listElement = listElement;

    // delegação: pega clicks em itens gerados dinamicamente
    this.listElement.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove")) {
        const id = e.target.dataset.id;
        this.removeItem(id);
      }
    });
  }

  init() {
    const cartItems = getLocalStorage("so-cart") || [];
    this.render(cartItems);
  }

  render(cartItems) {
    renderListWithTemplate(cartItemTemplate, this.listElement, cartItems, "afterbegin", true);
  }

  removeItem(id) {
    const cartItems = getLocalStorage("so-cart") || [];

    // remove só 1 ocorrência daquele produto
    const index = cartItems.findIndex((item) => String(item.Id) === String(id));
    if (index !== -1) {
      cartItems.splice(index, 1);
      setLocalStorage("so-cart", cartItems);
      this.render(cartItems);

      // avisa o resto do app (ex: total do carrinho) que mudou
      document.dispatchEvent(new CustomEvent("cart:updated"));
    }
  }
}
