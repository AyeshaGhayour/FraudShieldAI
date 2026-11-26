
/* ==================================
   FRAUDSHIELD AI - PERSONAL SHIELD
   Transaction Safety Checklist
================================== */

const transactionForm = document.getElementById(
    "transaction-check-form"
);

const analyzeButton = document.getElementById("analyze-btn");

const predictionResult = document.getElementById(
    "prediction-result"
);


// ==================================
// TRANSACTION SAFETY ANALYSIS
// ==================================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Collect user answers

    const amount = Number(
        document.getElementById("transaction-amount").value
    );

    const paymentMethod = document.getElementById(
        "payment-method"
    ).value;

    const merchantStatus = document.getElementById(
        "merchant-status"
    ).value;

    const paymentInitiated = document.getElementById(
        "payment-initiated"
    ).value;

    const credentialRequest = document.getElementById(
        "credential-request"
    ).value;


    // Validate amount

    if (!Number.isFinite(amount) || amount <= 0) {

        alert("Please enter a valid transaction amount.");

        return;
    }


    // Loading state

    analyzeButton.disabled = true;

    analyzeButton.textContent = "Checking transaction...";

    predictionResult.innerHTML = "";

    predictionResult.classList.remove("visible");


    // ==================================
    // IDENTIFY WARNING SIGNS
    // ==================================

    const warnings = [];

    let riskLevel = "LOW";


    // Warning 1: Sensitive information requests

    if (credentialRequest !== "no") {

        warnings.push(
            "Someone has requested sensitive banking information. Never share an OTP, PIN or banking password."
        );

        riskLevel = "HIGH";
    }


    // Warning 2: Unexpected payment contact

    if (paymentInitiated === "no") {

        warnings.push(
            "You did not initiate this payment. Unexpected payment requests may be associated with scams."
        );

        if (riskLevel !== "HIGH") {
            riskLevel = "HIGH";
        }
    }


    // Warning 3: Unfamiliar recipient

    if (merchantStatus === "unknown") {

        warnings.push(
            "You do not recognize the merchant or recipient. Verify their identity independently before paying."
        );

        if (riskLevel === "LOW") {
            riskLevel = "CAUTION";
        }
    }


    // Warning 4: Uncertain recipient

    if (merchantStatus === "unsure") {

        warnings.push(
            "You are unsure about the recipient. Check the merchant or recipient details before proceeding."
        );

        if (riskLevel === "LOW") {
            riskLevel = "CAUTION";
        }
    }


    // Warning 5: Uncertain payment initiation

    if (paymentInitiated === "unsure") {

        warnings.push(
            "You are unsure how this payment was initiated. Review the payment request before proceeding."
        );

        if (riskLevel === "LOW") {
            riskLevel = "CAUTION";
        }
    }


    // ==================================
    // RESULT MESSAGES
    // ==================================

    let heading = "";
    let explanation = "";
    let recommendation = "";

    if (riskLevel === "HIGH") {

        heading = "Important warning signs detected";

        explanation =
            "Your answers indicate potentially serious payment security concerns.";

        recommendation =
            "Do not proceed until you independently verify the request. Never share your banking credentials.";

    } else if (riskLevel === "CAUTION") {

        heading = "A few things need attention";

        explanation =
            "Your answers indicate some details that should be checked before making this payment.";

        recommendation =
            "Pause and verify the recipient and payment request using an official contact channel.";

    } else {

        heading = "No major warning signs reported";

        explanation =
            "Based on your answers, this checklist did not identify the warning signs it checks for.";

        recommendation =
            "Continue to review the payment details carefully. This result does not guarantee that the transaction is safe.";

    }


    // ==================================
    // DISPLAY RESULT
    // ==================================

    const warningHTML = warnings.length > 0

        ? warnings.map(function (warning) {
            return `<li>${warning}</li>`;
        }).join("")

        : "<li>No warning signs were reported in your answers.</li>";


    const methodNames = {
        online: "Online / Website",
        pos: "Card machine / In-store",
        transfer: "Bank transfer",
        wallet: "Digital wallet"
    };


    const resultClass = riskLevel.toLowerCase();

    predictionResult.innerHTML = `

        <div class="personal-result-card ${resultClass}">

            <span class="result-label">
                PERSONAL SAFETY CHECK
            </span>

            <h3>${heading}</h3>

            <div class="result-summary">

                <span>Reported transaction amount</span>

                <strong>
                    PKR ${amount.toLocaleString("en-PK")}
                </strong>

            </div>

            <div class="result-summary">

                <span>Payment method</span>

                <strong>
                    ${methodNames[paymentMethod]}
                </strong>

            </div>

            <p>${explanation}</p>

            <h4>What we noticed</h4>

            <ul>
                ${warningHTML}
            </ul>

            <div class="result-recommendation">

                <strong>Recommended action</strong>

                <p>${recommendation}</p>

            </div>

            <p class="result-disclaimer">

                This is a rules-based educational checklist,
                not a machine-learning prediction or a bank fraud check.
                It evaluates only the answers you provided.

            </p>

        </div>

    `;


    predictionResult.classList.add("visible");


    // Restore button

    analyzeButton.disabled = false;

    analyzeButton.textContent = "Check transaction safety →";

});
