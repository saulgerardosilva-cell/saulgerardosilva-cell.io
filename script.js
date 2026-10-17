const products = [
  {id:1,name:"Origen de la Casa",category:"cafe",categoryLabel:"Café en grano",price:245,oldPrice:280,emoji:"🫘",tag:"Más vendido",description:"Notas de chocolate, nuez y caramelo.",rating:"★★★★★",featured:1,bg:"#e9d5be"},
  {id:2,name:"Montaña de Chiapas",category:"cafe",categoryLabel:"Café de origen",price:285,oldPrice:null,emoji:"🌿",tag:"Origen mexicano",description:"Aroma floral y final dulce, 340 g.",rating:"★★★★★",featured:2,bg:"#dce1d0"},
  {id:3,name:"Prensa francesa",category:"accesorios",categoryLabel:"Preparación",price:420,oldPrice:null,emoji:"🫖",tag:"Favorito",description:"Prepara una taza intensa y aromática.",rating:"★★★★☆",featured:3,bg:"#e5d8ca"},
  {id:4,name:"Taza de cerámica",category:"accesorios",categoryLabel:"Accesorios",price:195,oldPrice:null,emoji:"☕",tag:"Hecho para ti",description:"Cerámica artesanal en tono crema.",rating:"★★★★★",featured:4,bg:"#e7d8c5"},
  {id:5,name:"Kit ritual de café",category:"regalos",categoryLabel:"Sets de regalo",price:590,oldPrice:650,emoji:"🎁",tag:"-10%",description:"Una selección especial para regalar.",rating:"★★★★★",featured:5,bg:"#ead6c7"},
  {id:6,name:"Café descafeinado",category:"cafe",categoryLabel:"Café molido",price:230,oldPrice:null,emoji:"☕",tag:"Suave",description:"Todo el aroma, para disfrutar a cualquier hora.",rating:"★★★★☆",featured:6,bg:"#e5d5c6"},
  {id:7,name:"Molino manual",category:"accesorios",categoryLabel:"Preparación",price:680,oldPrice:null,emoji:"⚙️",tag:"Para baristas",description:"Muele tus granos justo antes de preparar.",rating:"★★★★★",featured:7,bg:"#d9d4c7"},
  {id:8,name:"Caja de degustación",category:"regalos",categoryLabel:"Sets de regalo",price:750,oldPrice:null,emoji:"📦",tag:"Edición especial",description:"Tres perfiles de sabor para descubrir.",rating:"★★★★★",featured:8,bg:"#e8d5c0"}
];

const cart = new Map();
const $ = (id) => document.getElementById(id);
const money = (value) => value.toLocaleString("es-MX", {style:"currency",currency:"MXN"});
let toastTimer;

