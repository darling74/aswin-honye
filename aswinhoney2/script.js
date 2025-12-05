// script.js — merged and cleaned

// === CONFIG ===
// merchant WhatsApp number in international format (no +)
const merchantPhone = '918754020475'; // <-- update if needed

// === PRODUCTS ===
const products = [
  { id: 'p1', title: 'Magali Honey', price: { '1kg':1100, '500g':600, '250g':350 }, desc: 'Premium golden Magali honey, rich in natural goodness.', img: 'assets/malai.png' },
  { id: 'p2', title: 'Moringa Honey', price: { '1kg':1100, '500g':600, '250g':350 }, desc: 'Infused with nutrients of Moringa flowers.', img: 'assets/mugarai.png' },
  { id: 'p3', title: 'Kombu Honey (Dammer Bee)', price: { '1kg':1200, '500g':700, '250g':400 }, desc: 'Rare and medicinal honey from Dammer bees.', img: 'assets/kombu.png' },
  { id: 'p4', title: 'Multi Floral Honey', price: { '1kg':900, '500g':500, '250g':300 }, desc: 'A delightful blend of nectar from various wildflowers.', img: 'assets/mix.png' }
];

// === STATE ===
let cart = []; // each item: { id, size, qty }

// === RENDER PRODUCTS ===
function renderProducts() {
  const container = document.getElementById('products');
  if (!container) return;
  container.innerHTML = '';

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = prod.img;
    img.alt = prod.title;

    const h3 = document.createElement('h3');
    h3.textContent = prod.title;

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = prod.desc;

    const sizes = document.createElement('div');
    sizes.className = 'sizes';
    ['1kg','500g','250g'].forEach((s,i) => {
      const btn = document.createElement('button');
      btn.className = 'size' + (i===0 ? ' active' : '');
      btn.textContent = s;
      btn.onclick = () => {
        sizes.querySelectorAll('.size').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        // update displayed price immediately
        const amount = card.querySelector('.amount');
        if(amount) amount.textContent = '₹' + prod.price[s];
      };
      sizes.appendChild(btn);
    });

    const priceWrap = document.createElement('div');
    priceWrap.className = 'price';
    const amount = document.createElement('div');
    amount.className = 'amount';
    amount.textContent = '₹' + prod.price['1kg'];

    const addBtn = document.createElement('button');
    addBtn.className = 'addbtn';
    addBtn.textContent = 'Add +';
    addBtn.onclick = () => {
      const selected = sizes.querySelector('.size.active')?.textContent || '1kg';
      addToCart(prod.id, selected, 1);
    };

    priceWrap.appendChild(amount);
    priceWrap.appendChild(addBtn);

    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(desc);
    card.appendChild(sizes);
    card.appendChild(priceWrap);
    container.appendChild(card);
  });
}

// === CART LOGIC ===
function addToCart(id, size, qty) {
  const found = cart.find(i => i.id === id && i.size === size);
  if (found) found.qty += qty;
  else cart.push({ id, size, qty });
  updateCartUI();
  openCart();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = cart.reduce((s,i) => s + i.qty, 0);

  const list = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  if (!list) return;

  list.innerHTML = '';
  if (cart.length === 0) {
    list.innerHTML = '<div style="color:var(--muted)">Your cart is empty</div>';
    if (totalEl) totalEl.textContent = 'Total: ₹0';
    return;
  }

  cart.forEach((item, idx) => {
    const prod = products.find(p => p.id === item.id);
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${prod.img}" alt="${escapeHtml(prod.title)}">
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(prod.title)} — <span style="color:var(--muted);font-weight:600">${escapeHtml(item.size)}</span></div>
        <div style="color:var(--muted);margin-top:6px">₹${prod.price[item.size]} x ${item.qty} = <strong style="color:var(--accent)">₹${prod.price[item.size]*item.qty}</strong></div>
        <div style="margin-top:8px" class="qty">
          <button data-idx="${idx}" class="dec">−</button>
          <div style="min-width:28px;text-align:center">${item.qty}</div>
          <button data-idx="${idx}" class="inc">+</button>
          <button data-idx="${idx}" class="rem" style="margin-left:8px;padding:6px 8px;border-radius:6px;background:transparent;border:1px solid rgba(255,255,255,0.04);cursor:pointer">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(el);
  });

  // attach events
  list.querySelectorAll('.inc').forEach(b => {
    b.onclick = () => { const i = +b.dataset.idx; cart[i].qty++; updateCartUI(); };
  });
  list.querySelectorAll('.dec').forEach(b => {
    b.onclick = () => { const i = +b.dataset.idx; cart[i].qty = Math.max(1, cart[i].qty - 1); updateCartUI(); };
  });
  list.querySelectorAll('.rem').forEach(b => {
    b.onclick = () => { const i = +b.dataset.idx; cart.splice(i,1); updateCartUI(); };
  });

  const total = cart.reduce((sum, it) => {
    const p = products.find(pp => pp.id === it.id);
    return sum + p.price[it.size] * it.qty;
  }, 0);

  if (totalEl) totalEl.textContent = 'Total: ₹' + total;
}

