// ------------ CONFIG ------------
const CART_KEY = 'site_cart_v1';

// WhatsApp number (with country code, no +)
const merchantPhone = '918903683094';

// UPI ID (still used only inside WhatsApp text if you want later)
const merchantUpi = 'aswinmurugan1233-1@okaxis';

// UPI name
const merchantName = 'Golden Nectar';

// ------------ PRODUCTS ------------
const products = [
  { id: 'p1', title: 'Magali Honey',  price: { '1kg':1100, '500g':600, '250g':350 }, desc: 'Premium golden Magali honey, rich in natural goodness.', img: 'assets/malai.png' },
  { id: 'p2', title: 'Moringa Honey', price: { '1kg':1100, '500g':600, '250g':350 }, desc: 'Infused with nutrients of Moringa flowers.',             img: 'assets/mugarai.png' },
  { id: 'p3', title: 'Kombu Honey (Dammer Bee)', price: { '1kg':1200, '500g':700, '250g':400 }, desc: 'Rare and medicinal honey from Dammer bees.', img: 'assets/kombu.png' },
  { id: 'p4', title: 'Multi Floral Honey',       price: { '1kg':900,  '500g':500, '250g':300 }, desc: 'A delightful blend of nectar from various wildflowers.', img: 'assets/mix.png' }
];

// ------------ CART STATE ------------
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return [];
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  renderCart();
}

window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) {
    cart = loadCart();
    renderCart();
  }
});

// ------------ RENDER PRODUCTS ------------
function renderProducts() {
  const container = document.getElementById('products');
  if (!container) return;
  container.innerHTML = '';

  products.forEach((prod) => {
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

    ['1kg','500g','250g'].forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'size' + (i === 0 ? ' active' : '');
      btn.textContent = s;
      btn.onclick = () => {
        sizes.querySelectorAll('.size').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        const amount = card.querySelector('.amount');
        if (amount) amount.textContent = '₹' + prod.price[s];
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
      const active = sizes.querySelector('.size.active');
      const selected = active ? active.textContent : '1kg';
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

// ------------ CART LOGIC ------------
function addToCart(id, size, qty) {
  const found = cart.find(i => i.id === id && i.size === size);
  if (found) found.qty += qty;
  else cart.push({ id, size, qty });
  saveCart();
}

function renderCart() {
  const list        = document.getElementById('cartList');
  const emptyMsg    = document.getElementById('emptyMsg');
  const totalsBlock = document.getElementById('totalsBlock');
  const cartTotal   = document.getElementById('cartTotal');

  if (!list || !emptyMsg || !totalsBlock || !cartTotal) return;

  list.innerHTML = '';

  if (!cart || cart.length === 0) {
    emptyMsg.style.display   = 'block';
    totalsBlock.style.display = 'none';
    cartTotal.textContent    = '₹0';
    return;
  }

  emptyMsg.style.display   = 'none';
  totalsBlock.style.display = 'block';

  cart.forEach((item, idx) => {
    const p = products.find(pp => pp.id === item.id) || { title: 'Unknown', price: {} };

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.title)}">
      <div class="meta">
        <div class="name">${escapeHtml(p.title)} <span class="muted">— ${escapeHtml(item.size)}</span></div>
        <div class="muted price-line">₹${p.price[item.size] || 0} × ${item.qty} = ₹${(p.price[item.size] || 0) * item.qty}</div>
        <div class="qty">
          <button data-idx="${idx}" class="dec">−</button>
          <div class="num">${item.qty}</div>
          <button data-idx="${idx}" class="inc">+</button>
          <button data-idx="${idx}" class="rem ghost" style="margin-left:8px;padding:6px 10px;border-radius:8px">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });

  // qty buttons
  list.querySelectorAll('.inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx;
      cart[i].qty++;
      saveCart();
    });
  });

  list.querySelectorAll('.dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx;
      cart[i].qty = Math.max(1, cart[i].qty - 1);
      saveCart();
    });
  });

  list.querySelectorAll('.rem').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx;
      cart.splice(i, 1);
      saveCart();
    });
  });

  const total = cart.reduce((sum, it) => {
    const p = products.find(pp => pp.id === it.id) || { price: {} };
    return sum + (p.price[it.size] || 0) * it.qty;
  }, 0);

  cartTotal.textContent = '₹' + total;
}

// ------------ HELPERS ------------
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ------------ EVENT BINDING ------------
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();

  const sendWhats = document.getElementById('sendWhatsapp');
  const clearBtn  = document.getElementById('clearCart');

  if (sendWhats) {
    sendWhats.addEventListener('click', () => {
      if (!cart || cart.length === 0) { alert('Cart is empty'); return; }

      const name  = (document.getElementById('customerName') || {}).value?.trim() || '';
      const phone = (document.getElementById('customerPhone') || {}).value?.trim() || '';
      const addr  = (document.getElementById('customerAddress') || {}).value?.trim() || '';

      if (!name || !phone || !addr) {
        alert('Please enter name, phone and address before sending order.');
        return;
      }

      const lines = [];
      lines.push('*New Order from Website*');
      lines.push('*Customer:* ' + name);
      lines.push('*Phone:* ' + phone);
      lines.push('*Address:* ' + addr);
      lines.push('');
      lines.push('*Items:*');

      let total = 0;
      cart.forEach((it, idx) => {
        const p = products.find(pp => pp.id === it.id) || { title:'Unknown', price:{} };
        const itemTotal = (p.price[it.size] || 0) * it.qty;
        lines.push(`${idx+1}. ${p.title} (${it.size}) x ${it.qty} — ₹${itemTotal}`);
        total += itemTotal;
      });

      lines.push('');
      lines.push('*Total:* ₹' + total);
      lines.push('');
      lines.push('_Please confirm order and share payment/pickup details._');

      const text = encodeURIComponent(lines.join('\n'));
      const waLink = 'https://wa.me/' + merchantPhone + '?text=' + text;
      window.open(waLink, '_blank');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear cart?')) return;
      cart = [];
      saveCart();
    });
  }
});
