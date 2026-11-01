"use strict";
const $ = s => document.querySelector(s);
const client = () => window.qlfSupabase;
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const statusNames = {pending:"En attente",confirmed:"Confirmée",shipped:"Expédiée",delivered:"Livrée",cancelled:"Annulée"};
function show(id){["setup-warning","login-panel","denied-panel","dashboard"].forEach(x=>$("#"+x).hidden=x!==id);}
function notify(message,error=false){const el=$("#product-message");el.textContent=message;el.style.color=error?"#d98d8d":"#c2c4c7";}
function clearForm(){ $("#product-form").reset();$("#product-id").value="";$("#p-price").value=55;$("#p-stock").value=10;$("#p-active").checked=true;notify(""); }
async function signOut(){await client().auth.signOut();show("login-panel");$("#logout").hidden=true;}
async function checkAdmin(session){
 if(!session){show("login-panel");$("#logout").hidden=true;return;}
 $("#logout").hidden=false;$("#admin-email").textContent=session.user.email||"Administrateur";
 const {data,error}=await client().from("user_roles").select("role").eq("user_id",session.user.id).maybeSingle();
 if(error||data?.role!=="admin"){show("denied-panel");return;}
 show("dashboard");await Promise.all([loadProducts(),loadOrders()]);
}
async function loadProducts(){
 const {data,error}=await client().from("products").select("*").order("created_at",{ascending:true});
 if(error){$("#products-list").innerHTML=`<p class="error">${esc(error.message)}</p>`;return;}
 $("#product-count").textContent=data.length;
 $("#products-list").innerHTML=data.map(p=>`<div class="data-row"><div><strong>${esc(p.name)} — ${esc(p.color)}</strong><small>${Number(p.price)} DT · Stock : ${p.stock} · ${p.active?"Visible":"Masqué"}</small></div><div class="row-buttons"><button class="button mini" data-edit="${esc(p.id)}">MODIFIER</button><button class="button mini" data-toggle="${esc(p.id)}" data-active="${p.active}">${p.active?"MASQUER":"PUBLIER"}</button></div></div>`).join("")||"<p class='muted'>Aucun produit.</p>";
}
async function loadOrders(){
 const {data,error}=await client().from("orders").select("*").order("created_at",{ascending:false}).limit(100);
 if(error){$("#orders-list").innerHTML=`<p class="error">${esc(error.message)}</p>`;return;}
 $("#order-count").textContent=data.length;
 $("#orders-list").innerHTML=data.map(o=>{
  const items=Array.isArray(o.items)?o.items.map(i=>`${i.quantity} × ${i.name} / ${i.color} — ${i.size}`).join("\n"):"";
  const date=new Date(o.created_at).toLocaleString("fr-FR");
  return `<article class="order-card"><div class="order-head"><strong>Commande #${esc(String(o.id).slice(0,8).toUpperCase())}</strong><span class="order-id">${esc(date)}</span></div><p>${esc(o.customer_name||"Client")} · ${esc(o.customer_phone||"Sans téléphone")}<br>${esc(o.customer_address||"Adresse non renseignée")}<br><b>${Number(o.total)} DT</b></p><div class="order-items">${esc(items)}</div><div class="order-head"><span class="order-id">STATUT</span><select class="status-select" data-order="${esc(o.id)}">${Object.entries(statusNames).map(([v,l])=>`<option value="${v}" ${o.status===v?"selected":""}>${l}</option>`).join("")}</select></div></article>`;
 }).join("")||"<p class='muted'>Aucune commande pour le moment.</p>";
}
$("#login-form").addEventListener("submit",async e=>{e.preventDefault();$("#login-error").textContent="Connexion…";const {error}=await client().auth.signInWithPassword({email:$("#email").value.trim(),password:$("#password").value});if(error){$("#login-error").textContent="Connexion impossible : vérifie ton email et ton mot de passe.";return;}const {data}=await client().auth.getSession();await checkAdmin(data.session);});
$("#logout").addEventListener("click",signOut);$("#denied-logout").addEventListener("click",signOut);$("#new-product").addEventListener("click",clearForm);$("#cancel-edit").addEventListener("click",clearForm);$("#refresh-orders").addEventListener("click",loadOrders);
$("#product-form").addEventListener("submit",async e=>{e.preventDefault();const id=$("#product-id").value||`${$("#p-collection").value}-${Date.now().toString(36)}`;const collection=$("#p-collection").value;const payload={id,name:$("#p-name").value.trim(),collection,label:collection==="dans-legende"?"DANS LA LÉGENDE":"DEUX FRÈRES",color:$("#p-color").value.trim(),image_url:$("#p-image").value.trim(),price:Number($("#p-price").value),stock:Number($("#p-stock").value),active:$("#p-active").checked,updated_at:new Date().toISOString()};const {error}=await client().from("products").upsert(payload);if(error){notify("Erreur : "+error.message,true);return;}notify("Produit enregistré.");clearForm();await loadProducts();});
$("#products-list").addEventListener("click",async e=>{const edit=e.target.closest("[data-edit]");const toggle=e.target.closest("[data-toggle]");if(edit){const {data,error}=await client().from("products").select("*").eq("id",edit.dataset.edit).single();if(error){notify(error.message,true);return;}$("#product-id").value=data.id;$("#p-name").value=data.name;$("#p-collection").value=data.collection;$("#p-color").value=data.color;$("#p-price").value=data.price;$("#p-stock").value=data.stock;$("#p-image").value=data.image_url;$("#p-active").checked=data.active;window.scrollTo({top:0,behavior:"smooth"});}if(toggle){const active=toggle.dataset.active!=="true";const {error}=await client().from("products").update({active,updated_at:new Date().toISOString()}).eq("id",toggle.dataset.toggle);if(error)notify(error.message,true);else await loadProducts();}});
$("#orders-list").addEventListener("change",async e=>{const select=e.target.closest("[data-order]");if(!select)return;const {error}=await client().from("orders").update({status:select.value}).eq("id",select.dataset.order);if(error){alert("Impossible de modifier le statut : "+error.message);}else await loadOrders();});
(async()=>{if(!client()){show("setup-warning");return;}const {data}=await client().auth.getSession();await checkAdmin(data.session);client().auth.onAuthStateChange((_event,session)=>{checkAdmin(session);});})();