// === DRAWER CONTROLS ===
const _cartToggle = document.getElementById('cartToggle');
const _cartDrawer = document.getElementById('cartDrawer');
const _closeDrawerBtn = document.getElementById('closeDrawer');

function openCart() {
  if (_cartDrawer) { _cartDrawer.classList.add('open'); _cartDrawer.setAttribute('aria-hidden','false'); }
}
function closeCart() {
  if (_cartDrawer) { _cartDrawer.classList.remove('open'); _cartDrawer.setAttribute('aria-hidden','true'); }
}
if (_cartToggle) _cartToggle.addEventListener('click', openCart);
if (_closeDrawerBtn) _closeDrawerBtn.addEventListener('click', closeCart);

// close on Escape (single listener)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (_cartDrawer && _cartDrawer.classList.contains('open')) closeCart();
  }
});

// === SEND TO WHATSAPP ===
const _sendBtn = document.getElementById('sendWhatsapp');
if (_sendBtn) {
  _sendBtn.addEventListener('click', () => {
    if (cart.length === 0) { alert('Cart is empty'); return; }

    const name = (document.getElementById('customerName') || {}).value?.trim() || '';
    const phone = (document.getElementById('customerPhone') || {}).value?.trim() || '';
    const address = (document.getElementById('customerAddress') || {}).value?.trim() || '';
    const orderType = (document.getElementById('orderType') || {}).value || 'Delivery';

    if (!name || !phone || !address) {
      alert('Please provide name, phone and address before sending the order.');
      return;
    }

    // Build lines, then encode once
    const lines = [];
    lines.push('*New Order from Website*');
    lines.push(`*Customer:* ${name}`);
    lines.push(`*Phone:* ${phone}`);
    lines.push(`*Address:* ${address}`);
    lines.push(`*Order Type:* ${orderType}`);
    lines.push('');
    lines.push('*Items:*');

    let total = 0;
    cart.forEach((it, idx) => {
      const p = products.find(pp => pp.id === it.id);
      const line = `${idx+1}. ${p.title} (${it.size}) x ${it.qty} — ₹${p.price[it.size] * it.qty}`;
      lines.push(line);
      total += p.price[it.size] * it.qty;
    });

    lines.push('');
    lines.push(`*Total:* ₹${total}`);
    lines.push('');
    lines.push('_Please confirm order and share payment/pickup details._');

    const text = encodeURIComponent(lines.join('\n'));

    if (!merchantPhone || merchantPhone.length < 7) {
      alert('Merchant phone not configured. Edit merchantPhone in script.js.');
      return;
    }

    const waLink = `https://wa.me/${merchantPhone}?text=${text}`;
    window.open(waLink, '_blank');

    // Optionally clear cart after sending:
    // cart = []; updateCartUI(); closeCart();
  });
}

// === HELPERS ===
function scrollToProducts() {
  const el = document.getElementById('products');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// === FOOTER / MISC HELPERS ===
// populate year if element exists
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// === INITIALIZE ===
renderProducts();
updateCartUI();

// end of script
