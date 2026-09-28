/* =====================================================================
   CONFIGURATION — edit everything wedding-specific here
   ===================================================================== */
const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

const CONFIG = {
  couple: "Mir & Carmela",
  weddingDate: "2026-12-19T15:00:00+08:00",   // ceremony start (Philippine time)
  dateLabel: "December 19, 2026",
  rsvpDeadline: "November 15, 2026",           // placeholder
  additionalGuestPrice: "₱799",
  maxFoods: 4,
  story: [
    { when: "2018", title: "We met", text: "A mutual friend's gathering, a long conversation, and a promise to keep in touch." },
    { when: "2019", title: "First date", text: "Coffee that turned into dinner, and dinner that turned into hours of talking." },
    { when: "2022", title: "Life together", text: "Trips, quiet Sundays, and the sense that home is wherever the other is." },
    { when: "2025", title: "The proposal", text: "One question, one yes, and two families celebrating with us." },
    { when: "2026", title: "Our wedding", text: "We'd love for you to be there when we say I do." }
  ],
  events: [
    { name: "Ceremony", time: "3:00 PM", venue: "St. Joseph Chapel", address: "123 Garden Road, Tagaytay City, Cavite",
      map: "https://www.google.com/maps/search/?api=1&query=Tagaytay+City", directions: "https://www.google.com/maps/dir/?api=1&destination=Tagaytay+City",
      image: "assets/ceremony.jpg" },
    { name: "Reception", time: "5:30 PM", venue: "The Garden Pavilion", address: "456 Ridge Drive, Tagaytay City, Cavite",
      map: "https://www.google.com/maps/search/?api=1&query=Tagaytay+City", directions: "https://www.google.com/maps/dir/?api=1&destination=Tagaytay+City",
      image: "assets/reception.jpg" }
  ],
  foods: [
    { name: "Roasted beef tenderloin", note: "Red wine jus" },
    { name: "Herb-crusted chicken", note: "Lemon cream sauce" },
    { name: "Pan-seared salmon", note: "Dill butter" },
    { name: "Slow-cooked pork belly", note: "Calamansi glaze" },
    { name: "Creamy mushroom pasta", note: "Vegetarian" },
    { name: "Garden salad", note: "Balsamic vinaigrette" },
    { name: "Garlic butter shrimp", note: "" },
    { name: "Seasonal vegetables", note: "" },
    { name: "Chef's dessert platter", note: "" }
  ]
};
/* ===================== end configuration ===================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Render content ---------- */
$("#heroDate").textContent = CONFIG.dateLabel;
$("#footDate").textContent = CONFIG.dateLabel;
$("#price").textContent = CONFIG.additionalGuestPrice;
$("#rsvpSub").textContent = `Kindly reply by ${CONFIG.rsvpDeadline}.`;
$("#timeline").innerHTML = CONFIG.story.map(s =>
  `<li><time>${esc(s.when)}</time><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("");
$("#events").innerHTML = CONFIG.events.map(e => `
  <article class="event"><img src="${esc(e.image)}" alt="${esc(e.venue)}" loading="lazy" onerror="this.style.display='none'">
  <h3>${esc(e.name)}</h3>
  <dl><dt>Date</dt><dd>${esc(CONFIG.dateLabel)}</dd><dt>Time</dt><dd>${esc(e.time)}</dd><dt>Venue</dt><dd>${esc(e.venue)}</dd><dt>Address</dt><dd>${esc(e.address)}</dd></dl>
  <div class="row"><a class="btn" href="${esc(e.map)}" target="_blank" rel="noopener">View location</a><a class="btn" href="${esc(e.directions)}" target="_blank" rel="noopener">Get directions</a></div></article>`).join("");
$("#foods").innerHTML = CONFIG.foods.map((f, i) =>
  `<label class="food"><input type="checkbox" name="food" value="${esc(f.name)}"><span>${esc(f.name)}${f.note ? `<small>${esc(f.note)}</small>` : ""}</span></label>`).join("");

/* ---------- Countdown ---------- */
const cd = $("#countdown");
function tick() {
  let d = new Date(CONFIG.weddingDate) - Date.now();
  if (d <= 0) { cd.textContent = "Today is the day"; return; }
  const u = [["days", 864e5], ["hours", 36e5], ["minutes", 6e4], ["seconds", 1e3]];
  cd.innerHTML = u.map(([l, ms]) => { const v = Math.floor(d / ms); d -= v * ms; return `<div><b>${v}</b><span>${l}</span></div>`; }).join("");
}
tick(); setInterval(tick, 1000);

/* ---------- Sticky RSVP button ---------- */
const sticky = $("#sticky");
new IntersectionObserver(([hero]) => sticky.classList.toggle("show", !hero.isIntersecting && !$("#rsvp").matches(":target")), { threshold: 0 }).observe($(".hero"));
new IntersectionObserver(([r]) => { if (r.isIntersecting) sticky.classList.remove("show"); }, { threshold: .15 }).observe($("#rsvp"));

/* ---------- Multi-step form ---------- */
const form = $("#rsvpForm"), steps = $$(".step"), stepper = $("#stepper");
const next = $("#next"), back = $("#back"), submit = $("#submit");
let cur = 1, sending = false, done = false;
const attending = () => (form.attendance.value === "Joyfully Accept");
const lastStep = () => attending() ? 3 : 1;

function show(n) {
  cur = n;
  steps.forEach(s => s.hidden = +s.dataset.step !== n);
  const total = attending() ? 3 : 1;
  stepper.innerHTML = Array.from({ length: Math.max(total, 1) }, (_, i) => `<li class="${i < n ? "on" : ""}"></li>`).join("");
  stepper.setAttribute("aria-label", `Step ${n} of ${total}`);
  back.hidden = n === 1;
  const last = n === lastStep() && form.attendance.value;
  next.hidden = !!last; submit.hidden = !last;
  const heading = $(`.step[data-step="${n}"] legend`);
  heading.tabIndex = -1; if (n > 1 || form.dataset.touched) heading.focus({ preventScroll: true });
  $("#rsvp").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
}

function setErr(id, msg, field) {
  const p = $("#e-" + id); if (p) p.textContent = msg || "";
  if (field) field.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
function validate(n) {
  let ok = true, first = null;
  const flag = (id, msg, field) => { const good = setErr(id, msg, field); if (!good && !first) first = field || $("#e-" + id); ok = ok && good; };
  if (n === 1) {
    flag("name", form.name.value.trim().length < 2 ? "Please enter your full name." : "", form.name);
    const digits = form.mobile.value.replace(/[\s\-().]/g, "");
    const valid = /^(\+?63|0)9\d{9}$/.test(digits) || /^\+?\d{9,15}$/.test(digits);
    flag("mobile", !form.mobile.value.trim() ? "Please enter your mobile number." : !valid ? "Enter a valid mobile number, e.g. 0917 123 4567." : "", form.mobile);
    flag("attendance", form.attendance.value ? "" : "Please choose whether you can attend.");
  }
  if (n === 2) {
    flag("guests", form.guests.value ? "" : "Please select the number of guests.", form.guests);
    flag("food", $$("[name=food]:checked").length > CONFIG.maxFoods ? `Please choose up to ${CONFIG.maxFoods} dishes.` : "");
  }
  if (n === 3) {
    flag("transportation", form.transportation.value ? "" : "Please tell us about your transportation.");
    if (form.transportation.value.startsWith("Yes")) {
      const p = +form.passengers.value;
      flag("passengers", "", form.passengers);
      if (!(p >= 1)) { form.passengers.setAttribute("aria-invalid", "true"); ok = false; first = first || form.passengers; }
    }
  }
  if (first && first.focus) first.focus();
  return ok;
}

next.onclick = () => { if (validate(cur)) show(cur + 1); };
back.onclick = () => show(cur - 1);
$$("[name=attendance]").forEach(r => r.onchange = () => { setErr("attendance", ""); show(1); });
$$("[name=transportation]").forEach(r => r.onchange = () => { $("#passWrap").hidden = !form.transportation.value.startsWith("Yes"); });

$("#foods").addEventListener("change", () => {
  const boxes = $$("[name=food]"), n = boxes.filter(b => b.checked).length;
  boxes.forEach(b => { const off = !b.checked && n >= CONFIG.maxFoods; b.disabled = off; b.closest(".food").classList.toggle("off", off); });
  $("#foodCount").textContent = `${n} of ${CONFIG.maxFoods} selected`;
});

/* ---------- Submit ---------- */
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (sending || done) return;               // prevent duplicate submissions
  if (!validate(1)) return show(1);
  if (attending()) { if (!validate(2)) return show(2); if (!validate(3)) return show(3); }

  const yes = attending(), foods = $$("[name=food]:checked").map(b => b.value);
  const payload = {
    name: form.name.value.trim(), mobile: form.mobile.value.trim(), attendance: form.attendance.value,
    guests: yes ? form.guests.value : "", additionalGuest: yes && $("#additionalGuest").checked ? "Yes" : "No",
    food1: foods[0] || "", food2: foods[1] || "", food3: foods[2] || "", food4: foods[3] || "",
    transportation: yes ? form.transportation.value : "", passengers: yes && form.transportation.value.startsWith("Yes") ? form.passengers.value : "",
    dietaryRestrictions: yes ? form.dietaryRestrictions.value.trim() : "", message: form.message.value.trim()
  };
  const banner = $("#formErr"); banner.hidden = true;
  sending = true; submit.disabled = true; submit.classList.add("loading"); $(".lab", submit).textContent = "Sending…";
  try {
    if (GOOGLE_SCRIPT_URL.startsWith("YOUR_")) throw new Error("Not configured");
    // text/plain avoids a CORS preflight, which Apps Script does not support
    const res = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed");
    done = true;
    form.hidden = true; $(".sub").hidden = true;
    $("#thanksH").textContent = `Thank you, ${payload.name.split(" ")[0]}!`;
    $("#thanksSub").textContent = yes ? "We can't wait to celebrate with you." : "You will be missed, and we're grateful you let us know.";
    const t = $("#thanks"); t.hidden = false; t.focus(); $("#rsvp").scrollIntoView();
  } catch (err) {
    banner.textContent = "We couldn't send your RSVP. Your answers are still here. Please check your connection and try again.";
    banner.hidden = false; banner.scrollIntoView({ block: "center" });
    sending = false; submit.disabled = false; submit.classList.remove("loading"); $(".lab", submit).textContent = "Send RSVP";
  }
});

show(1); form.dataset.touched = "1";
