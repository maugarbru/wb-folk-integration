/**
 * Webflow integration script (newsletter + contact)
 *
 * Instructions:
 * - Paste this into Page Settings -> Before </body> or in Project Custom Code.
 * - Replace PROXY_BASE_URL with your deployed proxy URL (no trailing slash).
 * - Ensure your newsletter form has id="wf-form-SuscribeEdgeForm"
 * - Ensure your contact form has id="wf-form-ContactForm" (or change selector below to match)
 *
 * Behavior:
 * - Does NOT prevent Webflow's default submission flow (so email notifications and success screens still work).
 * - Fires a POST to your proxy endpoints to create a person in Folk.
 */
(function() {
  const PROXY_BASE_URL = "https://wb-folk-integration.vercel.app"; // <-- CHANGE this

  function safeQuery(form, selectors) {
    for (const s of selectors) {
      const el = form.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  // Helper to get field value by trying several attribute selectors
  function getValue(form, name) {
    const selectors = [
      `[name="${name}"]`,
      `[data-name="${name}"]`,
      `#${name}`,
      `input[placeholder="${name}"]`,
      `textarea[name="${name}"]`
    ];
    const el = safeQuery(form, selectors);
    return el ? el.value.trim() : "";
  }

  // Newsletter form (simple: only email)
  const newsletterForm = document.querySelector("#wf-form-SuscribeEdgeForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function() {
      try {
        const email = getValue(newsletterForm, "email");
        if (!email) return;
        fetch(PROXY_BASE_URL + "/api/folk/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }).then(async res => {
          if (!res.ok) {
            const txt = await res.text();
            console.error("Newsletter proxy error:", res.status, txt);
          } else {
            console.log("Newsletter proxy OK");
          }
        }).catch(err => console.error("Newsletter fetch error:", err));
      } catch (e) {
        console.error("Newsletter handler error:", e);
      }
    });
  } else {
    console.warn("Newsletter form (#wf-form-SuscribeEdgeForm) not found on page.");
  }

  // Contact form (full)
  const contactForm = document.querySelector("#wf-form-BookCall");
  if (contactForm) {
    contactForm.addEventListener("submit", function() {
      try {
        const name = getValue(contactForm, "name") || getValue(contactForm, "Name") || getValue(contactForm, "fullName");
        const email = getValue(contactForm, "email") || getValue(contactForm, "Work email") || getValue(contactForm, "Work email");
        const company = getValue(contactForm, "company") || getValue(contactForm, "Company Name");
        const role = getValue(contactForm, "role") || getValue(contactForm, "Role/Title");
        const country = getValue(contactForm, "country") || getValue(contactForm, "Country / Time Zone");
        const project = (contactForm.querySelector('textarea') && contactForm.querySelector('textarea').value.trim()) || getValue(contactForm, "project") || getValue(contactForm, "Brief Project");

        if (!name || !email) return;

        fetch(PROXY_BASE_URL + "/api/folk/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, company, role, country, project })
        }).then(async res => {
          if (!res.ok) {
            const txt = await res.text();
            console.error("Contact proxy error:", res.status, txt);
          } else {
            console.log("Contact proxy OK");
          }
        }).catch(err => console.error("Contact fetch error:", err));
      } catch (e) {
        console.error("Contact handler error:", e);
      }
    });
  } else {
    console.warn("Contact form (#wf-form-BookCall) not found on page.");
  }
})();
