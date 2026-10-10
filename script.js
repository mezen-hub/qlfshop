"use strict";

/* ========================================
   CONFIGURATION DE QLF SHOP
======================================== */

const SHOP = {
    name: "QLF SHOP",
    whatsapp: "21656555888",
    price: 55,
    currency: "DT",
    sizes: ["XS", "S", "M", "L", "XL"]
};

/*
  Noms des photos à placer dans le dossier images/.
  Les images ne sont pas intégrées dans le code :
  ajoute tes fichiers JPG avec les noms ci-dessous.
*/

const products = [
    {
        id: "dl-gris",
        name: "Dans la légende",
        collection: "dans-legende",
        collectionLabel: "Dans la légende",
        color: "Gris",
        image: "dans-legende-gris.jpg"
    },
    {
        id: "dl-rose",
        name: "Dans la légende",
        collection: "dans-legende",
        collectionLabel: "Dans la légende",
        color: "Rose",
        image: "dans-legende-rose.jpg"
    },
    {
        id: "dl-turquoise",
        name: "Dans la légende",
        collection: "dans-legende",
        collectionLabel: "Dans la légende",
        color: "Turquoise",
        image: "dans-legende-turquoise.jpg"
    },
    {
        id: "dl-blanc",
        name: "Dans la légende",
        collection: "dans-legende",
        collectionLabel: "Dans la légende",
        color: "Blanc",
        image: "dans-legende-blanc.jpg"
    },
    {
        id: "dl-noir",
        name: "Dans la légende",
        collection: "dans-legende",
        collectionLabel: "Dans la légende",
        color: "Noir",
        image: "dans-legende-noir.jpg"
    },
    {
        id: "df-gris",
        name: "Deux frères",
        collection: "deux-freres",
        collectionLabel: "Deux frères",
        color: "Gris",
        image: "deux-freres-gris.jpg"
    },
    {
        id: "df-noir",
        name: "Deux frères",
        collection: "deux-freres",
        collectionLabel: "Deux frères",
        color: "Noir",
        image: "deux-freres-noir.jpg"
    },
    {
        id: "df-marine",
        name: "Deux frères",
        collection: "deux-freres",
        collectionLabel: "Deux frères",
        color: "Bleu marine",
        image: "deux-freres-marine.jpg"
    },
    {
        id: "df-turquoise",
        name: "Deux frères",
        collection: "deux-freres",
        collectionLabel: "Deux frères",
        color: "Turquoise",
        image: "deux-freres-turquoise.jpg"
    },
    {
        id: "df-blanc",
        name: "Deux frères",
        collection: "deux-freres",
        collectionLabel: "Deux frères",
        color: "Blanc",
        image: "deux-freres-blanc.jpg"
    }
];

/* ========================================
   ÉLÉMENTS HTML
======================================== */

const $ = (selector) => document.querySelector(selector);

const productGrid = $("#product-grid");
const collectionFilter = $("#collection-filter");
const colorFilter = $("#color-filter");
const productCount = $("#product-count");

const productModal = $("#product-modal");
const cartModal = $("#cart-modal");

const modalImage = $("#modal-image");
const modalTitle = $("#modal-title");
const modalCollection = $("#modal-collection");
const modalColor = $("#modal-color");
const modalSize = $("#modal-size");
const modalQuantity = $("#modal-quantity");
const addToCartButton = $("#add-to-cart");
const productMessage = $("#product-message");

const cartItems = $("#cart-items");
const cartCount = $("#cart-count");
const cartEmpty = $("#cart-empty");
const cartSummary = $("#cart-summary");
const summaryQuantity = $("#summary-quantity");
const summaryTotal = $("#summary-total");

const toast = $("#toast");

let selectedProduct = null;
let toastTimeout = null;

/* ========================================
   PANIER
======================================== */

const STORAGE_KEY = "qlf-shop-cart-v1";

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.filter((item) => {
            return (
                products.some((product) => product.id === item.productId) &&
                SHOP.sizes.includes(item.size) &&
                Number.isInteger(item.quantity) &&
                item.quantity >= 1 &&
                item.quantity <= 20
            );
        });
    } catch (error) {
        return [];
    }
}

let cart = loadCart();

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        showToast("Le panier ne peut pas être sauvegardé sur cet appareil.");
    }
}

function getProduct(productId) {
    return products.find((product) => product.id === productId);
}

function getCartQuantity() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
    return cart.reduce(
        (total, item) => total + SHOP.price * item.quantity,
        0
    );
}

