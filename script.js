/////////////////////////////
/// UPDATE FOOTER YEAR
////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.querySelector(".year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

////////////////////////////////
/// HIGHLIGHT ACTIVE NAV LINK
///////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
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

      // If this link is inside a dropdown, also highlight the parent link
      const parentMenu = link.closest(".navigation__submenu");
      if (parentMenu) {
        const parentLink = parentMenu
          .closest("li")
          .querySelector(".navigation__link");
        if (parentLink) parentLink.classList.add("active");
      }
    }
  });
});

/////////////////////////////
/// MAP STATE
////////////////////////////
let map;
let markers = [];

/////////////////////////////
/// INITIALIZE GOOGLE MAP
////////////////////////////
window.initMap = function () {
  const defaultLocation = { lat: 40.99233, lng: 29.12744 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 12,
  });

  const infoWindow = new google.maps.InfoWindow();
  const cards = document.querySelectorAll(".card__style");

  cards.forEach((card, index) => {
    const lat = parseFloat(card.dataset.lat);
    const lng = parseFloat(card.dataset.lng);

    // Place a marker on the map for this card
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: card.querySelector("h4")?.innerText || "",
    });

    markers.push(marker);

    // Clicking the map marker activates the matching card
    marker.addListener("click", () => {
      setActiveCard(index, infoWindow, marker);
    });

    // Clicking the card itself also activates it
    card.addEventListener("click", () => {
      setActiveCard(index, infoWindow, marker);
    });
  });
};

/////////////////////////////
/// ACTIVATE A CARD
////////////////////////////
function setActiveCard(index, infoWindow, marker) {
  const cards = document.querySelectorAll(".card__style");

  // Toggle active class: only the clicked card gets it
  cards.forEach((c, i) => c.classList.toggle("active", i === index));

  const lat = parseFloat(cards[index].dataset.lat);
  const lng = parseFloat(cards[index].dataset.lng);

  // Move the map view to this location
  map.setCenter({ lat, lng });
  map.setZoom(15);

  // Bounce the correct marker, stop after 2 seconds
  markers.forEach((m, i) =>
    m.setAnimation(i === index ? google.maps.Animation.BOUNCE : null),
  );
  setTimeout(() => markers[index].setAnimation(null), 2000);

  // Show a popup with a link to Google Maps
  if (infoWindow && marker) {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    infoWindow.setContent(`
      <div style="font-size:14px;">
        <strong>${marker.getTitle()}</strong><br>
        <a href="${mapsUrl}" target="_blank" style="color:#005bbb;">
          View on Google Maps
        </a>
      </div>
    `);
    infoWindow.open(map, marker);
  }
}

///////////////////////////////////
/// SMOOTH SCROLL FOR ANCHOR LINKS
//////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.footer__item a[href*="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").split("#")[1];
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

        // If on contact.html, also visually activate that card
        if (window.location.pathname.includes("contact.html")) {
          const cards = Array.from(document.querySelectorAll(".card__style"));
          const index = cards.indexOf(targetEl);
          if (index !== -1) setActiveCard(index);
        }
      }
    });
  });
});

//////////////////////////////////////////////
/// ACTIVATE CARD FROM URL HASH ON PAGE LOAD
/////////////////////////////////////////////
window.addEventListener("DOMContentLoaded", () => {
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
});

/////////////////////////////
/// FORM TOGGLE
////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const companyBtn = document.getElementById("compBtn");
  const personBtn = document.getElementById("personBtn");
  const companyForm = document.getElementById("companyForm");
  const personForm = document.getElementById("personForm");

  function toggleForm(showForm, hideForm, activeBtn, inactiveBtn) {
    showForm.classList.add("active");
    hideForm.classList.remove("active");
    activeBtn.classList.add("active");
    inactiveBtn.classList.remove("active");

    const toggle = document.querySelector(".cont-form__toggle");
    toggle.style.maxWidth = showForm === personForm ? "50rem" : "76.8rem";
  }

  companyBtn.addEventListener("click", () =>
    toggleForm(companyForm, personForm, companyBtn, personBtn),
  );

  personBtn.addEventListener("click", () =>
    toggleForm(personForm, companyForm, personBtn, companyBtn),
  );

  /////////////////////////////
  /// FORM SUBMISSION
  ////////////////////////////
  const forms = document.querySelectorAll(".form");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type='submit']");
      const messageDiv = form.querySelector(".form-message");

      // Clear any previous message
      messageDiv.textContent = "";
      messageDiv.className = "form__message";

      // Disable button while sending
      submitBtn.disabled = true;
      submitBtn.textContent = "Gönderiliyor...";

      const formData = new FormData(form);

      // Honeypot check: if the hidden "website" field has a value, it's a bot
      if (formData.get("website")) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Gönder";
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

const dropdownBtn = document.querySelector(".navigation__dropdown-btn");
const submenu = document.querySelector(".navigation__submenu");
const icon = document.querySelector(".navigation__icon-up");

dropdownBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (submenu.style.height === "0px" || submenu.style.height === "") {
    submenu.style.transition = "height 0.3s ease, opacity 0.3s ease";
    submenu.style.opacity = 1;
    submenu.style.marginTop = "24px";
    submenu.style.height = submenu.scrollHeight + "px";
    icon.style.transform = "rotate(0deg)";
  } else {
    submenu.style.transition = "height 0.3s ease, opacity 0.3s ease";
    submenu.style.height = "0";
    submenu.style.marginTop = "0";
    submenu.style.opacity = 0;
    icon.style.transform = "rotate(180deg)";
  }
});
