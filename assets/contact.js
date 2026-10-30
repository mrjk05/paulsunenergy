// Contact form → email via Web3Forms (https://web3forms.com). Replaces Solo's form backend.
// The access key only allows sending to the inbox it was created for, so it is safe to be public.
(function () {
  var RECIPIENT = "admin@paulsunenergy.com";
  var ACCESS_KEY = "7fcf9b23-6e11-426b-9144-20624cf507b5";
  var ENDPOINT = "https://api.web3forms.com/submit";

  var button = document.getElementById("contact-submit");
  var status = document.getElementById("contact-status");
  if (!button) return;
  var fields = {
    email: document.getElementById("email"),
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    message: document.getElementById("message"),
  };

  function show(text, ok) {
    status.textContent = text;
    status.className = "mt-3 fw-semibold" + (ok ? "" : " text-warning");
  }

  function validate() {
    var bad = [];
    var email = fields.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(fields.email);
    if (!fields.name.value.trim()) bad.push(fields.name);
    if (!fields.message.value.trim()) bad.push(fields.message);
    Object.keys(fields).forEach(function (k) {
      fields[k].classList.toggle("is-invalid", bad.indexOf(fields[k]) !== -1);
    });
    if (bad.length) bad[0].focus();
    return !bad.length;
  }

  button.addEventListener("click", function () {
    if (!validate()) {
      show("Please fill in your email address, name and message.", false);
      return;
    }
    if (document.getElementById("_honey").value) return; // bot

    var label = button.textContent;
    button.disabled = true;
    button.textContent = "Sending…";
    show("", true);

    // FormData keeps this a "simple" request: no CORS preflight, which Web3Forms rejects.
    var data = new FormData();
    data.append("access_key", ACCESS_KEY);
    data.append("subject", "New message from paulsunenergy.com");
    data.append("from_name", "paulsunenergy.com");
    data.append("replyto", fields.email.value.trim());
    data.append("Name", fields.name.value.trim());
    data.append("Email", fields.email.value.trim());
    data.append("Phone", fields.phone.value.trim());
    data.append("Message", fields.message.value.trim());

    fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || String(res.d.success) !== "true") throw new Error(res.d.message || "failed");
        Object.keys(fields).forEach(function (k) { fields[k].value = ""; });
        show("Thanks! Your message has been sent. We'll be in touch soon.", true);
      })
      .catch(function () {
        show("Sorry, your message couldn't be sent. Please email " + RECIPIENT + " directly.", false);
      })
      .then(function () {
        button.disabled = false;
        button.textContent = label;
      });
  });
})();
