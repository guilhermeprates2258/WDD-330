import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs"; 

function formDataToJSON(form) {
  const formData = new FormData(form);
  const json = {};
  for (const [key, value] of formData.entries()) json[key] = value;
  return json;
}

// takes the items currently stored in the cart (localstorage) and returns them in a simplified form.
function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: Number(item.FinalPrice),
    quantity: Number(item.quantity ?? 1),
  }));
}

export default class CheckoutProcess {
  constructor(services) {
    this.services = services;

    this.subtotalEl = document.querySelector("#subtotal");
    this.taxEl = document.querySelector("#tax");
    this.shippingEl = document.querySelector("#shipping");
    this.totalEl = document.querySelector("#orderTotal");

    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.orderTotal = 0;
  }

  // Called on page load
  calculateSubtotal() {
    const cartItems = getLocalStorage("so-cart") || [];

    this.subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.FinalPrice ?? 0);
      const qty = Number(item.quantity ?? 1);
      return sum + price * qty;
    }, 0);

    if (this.subtotalEl) this.subtotalEl.textContent = `$${this.subtotal.toFixed(2)}`;
    return cartItems;
  }

  // Called after ZIP is filled
  calculateOrderTotals() {
    const cartItems = getLocalStorage("so-cart") || [];
    const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);

    this.tax = this.subtotal * 0.06;
    this.shipping = itemCount > 0 ? 10 + (itemCount - 1) * 2 : 0;
    this.orderTotal = this.subtotal + this.tax + this.shipping;

    if (this.taxEl) this.taxEl.textContent = `$${this.tax.toFixed(2)}`;
    if (this.shippingEl) this.shippingEl.textContent = `$${this.shipping.toFixed(2)}`;
    if (this.totalEl) this.totalEl.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  // Called on form submit
  async checkout(form) {
  try {
    const cartItems = getLocalStorage("so-cart") || [];

    const order = formDataToJSON(form);
    order.orderDate = new Date().toISOString();
    order.items = packageItems(cartItems);

    order.orderTotal = this.orderTotal.toFixed(2);
    order.shipping = this.shipping;
    order.tax = this.tax.toFixed(2);

    const result = await this.services.checkout(order);

    // ✅ HAPPY PATH
    setLocalStorage("so-cart", []); // clear cart
    window.location.href = "../checkout/success.html"; // redirect

    return result;
  } catch (err) {
    // ✅ UNHAPPY PATH (stay on page, show message)
    const serverMsg =
      err?.name === "servicesError"
        ? (err.message?.message || JSON.stringify(err.message))
        : (err?.message || "Something went wrong. Please try again.");

    alertMessage(serverMsg, true);
    return null;
  }
 }
}