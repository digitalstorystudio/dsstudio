/* ============================================================================
   Digital Story Studio — Universal form handler
   ----------------------------------------------------------------------------
   Catches submissions from:
     • #bookingForm           (contactus.html — booking)
     • #generalForm           (contactus.html — general)
     • #destinationContactForm (9 Ourwork pages — quote)

   For every submission it does TWO things in parallel:
     1) Sends to FormSubmit   → arrives at your inbox (chat.dsstudio@gmail.com)
                                 instantly. NO setup needed.
     2) Sends to Google Sheet → arrives in your sheet IF you have set the
                                Apps Script URL below.  See FORMS-SETUP.md.

   So the forms work TODAY (emails). Sheet starts working the moment you
   paste your Apps Script Web App URL into APPS_SCRIPT_URL below.
   ============================================================================ */

(function () {
  "use strict";

  // === USER CONFIG =========================================================
  // 1) Your inbox — emails arrive here for every form submission
  const TARGET_EMAIL = "chat.dsstudio@gmail.com";

  // 2) Google Apps Script Web App URL — paste yours here once you set up
  //    the sheet. Until then leave the placeholder; emails will still work.
  //    Looks like:  https://script.google.com/macros/s/AKfycb.../exec
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyidiPBhb4kWQvykKd_CKzqc77H852wDJNYa-pkD3tGpWqrfCyt4tJfO1gAc0lvuHjBfQ/exec";
  // =========================================================================

  const FORMSUBMIT_URL = "https://formsubmit.co/ajax/" + TARGET_EMAIL;

  // Map each form id → its formType used both by Apps Script and email subject
  const FORM_MAP = {
    bookingForm:            { type: "booking", subject: "New BOOKING Inquiry" },
    generalForm:            { type: "general", subject: "New GENERAL Inquiry" },
    destinationContactForm: { type: "quote",        subject: "New QUOTE Request" },
    newsletterForm:         { type: "newsletter",   subject: "New NEWSLETTER Signup" }
  };

  // ---- Helpers -----------------------------------------------------------
  function showMsg(form, type, text) {
    let box = form.querySelector(".dss-form-msg");
    if (!box) {
      box = document.createElement("div");
      box.className = "dss-form-msg";
      form.appendChild(box);
    }
    box.style.cssText =
      "margin-top:14px;padding:14px 18px;border-radius:8px;" +
      "font-size:0.95rem;line-height:1.4;font-weight:500;" +
      (type === "ok"
        ? "background:rgba(37,211,102,0.18);color:#bff7c8;border:1px solid #25d366;"
        : "background:rgba(255,80,80,0.16);color:#ffc7c7;border:1px solid #ff5050;");
    box.textContent = text;
  }

  function gatherFields(form) {
    const data = {};
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) data[k] = (v + "").trim();
    data.page_url   = location.href;
    data.user_agent = navigator.userAgent;
    data.submitted  = new Date().toISOString();
    return data;
  }

  // ---- Senders -----------------------------------------------------------
  function sendToEmail(formInfo, payload) {
    const body = Object.assign(
      { _subject: formInfo.subject + " — " + (payload.name || "no name"),
        _template: "table",
        _captcha: "false" },
      payload
    );
    return fetch(FORMSUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    }).then(r => r.ok)
      .catch(() => false);
  }

  function sendToSheet(formInfo, payload) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf("PASTE_") === 0) {
      return Promise.resolve(false); // not configured yet, skip silently
    }
    const body = Object.assign({ formType: formInfo.type }, payload);
    // mode: 'no-cors' avoids the Apps-Script /exec → /usercontent.googleusercontent.com
    // redirect dropping the Access-Control-Allow-Origin header. Response becomes
    // opaque (we can't read it), but the request DOES reach Apps Script and
    // appendRow() runs normally. We treat a non-thrown fetch as success.
    return fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    }).then(function () { return true; })
      .catch(function () { return false; });
  }

  // ---- Main handler ------------------------------------------------------
  function handleSubmit(form, formInfo) {
    return function (e) {
      e.preventDefault();

      const btn = form.querySelector("button[type='submit'], .submit-btn");
      const origLabel = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      }

      const payload = gatherFields(form);

      // Send to Apps Script (Google Sheet) only.
      // FormSubmit (email) is disabled to avoid the activation-required
      // "Security validation failed" error. Email notifications are sent
      // directly from Apps Script (MailApp.sendEmail) instead.
      sendToSheet(formInfo, payload).then(function (sheetOK) {
        const emailOK = sheetOK;
        if (sheetOK) {
          form.reset();
          showMsg(form, "ok",
            "✓ Thank you! We received your inquiry and will reply within 10 minutes. " +
            "For urgent bookings, call +91 88106 96407.");
          // Track in GA if present
          try {
            if (typeof gtag === "function") {
              gtag("event", "form_submission", {
                event_category: "form",
                event_label: formInfo.type
              });
            }
          } catch (_) {}
        } else {
          showMsg(form, "err",
            "Sorry, something went wrong. Please call us directly at " +
            "+91 88106 96407 or WhatsApp us.");
        }
      }).catch(function () {
        showMsg(form, "err",
          "Network error. Please call +91 88106 96407 or WhatsApp us.");
      }).then(function () {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origLabel;
        }
      });
    };
  }

  // ---- Wire on DOM ready -------------------------------------------------
  function attach() {
    Object.keys(FORM_MAP).forEach(function (id) {
      const form = document.getElementById(id);
      if (form && !form.dataset.dssBound) {
        form.dataset.dssBound = "1";
        form.addEventListener("submit", handleSubmit(form, FORM_MAP[id]));
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();
