// CONFIG
const CART_KEY = "site_cart_v1";

// PRODUCTS
const products = [
  { id: 'p1', title: 'Magali Honey', price: { '1kg':1100,'500g':600,'250g':350 }, img: 'assets/malai.png', desc:'Premium golden Magali honey.' },
  { id: 'p2', title: 'Moringa Honey', price: { '1kg':1100,'500g':600,'250g':350 }, img: 'assets/mugarai.png', desc:'Infused with Moringa flowers.' },
  { id: 'p3', title: 'Kombu Honey', price: { '1kg':1200,'500g':700,'250g':400 }, img: 'assets/kombu.png', desc:'Rare medicinal Dammer bee honey.' },
  { id: 'p4', title: 'Multi Floral Honey', price: { '1kg':900,'500g':500,'250g':300 }, img: 'assets/mix.png', desc:'Wild multi-floral honey.' }
];

// LOAD CART
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

// SAVE CART
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// UPDATE CART COUNT
function updateCartCount() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = count;
}

// RENDER PRODUCTS
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(prod => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${prod.img}">
      <h3>${prod.title}</h3>
      <p class="desc">${prod.desc}</p>

      <div class="sizes">
        <button class="size active">1kg</button>
        <button class="size">500g</button>
        <button class="size">250g</button>
      </div>

      <div class="price">
        <span class="amount">₹${prod.price["1kg"]}</span>
      </div>

      <button class="buybtn">Buy Now</button>
      <button class="addbtn">Add to Cart</button>
    `;

    // Size switching
    const sizeBtns = card.querySelectorAll(".size");
    sizeBtns.forEach(btn => {
      btn.onclick = () => {
        sizeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        card.querySelector(".amount").textContent = "₹" + prod.price[btn.textContent];
      };
    });

    // ADD TO CART
    card.querySelector(".addbtn").onclick = () => {
      const size = card.querySelector(".size.active").textContent;
      const f = cart.find(i => i.id === prod.id && i.size === size);

      if (f) f.qty++;
      else cart.push({ id: prod.id, size, qty: 1 });

      saveCart();
    };

    // BUY NOW → Add item & open cart page
    card.querySelector(".buybtn").onclick = () => {
      const size = card.querySelector(".size.active").textContent;

      // Add automatically
      const f = cart.find(i => i.id === prod.id && i.size === size);
      if (f) f.qty++;
      else cart.push({ id: prod.id, size, qty: 1 });
      saveCart();

      // Open cart.html
      window.location.href = "cart.html";
    };

    container.appendChild(card);
  });
}

renderProducts();
updateCartCount();

/* =============================
   REVIEW SYSTEM – SIMPLE SLIDER
============================= */
(function () {
  const REVIEW_KEY = "REVIEWS_V1";

  const slideEl   = document.getElementById("reviewSlide");
  const dotsWrap  = document.getElementById("reviewDots");
  const prevBtn   = document.getElementById("prevReview");
  const nextBtn   = document.getElementById("nextReview");
  const starEls   = document.querySelectorAll(".star-rating span");
  const nameInput = document.getElementById("revName");
  const textInput = document.getElementById("revText");
  const submitBtn = document.getElementById("revSubmit");

  if (!slideEl || !dotsWrap) return;

  let rating = 0;
  let reviews = [];
  let currentIndex = 0;

  // STAR SELECT
  starEls.forEach(star => {
    star.addEventListener("click", () => {
      rating = parseInt(star.dataset.star, 10);
      starEls.forEach(s => s.classList.remove("active"));
      starEls.forEach(s => {
        const v = parseInt(s.dataset.star, 10);
        if (v <= rating) s.classList.add("active");
      });
    });
  });

  function getInitials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .map(w => w[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }

  function buildStars(r) {
    let out = "";
    for (let i = 0; i < r; i++) out += "★";
    for (let i = r; i < 5; i++) out += "☆";
    return out;
  }

  // LOAD SAMPLE + SAVED REVIEWS
  function loadReviews() {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]");
    } catch (e) {
      stored = [];
    }

    if (!Array.isArray(stored) || stored.length === 0) {
      stored = [
        {
          name: "Mohana M",
          rating: 5,
          text: "My mom uses this honey with Ayurvedic medicine and I use it for face care. We love this brand!"
        },
        {
          name: "Karthik N",
          rating: 5,
          text: "Super fresh honey! Taste is very natural. Definitely buying again."
        },
        {
          name: "Priya S",
          rating: 4,
          text: "Color, smell, quality — everything perfect. Very thick and pure."
        },
        {
          name: "Arun Kumar",
          rating: 5,
          text: "Good packaging and fast delivery. Honey quality is top-class!"
        },
        {
          name: "Meena R",
          rating: 5,
          text: "Best organic honey I have used. Works great for immunity."
        }
      ];
      localStorage.setItem(REVIEW_KEY, JSON.stringify(stored));
    }

    reviews = stored;
  }

  // RENDER CURRENT REVIEW (SINGLE MINI SLIDE)
  function renderCurrent() {
    if (!reviews.length) return;
    const r = reviews[currentIndex];

    slideEl.innerHTML = `
      <div class="review-card mini">
        <div class="review-avatar">${getInitials(r.name)}</div>
        <div class="review-body">
          <div class="review-name">${r.name}</div>
          <div class="review-stars">${buildStars(r.rating)}</div>
          <div class="review-text">${r.text}</div>
        </div>
      </div>
    `;

    dotsWrap.innerHTML = "";
    reviews.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = "review-dot" + (idx === currentIndex ? " active" : "");
      dot.addEventListener("click", () => {
        currentIndex = idx;
        renderCurrent();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function goNext() {
    if (!reviews.length) return;
    currentIndex = (currentIndex + 1) % reviews.length;
    renderCurrent();
  }

  function goPrev() {
    if (!reviews.length) return;
    currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
    renderCurrent();
  }

  if (nextBtn) nextBtn.addEventListener("click", goNext);
  if (prevBtn) prevBtn.addEventListener("click", goPrev);

  // AUTO SLIDE INTERVAL
  setInterval(goNext, 4000); // 4 seconds per review

  // SUBMIT NEW REVIEW
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const name = (nameInput?.value || "").trim();
      const text = (textInput?.value || "").trim();

      if (!name || !text || rating === 0) {
        alert("Please enter name, review and rating.");
        return;
      }

      const newReview = { name, rating, text };
      reviews.push(newReview);
      localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));

      if (nameInput) nameInput.value = "";
      if (textInput) textInput.value = "";
      rating = 0;
      starEls.forEach(s => s.classList.remove("active"));

      currentIndex = reviews.length - 1;
      renderCurrent();

      alert("Thanks for your review! 😊");
    });
  }

  // INIT
  loadReviews();
  renderCurrent();
})();

/* =============================
   NAV TOGGLE (FIXED)
============================= */
const navToggle = document.getElementById("navToggle");
const navMenu   = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active"); // for hamburger animation
    navMenu.classList.toggle("open");     // for .nav.open in CSS
  });
}
