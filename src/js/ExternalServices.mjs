async function convertToJson(res) {
  let jsonResponse = null;

  try {
    jsonResponse = await res.json();
  } catch (e) {
    // if response body is not JSON, fallback to text
    const text = await res.text().catch(() => "");
    jsonResponse = { message: text || "Unknown error" };
  }

  if (res.ok) {
    return jsonResponse;
  } else {
    // send server details back to caller
    throw { name: "servicesError", message: jsonResponse };
  }
}


export default class ExternalServices {
  constructor(category) {
    this.category = category;
    // mantém seu JSON local para lista/detalhe
    this.path = `../json/${this.category}.json`;
    // endpoint do checkout
    this.baseURL = "https://wdd330-backend.onrender.com";
  }

  getData() {
    return fetch(this.path).then(convertToJson).then((data) => data);
  }

  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }

  // POST checkout
  async checkout(payload) {
    const url = `${this.baseURL}/checkout`;
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    const res = await fetch(url, options);
    return convertToJson(res);
  }
}
