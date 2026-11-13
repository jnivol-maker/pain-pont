import { createClient } from "@supabase/supabase-js";
import "./style.css";
const url = import.meta.env.VITE_SUPABASE_URL || "https://gesxkccnvxwmjitqcrkf.supabase.co";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_tDAjVLSJSUeo_UIDK3cHQQ_URI-Fssr";
const pinUrl = import.meta.env.VITE_ADMIN_PIN_FUNCTION || url + "/functions/v1/admin-pin";
const db = createClient(url,key), iban="BE79 0016 8783 2433";
let sale=null, products=[], qty={};
const app=document.querySelector("#app");
const money=n=>new Intl.NumberFormat("fr-BE",{style:"currency",currency:"EUR"}).format(n||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function load(){
 const {data,error}=await db.rpc("public_current_sale");
 if(error){app.innerHTML='<main><h1>Paint Pont</h1><p>Le site démarre, mais les données ne sont pas accessibles. Réessaie dans un instant.</p></main>';return;}
 sale=data?.sale||null; products=data?.products||[];
 render();
}
function render(){
 app.innerHTML=`<header><b>PAINT PONT</b><span>La boulangerie du village</span><button id="admin">Administration</button></header>
 <main><section class="hero"><small>LA FOURNÉE DE LA SEMAINE</small><h1>Du bon pain,<br><i>sans se tromper.</i></h1><p>Choisis tes pains, réserve ta quantité et retrouve le récapitulatif de ta commande.</p></section>
 <p class="status">${sale?.is_open?"Réservations ouvertes":"Réservations fermées"} · ${esc(sale?.title||"")}</p>
 <h2>La sélection</h2><section class="products">${products.map(p=>`<article><div><h3>${esc(p.name)}</h3><small>${p.stock} disponible(s)</small></div><b>${money(p.price)}</b><div class="step"><button data-q="${p.id}" data-d="-1">−</button>${qty[p.id]||0}<button data-q="${p.id}" data-d="1">+</button></div></article>`).join("")||"<p>La prochaine fournée se prépare.</p>"}</section>
 <section class="order"><h2>Ta commande</h2><h2>${money(products.reduce((s,p)=>s+(qty[p.id]||0)*p.price,0))}</h2>
 <form id="order"><label>Ton nom<input name="customer_name" required maxlength="80" placeholder="Prénom et nom"></label><label>Ton numéro de téléphone<input name="phone" required type="tel" placeholder="04…"></label><button class="primary" ${!sale?.is_open?"disabled":""}>Confirmer ma réservation →</button></form>
 <p class="muted">Une seule réservation par numéro et par semaine. Maximum 2 pains par variété.</p></section>
 <p class="muted">Paiement par virement · IBAN : ${iban}</p></main><div id="toast"></div>`;
 document.querySelector("#admin").onclick=adminLogin;
 document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{let id=b.dataset.q,p=products.find(x=>x.id===id);qty[id]=Math.max(0,Math.min(2,p.stock,(qty[id]||0)+Number(b.dataset.d)));render();});
 document.querySelector("#order").onsubmit=submit;
}
async function submit(e){
 e.preventDefault();const f=new FormData(e.target),items=products.filter(p=>qty[p.id]>0).map(p=>({product_id:p.id,quantity:qty[p.id]}));
 if(!items.length)return alert("Choisis au moins un pain.");
 const btn=e.target.querySelector("button");btn.disabled=true;
 const {data,error}=await db.rpc("place_reservation",{p_customer_name:f.get("customer_name"),p_phone:f.get("phone"),p_items:items});
 if(error){alert(error.message);btn.disabled=false;return;}
 app.innerHTML=`<main><h1>Merci pour ta commande !</h1><p>Réservation enregistrée.</p><section class="order"><p>Montant à payer : <b>${money(data?.total_amount)}</b></p><p>Communication : PAINT PONT</p><p>IBAN : <b>${iban}</b></p></section><button class="primary" onclick="location.reload()">Retour à l'accueil</button></main>`;
}
async function adminLogin(){
 const pin=prompt("Code PIN administrateur");
 if(!pin)return;
 const r=await fetch(pinUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"verify",pin})});
 const d=await r.json();if(!r.ok){alert(d.error||"Accès refusé");return;}
 sessionStorage.setItem("pp_admin_token",d.token);alert("Connexion administrateur établie.");
}
load();setInterval(load,15000);
