// Get workspace buttons
const personalButton = document.getElementById("personal-mode-btn");
const bankButton = document.getElementById("bank-mode-btn");
if (personalButton) {

    personalButton.addEventListener("click", function () {

        window.location.href = "/personal";

    });

}
// =================================
// BANK INTELLIGENCE
// =================================
if (bankButton) {

    bankButton.addEventListener("click", function () {

        window.location.href = "/bank";

    });

}
