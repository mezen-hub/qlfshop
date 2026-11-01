"use strict";
const WHATSAPP = "21656555888";
const PRICE = 55;
const IMAGE_BASE = "https://raw.githubusercontent.com/mezen-hub/qlfshop/main/";
let products = [
 {id:"dl-gris",name:"Dans la légende",collection:"dans-legende",label:"DANS LA LÉGENDE",color:"Gris",image:"dans-legende-gris.jpg"},
 {id:"dl-rose",name:"Dans la légende",collection:"dans-legende",label:"DANS LA LÉGENDE",color:"Rose",image:"dans-legende-rose.jpg"},
 {id:"dl-turquoise",name:"Dans la légende",collection:"dans-legende",label:"DANS LA LÉGENDE",color:"Turquoise",image:"dans-legende-turquoise.jpg"},
 {id:"dl-blanc",name:"Dans la légende",collection:"dans-legende",label:"DANS LA LÉGENDE",color:"Blanc",image:"dans-legende-blanc.jpg"},
 {id:"dl-noir",name:"Dans la légende",collection:"dans-legende",label:"DANS LA LÉGENDE",color:"Noir",image:"dans-legende-noir.jpg"},
 {id:"df-gris",name:"Deux frères",collection:"deux-freres",label:"DEUX FRÈRES",color:"Gris",image:"deux-freres-gris.jpg"},
 {id:"df-noir",name:"Deux frères",collection:"deux-freres",label:"DEUX FRÈRES",color:"Noir",image:"deux-freres-noir.jpg"},
 {id:"df-marine",name:"Deux frères",collection:"deux-freres",label:"DEUX FRÈRES",color:"Bleu marine",image:"deux-freres-marine.jpg"},
 {id:"df-turquoise",name:"Deux frères",collection:"deux-freres",label:"DEUX FRÈRES",color:"Turquoise",image:"deux-freres-turquoise.jpg"},
 {id:"df-blanc",name:"Deux frères",collection:"deux-freres",label:"DEUX FRÈRES",color:"Blanc",image:"deux-freres-blanc.jpg"}
];
const $ = s => document.querySelector(s);
const imageUrl = p => p.image_url || (IMAGE_BASE + p.image);
const productPrice = p => Number(p.price ?? PRICE);
const db = () => window.qlfSupabase;
let activeCollection = "all", selected = null, cart = [];
try { cart = JSON.parse(localStorage.getItem("qlf-premium-bag") || "[]"); if(!Array.isArray(cart)) cart=[]; } catch { cart=[]; }
cart = cart.filter(x => products.some(p=>p.id===x.id) && ["XS","S","M","L","XL"].includes(x.size) && Number.isInteger(x.qty) && x.qty>0);
const money = n => `${n} DT`;
const safe = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){localStorage.setItem("qlf-premium-bag",JSON.stringify(cart));}
function visibleProducts(){const color=$("#color-filter").value;return products.filter(p=>(activeCollection==="all"||p.collection===activeCollection)&&(color==="all"||p.color===color));}
function renderProducts(){
 const list=visibleProducts();
 $("#product-grid").innerHTML=list.map(p=>`<article class="product-card">
  <div class="product-image"><img src="${imageUrl(p)}" alt="${safe(p.name)} — ${safe(p.color)}" loading="lazy"><span class="product-tag">${money(productPrice(p))}</span><button class="quick-add" data-product="${p.id}">CHOISIR MA TAILLE +</button></div>
  <div class="product-meta"><h3>${safe(p.name)}</h3><strong>${money(productPrice(p))}</strong></div><div class="product-sub"><span>${safe(p.label)}</span><span>${safe(p.color).toUpperCase()}</span></div></article>`).join("");
}
function openProduct(id){
 selected=products.find(p=>p.id===id); if(!selected)return;
 $("#dialog-image").src=imageUrl(selected);$("#dialog-image").alt=`${selected.name} — ${selected.color}`;
 $("#dialog-title").textContent=selected.name;$("#dialog-collection").textContent=selected.label;$("#dialog-color").textContent=`COULEUR : ${selected.color.toUpperCase()}`;
 $("#dialog-size").value="";$("#dialog-qty").value=1;$("#dialog-message").textContent="";updateAddPrice();
 $("#product-overlay").hidden=false;
}
function updateAddPrice(){const q=Math.max(1,Math.min(20,parseInt($("#dialog-qty").value)||1));$("#add-item").textContent=`AJOUTER AU PANIER — ${money(q*(selected ? productPrice(selected) : PRICE))}`;}
function renderBag(){
 const count=cart.reduce((s,x)=>s+x.qty,0);$("#bag-count").textContent=count;
 $("#empty-bag").hidden=cart.length>0;$("#bag-checkout").hidden=cart.length===0;
 $("#bag-items").innerHTML=cart.map((x,i)=>{const p=products.find(p=>p.id===x.id);if(!p)return"";return `<article class="bag-row"><img src="${imageUrl(p)}" alt=""><div><h3>${safe(p.name)}</h3><p>${safe(p.color)} · TAILLE ${x.size}<br>${money(productPrice(p))} / UNITÉ</p><div class="qty-controls"><button data-action="minus" data-i="${i}">−</button><span>${x.qty}</span><button data-action="plus" data-i="${i}">+</button></div></div><div class="row-end">${money(x.qty*productPrice(p))}<button class="remove" data-action="remove" data-i="${i}">RETIRER</button></div></article>`}).join("");
 $("#bag-total").textContent=money(cart.reduce((sum,x)=>{const p=products.find(p=>p.id===x.id);return sum+x.qty*(p?productPrice(p):PRICE);},0));save();
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
document.addEventListener("click",e=>{
 const p=e.target.closest("[data-product]");if(p)openProduct(p.dataset.product);
 const f=e.target.closest("[data-filter]");if(f){activeCollection=f.dataset.filter;document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===f));renderProducts();}
 const jump=e.target.closest("[data-jump]");if(jump){activeCollection=jump.dataset.jump;document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===activeCollection));renderProducts();}
 const close=e.target.closest("[data-close]");if(close)$("#"+close.dataset.close).hidden=true;
 const act=e.target.closest("[data-action]");if(act){const i=+act.dataset.i;if(!cart[i])return;if(act.dataset.action==="plus")cart[i].qty=Math.min(20,cart[i].qty+1);if(act.dataset.action==="minus")cart[i].qty--;if(act.dataset.action==="remove"||cart[i].qty<=0)cart.splice(i,1);renderBag();}
});
$("#color-filter").addEventListener("change",renderProducts);
$("#dialog-qty").addEventListener("input",updateAddPrice);
$("#add-item").addEventListener("click",()=>{
 if(!selected)return;const size=$("#dialog-size").value,qty=parseInt($("#dialog-qty").value);
 if(!["XS","S","M","L","XL"].includes(size)){$("#dialog-message").textContent="Choisis une taille.";return;}
 if(!Number.isInteger(qty)||qty<1||qty>20){$("#dialog-message").textContent="Quantité invalide (1 à 20).";return;}
 const found=cart.find(x=>x.id===selected.id&&x.size===size);
 if(found)found.qty=Math.min(20,found.qty+qty);else cart.push({id:selected.id,size,qty});
 renderBag();$("#product-overlay").hidden=true;toast("Ajouté au panier.");
});
$("#open-bag").addEventListener("click",()=>{$("#bag-overlay").hidden=false;renderBag();});
$("#whatsapp-order").addEventListener("click",()=>{
 if(!cart.length)return;
 const lines=["Bonjour QLF SHOP !","","Je souhaite commander :",""];
 cart.forEach((x,i)=>{const p=products.find(p=>p.id===x.id);if(!p)return;lines.push(`${i+1}. ${p.name}`,`Couleur : ${p.color}`,`Taille : ${x.size}`,`Quantité : ${x.qty}`,`Sous-total : ${money(x.qty*productPrice(p))}`,"");});
 lines.push("--------------------",`TOTAL PRODUITS : ${money(cart.reduce((s,x)=>{const p=products.find(p=>p.id===x.id);return s+x.qty*(p?productPrice(p):PRICE);},0))}`,"","Merci de me confirmer la disponibilité et les frais de livraison.");
 const name=$("#buyer-name").value.trim(),phone=$("#buyer-phone").value.trim(),address=$("#buyer-address").value.trim();if(name)lines.push(`Nom : ${name}`);if(phone)lines.push(`Téléphone : ${phone}`);if(address)lines.push(`Adresse : ${address}`);
 const total=cart.reduce((sum,x)=>{const p=products.find(p=>p.id===x.id);return sum+x.qty*(p?productPrice(p):PRICE);},0);
 const orderItems=cart.map(x=>{const p=products.find(p=>p.id===x.id);return {product_id:x.id,name:p?.name||"Produit",color:p?.color||"",size:x.size,quantity:x.qty,unit_price:p?productPrice(p):PRICE};});
 const client=db();
 if(client){
   client.from("orders").insert({customer_name:name,customer_phone:phone,customer_address:address,items:orderItems,total,status:"pending"}).then(({error})=>{if(error){console.error("QLF order save error:",error);toast("Commande non enregistrée en base. Confirme sur WhatsApp.");}else{toast("Commande enregistrée dans QLF SHOP.");}});
 }
 window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank","noopener,noreferrer");
});
document.querySelectorAll(".overlay,.bag-overlay").forEach(el=>el.addEventListener("click",e=>{if(e.target===el)el.hidden=true;}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){ $("#product-overlay").hidden=true;$("#bag-overlay").hidden=true; }});
$("#year").textContent=new Date().getFullYear();
async function syncProducts(){
 const client=db(); if(!client)return;
 const {data,error}=await client.from("products").select("id,name,collection,label,color,image_url,price,stock,active").eq("active",true).order("created_at",{ascending:true});
 if(error){console.warn("QLF products not loaded from Supabase:",error.message);return;}
 if(data?.length){products=data.map(p=>({...p,image_url:p.image_url||"",price:Number(p.price)||PRICE}));cart=cart.filter(x=>products.some(p=>p.id===x.id));renderProducts();renderBag();}
}
renderProducts();renderBag();syncProducts();