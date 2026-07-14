(() => {
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  document.querySelectorAll("[data-cta]").forEach((el) => {
    el.addEventListener("click", () => track("cta_click", { label: el.dataset.cta }));
  });

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = document.getElementById(btn.dataset.openModal);
      if (modal) modal.hidden = false;
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => { overlay.hidden = true; });
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) overlay.hidden = true;
    });
  });

  document.querySelectorAll(".lead-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Honeypot: real visitors never fill this hidden field.
      const honeypot = form.elements.company;
      if (honeypot && honeypot.value) return;

      // TODO(lead-capture): this only shows a thank-you message and fires a
      // GA4 event — no email is sent or stored anywhere yet. Wire the actual
      // submission (e.g. a Formspree endpoint or Google Form POST) here.
      track("lead_submit", { figure: form.dataset.figure || "unknown" });

      form.hidden = true;
      const success = form.parentElement.querySelector(".form-success");
      if (success) success.hidden = false;
    });
  });
})();
