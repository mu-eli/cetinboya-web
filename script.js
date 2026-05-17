const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=initMap&loading=async`;
script.async = true;
document.head.appendChild(script);

/////////////////////////////
/// MAP STATE
////////////////////////////
let map;
let markers = [];
let pendingHashActivation = null;
let infoWindow;
const cardNames = [];

/////////////////////////////
/// INITIALIZE GOOGLE MAP
////////////////////////////
window.initMap = function () {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const defaultLocation = { lat: 40.99233, lng: 29.12744 };

  map = new google.maps.Map(mapEl, {
    center: defaultLocation,
    zoom: 12,
    mapId: "3861730a29e0b5fc16da4db2",
  });

  infoWindow = new google.maps.InfoWindow();
  const cards = document.querySelectorAll(".card__style");

  cards.forEach((card, index) => {
    const lat = parseFloat(card.dataset.lat);
    const lng = parseFloat(card.dataset.lng);

    const cardName = card.querySelector(".card__name")?.innerText || ""; // ← add here
    cardNames.push(cardName);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map,
      title: cardName,
    });

    markers.push(marker);

    marker.addEventListener("gmp-click", () => {
      setActiveCard(index);
    });

    card.addEventListener("click", () => {
      setActiveCard(index);
    });
  });

  if (pendingHashActivation !== null) {
    setActiveCard(pendingHashActivation);
    pendingHashActivation = null;
  }
};

/////////////////////////////
/// ACTIVATE A CARD
////////////////////////////
function setActiveCard(index) {
  if (!map) {
    pendingHashActivation = index;
    return;
  }

  const cards = document.querySelectorAll(".card__style");
  if (!cards[index]) return;

  cards.forEach((c, i) => c.classList.toggle("active", i === index));

  const lat = parseFloat(cards[index].dataset.lat);
  const lng = parseFloat(cards[index].dataset.lng);

  map.setCenter({ lat, lng });
  map.setZoom(15);

  const marker = markers[index];
  const cardName = cardNames[index];
  if (infoWindow && marker) {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    infoWindow.close();
    infoWindow.setContent(`
      <div style="font-size:14px;">
        <strong style="display:block; color:#005bbb; font-weight:500; margin-bottom:4px;">${cardName}</strong><br>
        <a href="${mapsUrl}" target="_blank" style="color:#005bbb;">
          View on Google Maps
        </a>
      </div>
    `);
    infoWindow.open({ map, anchor: marker });
  }
}

/////////////////////////////
/// SINGLE INIT ENTRY POINT
////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  // UPDATE FOOTER YEAR
  const yearEl = document.querySelector(".year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // HIGHLIGHT ACTIVE NAV LINK
  const currentPage = location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(
    ".navigation__link, .btn__contact",
  );

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isCurrentPage =
      href === currentPage || (currentPage === "" && href === "index.html");

    if (isCurrentPage) {
      link.classList.add("active");

      const parentMenu = link.closest(".navigation__submenu");
      if (parentMenu) {
        const parentLink = parentMenu
          .closest("li")
          .querySelector(".navigation__link");
        if (parentLink) parentLink.classList.add("active");
      }
    }
  });

  // DROPDOWN TOGGLE
  const dropdownBtn = document.querySelector(".navigation__dropdown-btn");
  const submenu = document.querySelector(".navigation__submenu");
  const icon = document.querySelector(".navigation__icon-up");

  if (dropdownBtn && submenu && icon) {
    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen =
        submenu.style.height !== "0px" && submenu.style.height !== "";

      submenu.style.transition = "height 0.3s ease, opacity 0.3s ease";

      if (!isOpen) {
        submenu.style.opacity = 1;
        submenu.style.marginTop = "24px";
        submenu.style.height = submenu.scrollHeight + "px";
        icon.style.transform = "rotate(0deg)";
      } else {
        submenu.style.height = "0";
        submenu.style.marginTop = "0";
        submenu.style.opacity = 0;
        icon.style.transform = "rotate(180deg)";
      }
    });
  }

  // SMOOTH SCROLL FOR FOOTER ANCHOR LINKS
  document.querySelectorAll('.footer__item a[href*="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").split("#")[1];
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

        if (window.location.pathname.includes("contact.html")) {
          const cards = Array.from(document.querySelectorAll(".card__style"));
          const index = cards.indexOf(targetEl);
          if (index !== -1) setActiveCard(index);
        }
      }
    });
  });

  // ACTIVATE CARD FROM URL HASH ON PAGE LOAD
  function activateFromHash() {
    const hash = window.location.hash;
    if (!hash) return;

    const targetCard = document.querySelector(hash);
    if (!targetCard) return;

    const cards = Array.from(document.querySelectorAll(".card__style"));
    const index = cards.indexOf(targetCard);

    if (index !== -1) {
      setActiveCard(index);
      targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  activateFromHash();
  window.addEventListener("hashchange", activateFromHash);

  // FORM TOGGLE
  const companyBtn = document.getElementById("compBtn");
  const personBtn = document.getElementById("personBtn");
  const companyForm = document.getElementById("companyForm");
  const personForm = document.getElementById("personForm");

  if (companyBtn && personBtn && companyForm && personForm) {
    function toggleForm(showForm, hideForm, activeBtn, inactiveBtn) {
      showForm.classList.add("active");
      hideForm.classList.remove("active");
      activeBtn.classList.add("active");
      inactiveBtn.classList.remove("active");

      const toggle = document.querySelector(".cont-form__toggle");
      if (toggle) {
        toggle.style.maxWidth = showForm === personForm ? "50rem" : "76.8rem";
      }
    }

    companyBtn.addEventListener("click", () =>
      toggleForm(companyForm, personForm, companyBtn, personBtn),
    );

    personBtn.addEventListener("click", () =>
      toggleForm(personForm, companyForm, personBtn, companyBtn),
    );
  }

  // FORM SUBMISSION
  const forms = document.querySelectorAll(".form");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type='submit']");
      const messageDiv = form.querySelector(".form__message");

      if (!submitBtn || !messageDiv) return;

      messageDiv.textContent = "";
      messageDiv.className = "form__message";

      submitBtn.disabled = true;
      submitBtn.textContent = "Gönderiliyor...";

      const formData = new FormData(form);

      if (formData.get("website")) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Gönder";
        form.reset();
        return;
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
        });

        const result = (await response.text()).trim();

        if (result === "success") {
          messageDiv.textContent = "Mesajınız başarıyla gönderildi!";
          messageDiv.classList.add("success");
          form.reset();
        } else {
          messageDiv.textContent =
            "Bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
          messageDiv.classList.add("error");
        }
      } catch {
        messageDiv.textContent =
          "Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin.";
        messageDiv.classList.add("error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Gönder";
      }
    });
  });
});
