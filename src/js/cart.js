import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  addRemoveListeners();
}

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <span class="remove" data-id="${item.Id}">X</span>

      <a href="#" class="cart-card__image">
        <img
          src="${item.Image}"
          alt="${item.Name}"
        />
      </a>

      <a href="#">
        <h2 class="card__name">${item.Name}</h2>
      </a>

      <p class="cart-card__color">${item.Colors[0].ColorName}</p>
      <p class="cart-card__quantity">qty: 1</p>
      <p class="cart-card__price">$${item.FinalPrice}</p>
    </li>
  `;
}

function addRemoveListeners() {
  const removeButtons = document.querySelectorAll(".remove");

  removeButtons.forEach((button) => {
    button.addEventListener("click", removeItemFromCart);
  });
}

function removeItemFromCart(e) {
  const id = e.target.dataset.id;

  let cartItems = getLocalStorage("so-cart") || [];

  cartItems = cartItems.filter((item) => item.Id !== id);

  setLocalStorage("so-cart", cartItems);

  renderCartContents();
}

renderCartContents();
