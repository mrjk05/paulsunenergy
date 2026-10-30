// Contact form → email via FormSubmit (https://formsubmit.co). Replaces Solo's form backend.
(function () {
  var RECIPIENT = "admin@paulsunenergy.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + RECIPIENT;

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

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        Name: fields.name.value.trim(),
        Email: fields.email.value.trim(),
        Phone: fields.phone.value.trim(),
        Message: fields.message.value.trim(),
        _replyto: fields.email.value.trim(),
        _subject: "New message from paulsunenergy.com",
        _template: "table",
      }),
    })
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
