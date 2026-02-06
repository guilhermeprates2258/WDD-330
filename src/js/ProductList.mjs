function productCardTemplate(product) {
  const finalPrice = Number(product.FinalPrice);
  const retail = Number(product.SuggestedRetailPrice);

  const isDiscounted = Number.isFinite(finalPrice) && Number.isFinite(retail) && finalPrice < retail;

  const discountPercent = isDiscounted
    ? Math.round(((retail - finalPrice) / retail) * 100)
    : 0;

  return `
    <li class="product-card ${isDiscounted ? "product-card--discount" : ""}">
      <a href="product_pages/?product=${product.Id}">
        ${isDiscounted ? `<span class="discount-badge">-${discountPercent}%</span>` : ""}

        <img src="${product.Image}" alt="${product.Name}">
        <h2>${product.Brand.Name}</h2>
        <h3>${product.NameWithoutBrand}</h3>

        <p class="product-card__price">
          $${finalPrice.toFixed(2)}
          ${isDiscounted ? `<span class="product-card__retail">$${retail.toFixed(2)}</span>` : ""}
        </p>
      </a>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData();
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }
}