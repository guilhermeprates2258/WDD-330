import { loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

// category aqui é irrelevante pro checkout, mas mantém padrão do projeto
const services = new ExternalServices("tents");
const checkout = new CheckoutProcess(services);

// subtotal quando a página carrega
checkout.calculateSubtotal();

// totals depois que preencher ZIP
const zipInput = document.querySelector('input[name="zip"]');
zipInput.addEventListener("blur", () => {
  checkout.calculateOrderTotals();
});

// submit
const form = document.querySelector("#checkoutForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // não envia se faltarem campos
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // garante totals mesmo se o usuário não saiu do campo zip
  checkout.calculateSubtotal();
  checkout.calculateOrderTotals();

  try {
    const res = await checkout.checkout(form);
    console.log("✅ Server response:", res);
    alert("Order submitted! Check console for response.");
  } catch (err) {
    console.error("❌ Checkout error:", err);
    alert("Checkout failed. Check console.");
  }
});