function showToast(message){
  const toast=$("toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}
function renderProducts(){
  const query=$("searchInput").value.trim().toLowerCase();
  const category=$("categoryFilter").value;
  const sort=$("sortFilter").value;
  let list=products.filter(p=>(category==="todos"||p.category===category) && (p.name+" "+p.description+" "+p.categoryLabel).toLowerCase().includes(query));
  if(sort==="low") list.sort((a,b)=>a.price-b.price);
  else if(sort==="high") list.sort((a,b)=>b.price-a.price);
  else list.sort((a,b)=>a.featured-b.featured);
  $("productGrid").innerHTML=list.map(p=>`
    <article class="product-card">
      <div class="product-image" style="background:${p.bg}">
        <span class="product-tag">${p.tag}</span><span class="product-emoji" aria-hidden="true">${p.emoji}</span>
        <button class="quick-add" data-add="${p.id}" aria-label="Agregar ${p.name} al carrito" title="Agregar al carrito">+</button>
      </div>
      <div class="product-info"><span class="product-category">${p.categoryLabel}</span><h3>${p.name}</h3><p>${p.description}</p>
        <div class="product-bottom"><span class="product-price">${money(p.price)} ${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:""}</span><span class="product-rating" aria-label="Calificación">${p.rating}</span></div>
      </div>
    </article>`).join("");
  $("emptyState").classList.toggle("hidden",list.length>0);
}
function addToCart(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  const item=cart.get(id)||{product:p,qty:0}; item.qty++; cart.set(id,item);
  updateCart(); showToast(`${p.name} se agregó a tu bolsa.`);
}
function changeQty(id,delta){
  const item=cart.get(id); if(!item)return;
  item.qty+=delta; if(item.qty<=0)cart.delete(id); else cart.set(id,item);
  updateCart();
}
function cartTotal(){return [...cart.values()].reduce((sum,item)=>sum+item.product.price*item.qty,0)}
function updateCart(){
  const count=[...cart.values()].reduce((sum,item)=>sum+item.qty,0);
  $("cartCount").textContent=count; $("cartSubtotal").textContent=money(cartTotal()); $("checkoutTotal").textContent=money(cartTotal())+" MXN";
  if(cart.size===0){$("cartItems").innerHTML='<div class="cart-empty">Tu bolsa está esperando algo delicioso.<br><br><a class="text-link" href="#catalogo" id="backToShop">Explorar productos ↗</a></div>';}
  else $("cartItems").innerHTML=[...cart.values()].map(({product:p,qty})=>`
    <div class="cart-item"><div class="cart-item-art" style="background:${p.bg}">${p.emoji}</div>
      <div><h3>${p.name}</h3><small>${money(p.price)} por unidad</small><div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Quitar una unidad">−</button><span>${qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Agregar una unidad">+</button></div></div>
      <span class="cart-item-price">${money(p.price*qty)}</span>
    </div>`).join("");
}
function openCart(){
  $("cartOverlay").classList.remove("hidden"); $("cartDrawer").classList.add("open"); $("cartDrawer").setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
}
function closeCart(){
  $("cartOverlay").classList.add("hidden"); $("cartDrawer").classList.remove("open"); $("cartDrawer").setAttribute("aria-hidden","true"); document.body.classList.remove("modal-open");
}
function openModal(id){$(id).classList.remove("hidden");document.body.classList.add("modal-open");}
function closeModal(id){$(id).classList.add("hidden");if($("checkoutModal").classList.contains("hidden")&&$("accountModal").classList.contains("hidden"))document.body.classList.remove("modal-open");}

$("productGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(btn)addToCart(Number(btn.dataset.add));});
$("cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]");
  if(qty)changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));
  if(e.target.closest("#backToShop"))closeCart();
});
$("searchInput").addEventListener("input",renderProducts);
$("categoryFilter").addEventListener("change",renderProducts);
$("sortFilter").addEventListener("change",renderProducts);
$("cartOpen").addEventListener("click",openCart);
$("cartClose").addEventListener("click",closeCart);
$("cartOverlay").addEventListener("click",closeCart);
$("checkoutOpen").addEventListener("click",()=>{
  if(cart.size===0){showToast("Agrega al menos un producto antes de continuar.");return;}
  closeCart(); $("orderSuccess").classList.add("hidden"); $("checkoutForm").classList.remove("hidden"); openModal("checkoutModal");
});
$("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=new FormData(e.target).get("name").trim();
  const orderNumber="AC-"+Math.floor(10000+Math.random()*89999);
  $("checkoutForm").classList.add("hidden");
  $("orderSuccess").innerHTML=`<strong>¡Gracias, ${escapeHtml(name)}!</strong><br>Tu pedido de demostración <strong>${orderNumber}</strong> se generó correctamente. Total ilustrativo: <strong>${money(cartTotal())} MXN</strong>.<br><br>No se realizó ningún cobro y los datos no se enviaron a ningún servidor.`;
  $("orderSuccess").classList.remove("hidden");
  cart.clear(); updateCart(); showToast("Pedido de demostración generado.");
});
$("accountOpen").addEventListener("click",()=>openModal("accountModal"));
$("accountOpen2").addEventListener("click",()=>openModal("accountModal"));
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>closeModal(btn.dataset.close)));
document.querySelectorAll(".modal").forEach(modal=>modal.addEventListener("click",e=>{if(e.target===modal)closeModal(modal.id)}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();document.querySelectorAll(".modal").forEach(m=>closeModal(m.id));}});
$("accountForm").addEventListener("submit",e=>{
  e.preventDefault(); $("accountFeedback").textContent="¡Formulario de demostración completado! No se creó una cuenta ni se guardaron tus datos."; e.target.reset();
});
$("newsletterForm").addEventListener("submit",e=>{
  e.preventDefault(); $("newsletterMessage").textContent="¡Gracias por tu interés! Este formulario es ilustrativo y no guarda ni envía tu correo."; e.target.reset();
});
$("copyPromo").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText("HOLAAROMA");showToast("Código HOLAAROMA copiado.");}
  catch{showToast("Tu código promocional es: HOLAAROMA");}
});
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
$("mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
function escapeHtml(value){return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));}
renderProducts(); updateCart();