function formatPrice(amount) {
    return `${amount} ${SHOP.currency}`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

/* ========================================
   AFFICHAGE DES PRODUITS
======================================== */

const colorValues = {
    "Gris": "#999999",
    "Rose": "#e7a5bd",
    "Turquoise": "#53b9b5",
    "Blanc": "#ffffff",
    "Noir": "#171717",
    "Bleu marine": "#202d48"
};

function getFilteredProducts() {
    const collection = collectionFilter.value;
    const color = colorFilter.value;

    return products.filter((product) => {
        const collectionMatches =
            collection === "all" || product.collection === collection;

        const colorMatches =
            color === "all" || product.color === color;

        return collectionMatches && colorMatches;
    });
}

function renderProducts() {
    const filteredProducts = getFilteredProducts();

    productCount.textContent =
        `${filteredProducts.length} article${filteredProducts.length > 1 ? "s" : ""}`;

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
      <div class="no-products">
        Aucun produit ne correspond à ces filtres.
      </div>
    `;
        return;
    }

    productGrid.innerHTML = filteredProducts.map((product) => {
        return `
      <article class="product-card">
        <div class="product-image">
          <img
            src="${product.image}"
            alt="${escapeHTML(product.name)} — ${escapeHTML(product.color)}"
            loading="lazy"
            data-product-image
          >

          <span class="product-badge">55 DT</span>

          <button
            class="quick-add"
            type="button"
            data-open-product="${product.id}"
            aria-label="Choisir la taille du t-shirt ${escapeHTML(product.name)} ${escapeHTML(product.color)}"
          >
            CHOISIR MA TAILLE +
          </button>
        </div>

        <div class="product-info">
          <div class="product-topline">
            <h3 class="product-name">${escapeHTML(product.name)}</h3>
            <span class="product-price">55 DT</span>
          </div>

          <p class="product-collection">
            ${escapeHTML(product.collectionLabel)} · ${escapeHTML(product.color)}
          </p>

          <div class="product-colors" aria-label="Couleur : ${escapeHTML(product.color)}">
            <span
              class="color-dot"
              style="background:${colorValues[product.color] || "#ddd"}"
              title="${escapeHTML(product.color)}"
            ></span>
          </div>
        </div>
      </article>
    `;
    }).join("");

    // Signale les photos absentes plutôt que de laisser une image cassée.
    productGrid.querySelectorAll("img[data-product-image]").forEach((img) => {
        img.addEventListener("error", () => {
            img.removeAttribute("src");
            img.alt = "Photo manquante — ajoute le fichier dans le dossier images";
            img.style.display = "none";

            const parent = img.closest(".product-image");
            if (parent && !parent.querySelector(".missing-image")) {
                const message = document.createElement("div");
                message.className = "missing-image";
                message.textContent = "Ajoute la photo dans /images";
                message.style.cssText = [
                    "position:absolute",
                    "inset:0",
                    "display:grid",
                    "place-items:center",
                    "padding:20px",
                    "text-align:center",
                    "font-size:11px",
                    "color:#777",
                    "background:#f0eee9"
                ].join(";");

                parent.prepend(message);
            }
        }, { once: true });
    });
}

/* ========================================
   OUVRIR ET FERMER LES FENÊTRES
======================================== */

function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add("modal-open");

    const closeButton = modal.querySelector(".close-button");
    if (closeButton) closeButton.focus();
}

function closeModal(modal) {
    modal.hidden = true;

    if (productModal.hidden && cartModal.hidden) {
        document.body.classList.remove("modal-open");
    }
}

document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
        const modal = document.getElementById(button.dataset.close);
        if (modal) closeModal(modal);
    });
});

[productModal, cartModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (!productModal.hidden) closeModal(productModal);
        if (!cartModal.hidden) closeModal(cartModal);
    }
});

/* ========================================
   DÉTAILS D'UN PRODUIT
======================================== */

function openProduct(productId) {
    const product = getProduct(productId);

    if (!product) return;

    selectedProduct = product;

    modalImage.src = product.image;
    modalImage.alt = `${product.name} — ${product.color}`;
    modalTitle.textContent = product.name;
    modalCollection.textContent = product.collectionLabel.toUpperCase();
    modalColor.textContent = `Couleur : ${product.color}`;

    modalSize.value = "";
    modalQuantity.value = "1";
    productMessage.textContent = "";

    updateAddButtonPrice();
    openModal(productModal);
}

function updateAddButtonPrice() {
    const quantity = Math.max(
        1,
        Math.min(20, Number.parseInt(modalQuantity.value, 10) || 1)
    );

    addToCartButton.textContent =
        `AJOUTER AU PANIER — ${formatPrice(SHOP.price * quantity)}`;
}

productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-product]");

    if (button) {
        openProduct(button.dataset.openProduct);
    }
});

modalQuantity.addEventListener("input", updateAddButtonPrice);

/* ========================================
   AJOUTER AU PANIER
======================================== */

addToCartButton.addEventListener("click", () => {
    if (!selectedProduct) return;

    const size = modalSize.value;
    const quantity = Number.parseInt(modalQuantity.value, 10);

    if (!SHOP.sizes.includes(size)) {
        productMessage.style.color = "#a52c2c";
        productMessage.textContent = "Choisis une taille avant de continuer.";
        modalSize.focus();
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        productMessage.style.color = "#a52c2c";
        productMessage.textContent = "Choisis une quantité entre 1 et 20.";
        modalQuantity.focus();
        return;
    }

    const existingItem = cart.find((item) => {
        return item.productId === selectedProduct.id && item.size === size;
    });

    if (existingItem) {
        if (existingItem.quantity + quantity > 20) {
            productMessage.style.color = "#a52c2c";
            productMessage.textContent = "Maximum 20 exemplaires par modèle et taille.";
            return;
        }

        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: selectedProduct.id,
            size,
            quantity
        });
    }

    saveCart();
    renderCart();

    closeModal(productModal);
    showToast("T-shirt ajouté au panier.");
});

/* ========================================
   AFFICHER LE PANIER
======================================== */

function renderCart() {
    cartCount.textContent = getCartQuantity();

    cartEmpty.hidden = cart.length > 0;
    cartSummary.hidden = cart.length === 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "";
        summaryQuantity.textContent = "0";
        summaryTotal.textContent = formatPrice(0);
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => {
        const product = getProduct(item.productId);

        if (!product) return "";

        return `
      <article class="cart-row">
        <img
          src="${product.image}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >

        <div>
          <h3 class="cart-item-title">${escapeHTML(product.name)}</h3>

          <p class="cart-item-detail">
            ${escapeHTML(product.color)}<br>
            Taille : ${escapeHTML(item.size)}<br>
            ${formatPrice(SHOP.price)} / unité
          </p>

          <div class="quantity-control" aria-label="Modifier la quantité">
            <button
              type="button"
              data-cart-action="decrease"
              data-index="${index}"
              aria-label="Diminuer la quantité"
            >−</button>

            <span>${item.quantity}</span>

            <button
              type="button"
              data-cart-action="increase"
              data-index="${index}"
              aria-label="Augmenter la quantité"
            >+</button>
          </div>
        </div>

        <div class="cart-item-right">
          <span class="cart-item-total">
            ${formatPrice(SHOP.price * item.quantity)}
          </span>

          <button
            class="remove-item"
            type="button"
            data-cart-action="remove"
            data-index="${index}"
          >
            Supprimer
          </button>
        </div>
      </article>
    `;
    }).join("");

    summaryQuantity.textContent = getCartQuantity();
    summaryTotal.textContent = formatPrice(getCartTotal());
}

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");

    if (!button) return;

    const index = Number.parseInt(button.dataset.index, 10);
    const item = cart[index];

    if (!item) return;

    switch (button.dataset.cartAction) {
        case "increase":
            if (item.quantity < 20) {
                item.quantity += 1;
            } else {
                showToast("Maximum 20 exemplaires pour cet article.");
            }
            break;

        case "decrease":
            item.quantity -= 1;

            if (item.quantity <= 0) {
                cart.splice(index, 1);
            }
            break;

        case "remove":
            cart.splice(index, 1);
            showToast("Article supprimé du panier.");
            break;
    }

    saveCart();
    renderCart();
});

/* ========================================
   OUVRIR LE PANIER
======================================== */

$("#open-cart").addEventListener("click", () => {
    renderCart();
    openModal(cartModal);
});

$("#continue-shopping").addEventListener("click", () => {
    closeModal(cartModal);
    $("#collection").scrollIntoView({ behavior: "smooth" });
});

/* ========================================
   FILTRES
======================================== */

collectionFilter.addEventListener("change", renderProducts);
colorFilter.addEventListener("change", renderProducts);

/* ========================================
   COMMANDE WHATSAPP
======================================== */

$("#checkout-whatsapp").addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Ton panier est vide.");
        return;
    }

    const customerName = $("#customer-name").value.trim();
    const customerAddress = $("#customer-address").value.trim();
    const customerNote = $("#customer-note").value.trim();

    const lines = [
        `Bonjour ${SHOP.name} !`,
        "",
        "Je souhaite commander :",
        ""
    ];

    cart.forEach((item, index) => {
        const product = getProduct(item.productId);

        if (!product) return;

        lines.push(
            `${index + 1}. ${product.name}`,
            `Couleur : ${product.color}`,
            `Taille : ${item.size}`,
            `Quantité : ${item.quantity}`,
            `Sous-total : ${formatPrice(SHOP.price * item.quantity)}`,
            ""
        );
    });

    lines.push(
        "--------------------------",
        `Nombre d'articles : ${getCartQuantity()}`,
        `TOTAL PRODUITS : ${formatPrice(getCartTotal())}`,
        "",
        "Merci de me confirmer la disponibilité et les frais de livraison."
    );

    if (customerName) {
        lines.push("", `Nom : ${customerName}`);
    }

    if (customerAddress) {
        lines.push(`Adresse : ${customerAddress}`);
    }

    if (customerNote) {
        lines.push(`Remarque : ${customerNote}`);
    }

    const message = lines.join("\n");
    const whatsappURL =
        `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;

    // Ouvre WhatsApp avec les détails préparés.
    // La commande n'est pas envoyée automatiquement.
    window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

/* ========================================
   NOTIFICATIONS
======================================== */

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2800);
}

/* ========================================
   INITIALISATION
======================================== */

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();