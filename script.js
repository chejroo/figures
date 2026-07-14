(() => {
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  document.querySelectorAll("[data-cta]").forEach((el) => {
    el.addEventListener("click", () => track("cta_click", { label: el.dataset.cta }));
  });

  // Coming-soon product cards aren't links — clicking one just registers
  // demand for a figure that isn't sellable yet, this being a fake-door test.
  document.querySelectorAll("[data-interest]").forEach((card) => {
    let sent = false;
    const register = () => {
      if (sent) return;
      sent = true;
      track("interest_click", { figure: card.dataset.interest });
      const status = card.querySelector(".product-card-status");
      if (status) status.textContent = "Zgłoszono zainteresowanie ✓";
    };
    card.addEventListener("click", register);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); register(); }
    });
  });

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = document.getElementById(btn.dataset.openModal);
      if (modal) modal.hidden = false;
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    const closeOverlay = () => {
      if (overlay.hidden) return;
      // Only counts as abandonment if the lead form inside is still showing
      // (i.e. they closed it without submitting).
      const form = overlay.querySelector(".lead-form");
      if (form && !form.hidden) track("modal_abandon", { figure: form.dataset.figure || "unknown" });
      overlay.hidden = true;
    };
    overlay.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", closeOverlay);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlay();
    });
  });

  document.querySelectorAll(".lead-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Honeypot: real visitors never fill this hidden field.
      const honeypot = form.elements.company;
      if (honeypot && honeypot.value) return;

      const figure = form.dataset.figure || "unknown";
      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      const data = new FormData(form);
      data.set("figurka", figure);
      data.set("_subject", `Kuźnia Figur — zapytanie o dostępność: ${figure}`);
      data.delete("company"); // honeypot field, already checked above

      fetch("https://formspree.io/f/mbdnloeg", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("submit failed");
          track("lead_submit", { figure });
          form.hidden = true;
          const success = form.parentElement.querySelector(".form-success");
          if (success) success.hidden = false;
        })
        .catch(() => {
          if (submitBtn) submitBtn.disabled = false;
          track("lead_submit_error", { figure });
          alert("Coś poszło nie tak przy wysyłce. Spróbuj ponownie albo napisz bezpośrednio na kontakt@kuzniafigur.pl.");
        });
    });
  });

  // How far down the page people actually get, per section — fires once
  // per section per visit the first time it's at least 40% in view.
  const sections = document.querySelectorAll("main section[id]");
  if (sections.length && "IntersectionObserver" in window) {
    const seen = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || seen.has(entry.target.id)) return;
        seen.add(entry.target.id);
        track("section_view", { section: entry.target.id });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    sections.forEach((section) => observer.observe(section));
  }
})();
