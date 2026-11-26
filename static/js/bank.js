
/* ==========================================
   FRAUDSHIELD AI - BANK INTELLIGENCE
========================================== */

// DOM ELEMENTS
const signalsGrid = document.getElementById("bank-signals-grid");
const analyzeButton = document.getElementById("bank-analyze-btn");
const resetButton = document.getElementById("bank-reset-btn");
const predictionResult = document.getElementById("bank-prediction-result");

const batchFile = document.getElementById("csv-upload");
const fileName = document.getElementById("file-name");
const batchButton = document.getElementById("batch-analyze-btn");
const batchResult = document.getElementById("batch-result");

// SESSION ANALYTICS
let totalAnalyzed = 0;
let fraudDetected = 0;
let legitimateDetected = 0;


/* ==========================================
   ANALYTICS
========================================== */

function updateAnalytics() {

    const totalElement = document.getElementById("total-transactions");
    const fraudElement = document.getElementById("fraud-count");
    const legitimateElement = document.getElementById("legitimate-count");
    const rateElement = document.getElementById("fraud-rate");

    if (totalElement) {
        totalElement.textContent = totalAnalyzed.toLocaleString();
    }

    if (fraudElement) {
        fraudElement.textContent = fraudDetected.toLocaleString();
    }

    if (legitimateElement) {
        legitimateElement.textContent = legitimateDetected.toLocaleString();
    }

    const fraudRate = totalAnalyzed > 0
        ? ((fraudDetected / totalAnalyzed) * 100).toFixed(2)
        : "0.00";

    if (rateElement) {
        rateElement.textContent = fraudRate + "%";
    }
}


/* ==========================================
   RESULT HELPERS
========================================== */

function showResult(element, message) {

    if (!element) return;

    element.textContent = message;
    element.classList.add("visible");
}


function clearResult(element) {

    if (!element) return;

    element.textContent = "";
    element.classList.remove("visible");
}


/* ==========================================
   GENERATE 28 PCA INPUT FIELDS
========================================== */

if (signalsGrid) {

    signalsGrid.innerHTML = "";

    for (let i = 1; i <= 28; i++) {

        const featureName = `V${i}`;
        const signalNumber = String(i).padStart(2, "0");

        const inputGroup = document.createElement("div");

        inputGroup.className = "signal-input";

        inputGroup.innerHTML = `
            <label for="bank-${featureName}">
                Pattern Signal ${signalNumber}
            </label>

            <input
                type="number"
                id="bank-${featureName}"
                step="any"
                placeholder="Enter signal value"
                required
            >
        `;

        signalsGrid.appendChild(inputGroup);
    }
}


/* ==========================================
   RESET INDIVIDUAL TRANSACTION FORM
========================================== */

if (resetButton) {

    resetButton.addEventListener("click", function () {

        const timeInput = document.getElementById("bank-time");
        const amountInput = document.getElementById("bank-amount");

        if (timeInput) timeInput.value = "";
        if (amountInput) amountInput.value = "";

        for (let i = 1; i <= 28; i++) {

            const input = document.getElementById(`bank-V${i}`);

            if (input) {
                input.value = "";
            }
        }

        clearResult(predictionResult);

        if (timeInput) {
            timeInput.focus();
        }
    });
}


/* ==========================================
   FRAUD CONSTELLATION
========================================== */

const constellation = document.getElementById("constellation-visual");
const constellationEmpty = document.getElementById("constellation-empty");

let constellationNodes = [];
let constellationTotal = 0;
let constellationFraud = 0;


/* UPDATE CONSTELLATION COUNTERS */

function updateConstellationStats() {

    const totalElement = document.getElementById("constellation-total");
    const fraudElement = document.getElementById("constellation-flagged");

    if (totalElement) {
        totalElement.textContent = constellationTotal.toLocaleString();
    }

    if (fraudElement) {
        fraudElement.textContent = constellationFraud.toLocaleString();
    }
}


/* ADD ONE TRANSACTION NODE */

function addConstellationNode(prediction) {

    if (!constellation) return;

    if (constellationEmpty && constellationEmpty.isConnected) {
        constellationEmpty.remove();
    }

    // Create SVG connection layer

    let connectionLayer = constellation.querySelector(
        ".constellation-connections"
    );

    if (!connectionLayer) {

        connectionLayer = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        connectionLayer.setAttribute("viewBox", "0 0 100 100");
        connectionLayer.setAttribute("preserveAspectRatio", "none");

        connectionLayer.classList.add("constellation-connections");

        constellation.appendChild(connectionLayer);
    }

    // Random node position

    const x = Math.random() * 76 + 12;
    const y = Math.random() * 72 + 14;

    const isFraud = Number(prediction) === 1;

    // Decorative connection to previous node

    if (constellationNodes.length > 0) {

        const previous = constellationNodes[
            constellationNodes.length - 1
        ];

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", previous.x);
        line.setAttribute("y1", previous.y);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);

        line.setAttribute("class", "constellation-line");

        connectionLayer.appendChild(line);
    }

    // Create node

    const node = document.createElement("span");

    node.className = isFraud
        ? "constellation-node fraud-node"
        : "constellation-node legitimate-node";

    node.style.left = x + "%";
    node.style.top = y + "%";

    node.setAttribute(
        "aria-label",
        isFraud
            ? "Potential fraud classification"
            : "Legitimate classification"
    );

    node.title = isFraud
        ? "Potential fraud"
        : "Legitimate";

    constellation.appendChild(node);

    constellationNodes.push({ x, y, element: node });

    // Keep at most 45 visible nodes

    if (constellationNodes.length > 45) {

        const removedNode = constellationNodes.shift();

        if (removedNode.element) {
            removedNode.element.remove();
        }

        const firstLine = connectionLayer.querySelector("line");

        if (firstLine) {
            firstLine.remove();
        }
    }

    // Update exact counters

    constellationTotal++;

    if (isFraud) {
        constellationFraud++;
    }

    updateConstellationStats();
}


/* ==========================================
   ADD REPRESENTATIVE CSV NODES
========================================== */

function addBatchConstellationNodes(fraudCount, legitimateCount) {

    const fraud = Number(fraudCount);
    const legitimate = Number(legitimateCount);

    const total = fraud + legitimate;

    if (total <= 0) return;

    // Display up to 24 fraud and 24 legitimate nodes

const sampledFraud = Math.min(fraud, 24);

const sampledLegitimate = Math.min(legitimate, 24);

const sampleSize = sampledFraud + sampledLegitimate;

    // Prepare representative classifications

    const sample = [];

    for (let i = 0; i < sampledFraud; i++) {
        sample.push(1);
    }

    for (let i = 0; i < sampledLegitimate; i++) {
        sample.push(0);
    }

    // Shuffle the nodes

    for (let i = sample.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [sample[i], sample[j]] = [sample[j], sample[i]];
    }

    // Render representative nodes

    sample.forEach(prediction => {
        addConstellationNode(prediction);
    });

    // Add remaining actual totals without drawing extra nodes

    constellationTotal += total - sampleSize;
    constellationFraud += fraud - sampledFraud;

    updateConstellationStats();
}


/* ==========================================
   INDIVIDUAL TRANSACTION ANALYSIS
========================================== */

if (analyzeButton) {

    analyzeButton.addEventListener("click", async function () {

        const transaction = {};

        const timeInput = document.getElementById("bank-time");
        const amountInput = document.getElementById("bank-amount");

        if (!timeInput || !amountInput) return;

        const time = timeInput.value.trim();
        const amount = amountInput.value.trim();

        // Validate required fields

        if (time === "" || amount === "") {

            showResult(
                predictionResult,
                "Please enter transaction time and amount."
            );

            return;
        }

        transaction["Time"] = Number(time);
        transaction["Amount"] = Number(amount);

        // Collect 28 PCA signals

        for (let i = 1; i <= 28; i++) {

            const featureName = `V${i}`;

            const input = document.getElementById(
                `bank-${featureName}`
            );

            if (!input) return;

            const value = input.value.trim();

            if (value === "") {

                showResult(
                    predictionResult,
                    `Please enter a value for Pattern Signal ${String(i).padStart(2, "0")}.`
                );

                input.focus();

                return;
            }

            transaction[featureName] = Number(value);
        }

        // Validate numerical values

        if (!Object.values(transaction).every(Number.isFinite)) {

            showResult(
                predictionResult,
                "Please enter valid numerical values."
            );

            return;
        }

        analyzeButton.disabled = true;
        analyzeButton.textContent = "Analyzing...";

        showResult(
            predictionResult,
            "Analyzing transaction..."
        );

        try {

            const response = await fetch("/predict", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(transaction)

            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Prediction failed.");
            }

            // Update analytics

            totalAnalyzed++;

            if (Number(result.prediction) === 1) {
                fraudDetected++;
            } else {
                legitimateDetected++;
            }

            updateAnalytics();

            // Update constellation

            addConstellationNode(result.prediction);

            // Display prediction

            const probability = result.fraud_probability;

            if (Number(result.prediction) === 1) {

                showResult(
                    predictionResult,
                    `Suspicious pattern detected. Model-estimated fraud probability: ${probability}%.`
                );

            } else {

                showResult(
                    predictionResult,
                    `No fraud pattern detected by the model. Model-estimated fraud probability: ${probability}%.`
                );
            }

        } catch (error) {

            showResult(
                predictionResult,
                error.message || "Something went wrong."
            );

        } finally {

            analyzeButton.disabled = false;
            analyzeButton.textContent = "Analyze transaction →";

        }

    });
}


/* ==========================================
   CSV FILE SELECTION AND VALIDATION
========================================== */

if (batchFile) {

    batchFile.addEventListener("change", function () {

        batchButton.disabled = true;

        clearResult(batchResult);

        const oldDownloadButton = document.getElementById(
            "download-report-btn"
        );

        if (oldDownloadButton) {
            oldDownloadButton.style.display = "none";
        }

        if (!batchFile.files || batchFile.files.length === 0) {

            if (fileName) {
                fileName.textContent = "No file selected";
            }

            return;
        }

        const file = batchFile.files[0];

        if (fileName) {
            fileName.textContent = `Selected file: ${file.name}`;
        }

        // Validate CSV extension

        const isCSV = file.name.toLowerCase().endsWith(".csv");

        if (!isCSV) {

            showResult(
                batchResult,
                "Invalid file type. Please select a CSV file (.csv)."
            );

            return;
        }

        // Validate file size

        if (file.size === 0) {

            showResult(
                batchResult,
                "This file is empty. Please select a CSV file containing transaction data."
            );

            return;
        }

        clearResult(batchResult);

        batchButton.disabled = false;
        batchButton.textContent = "Analyze CSV →";

    });
}


/* ==========================================
   PROFESSIONAL BATCH REPORT
========================================== */

function displayBatchReport(result) {

    const total = Number(result.total_transactions);
    const fraud = Number(result.fraud_count);
    const legitimate = Number(result.legitimate_count);

    const fraudRate = total > 0
        ? ((fraud / total) * 100).toFixed(2)
        : "0.00";

    batchResult.innerHTML = `

        <div class="batch-report">

            <div class="report-header">

                <div>
                    <span class="report-status">ANALYSIS COMPLETE</span>

                    <h3>Transaction screening report</h3>

                    <p>
                        Your dataset has been evaluated by the
                        FraudShield AI model.
                    </p>
                </div>

                <span class="report-check">✓</span>

            </div>

            <div class="report-metrics">

                <div class="report-metric">

                    <span>TOTAL ANALYZED</span>

                    <strong>${total.toLocaleString()}</strong>

                    <small>Transactions screened</small>

                </div>

                <div class="report-metric fraud-metric">

                    <span>POTENTIAL FRAUD</span>

                    <strong>${fraud.toLocaleString()}</strong>

                    <small>Flagged by the model</small>

                </div>

                <div class="report-metric legitimate-metric">

                    <span>LEGITIMATE</span>

                    <strong>${legitimate.toLocaleString()}</strong>

                    <small>Not flagged by the model</small>

                </div>

            </div>

            <div class="report-rate">

                <div class="report-rate-heading">

                    <span>FLAGGED TRANSACTION RATE</span>

                    <strong>${fraudRate}%</strong>

                </div>

                <div class="report-rate-track">

                    <div
                        class="report-rate-fill"
                        style="width: ${Math.min(Number(fraudRate), 100)}%">
                    </div>

                </div>

                <p>
                    Percentage of analyzed transactions
                    classified as potential fraud.
                </p>

            </div>

        </div>

    `;

    batchResult.classList.add("visible");
}


/* ==========================================
   DOWNLOAD CSV REPORT
========================================== */

function downloadReport(rows) {

    if (!rows || rows.length === 0) {
        return;
    }

    const columns = Object.keys(rows[0]);

    function escapeCSV(value) {

        if (value === null || value === undefined) {
            return "";
        }

        let text = String(value);

        // Protect against spreadsheet formula injection

        if (
            typeof value === "string" &&
            /^[=+\-@]/.test(text)
        ) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    }

    const csvContent = [

        columns.map(escapeCSV).join(","),

        ...rows.map(row =>
            columns.map(column =>
                escapeCSV(row[column])
            ).join(",")
        )

    ].join("\n");

    const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "FraudShield_Analysis_Report.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* ==========================================
   CSV BATCH ANALYSIS
========================================== */

if (batchButton) {

    batchButton.addEventListener("click", async function () {

        if (!batchFile || !batchFile.files.length) {

            showResult(
                batchResult,
                "Please select a CSV file first."
            );

            return;
        }

        const file = batchFile.files[0];

        if (!file.name.toLowerCase().endsWith(".csv")) {

            showResult(
                batchResult,
                "Please upload a CSV file."
            );

            return;
        }

        if (file.size === 0) {

            showResult(
                batchResult,
                "The selected CSV file is empty."
            );

            return;
        }

        const formData = new FormData();

        formData.append("file", file);

        batchButton.disabled = true;
        batchButton.textContent = "Analyzing dataset...";

        batchButton.setAttribute("aria-busy", "true");

        showResult(
            batchResult,
            `Processing ${file.name}. Please wait while the model analyzes your transactions...`
        );

        try {

            const response = await fetch("/bank/batch-predict", {

                method: "POST",

                body: formData

            });

            const result = await response.json();

            if (!response.ok) {

                throw new Error(
                    result.error || "Batch analysis failed."
                );
            }

            // Update session analytics

            totalAnalyzed += result.total_transactions;

            fraudDetected += result.fraud_count;

            legitimateDetected += result.legitimate_count;

            updateAnalytics();

            // Update constellation

            addBatchConstellationNodes(
                result.fraud_count,
                result.legitimate_count
            );

            // Display professional report

            displayBatchReport(result);

            // Create download button

            let downloadButton = document.getElementById(
                "download-report-btn"
            );

            if (!downloadButton) {

                downloadButton = document.createElement("button");

                downloadButton.id = "download-report-btn";
                downloadButton.className = "primary-button";
                downloadButton.type = "button";

                downloadButton.textContent = "Download Analysis Report";

                batchResult.insertAdjacentElement(
                    "afterend",
                    downloadButton
                );
            }

            // Connect report data

            downloadButton.onclick = function () {

                downloadReport(result.report_rows);

            };

            downloadButton.style.display = "inline-flex";

        } catch (error) {

            showResult(
                batchResult,
                error.message || "Unable to process the CSV file."
            );

        } finally {

            batchButton.disabled = false;

            batchButton.textContent = "Analyze CSV →";

            batchButton.removeAttribute("aria-busy");

        }

    });

}


/* ==========================================
   LOAD REAL DATASET TEST SAMPLES
========================================== */

const loadFraudButton = document.getElementById(
    "load-fraud-sample"
);

const loadLegitimateButton = document.getElementById(
    "load-legitimate-sample"
);

const testSampleStatus = document.getElementById(
    "test-sample-status"
);


async function loadDatasetSample(sampleType) {

    const selectedButton = sampleType === "fraud"
        ? loadFraudButton
        : loadLegitimateButton;

    if (!selectedButton) return;

    const originalText = selectedButton.textContent;

    selectedButton.disabled = true;
    selectedButton.textContent = "Loading sample...";

    if (testSampleStatus) {
        testSampleStatus.textContent = "";
    }

    try {

        const response = await fetch("/bank/test-samples");

        const result = await response.json();

        if (!response.ok) {

            throw new Error(
                result.error || "Unable to load test samples."
            );
        }

        const sample = result.samples[sampleType];

        if (!sample || !sample.features) {

            throw new Error(
                "Test sample data is unavailable."
            );
        }

        const features = sample.features;

        // Fill transaction time and amount

        document.getElementById("bank-time").value =
            features.Time;

        document.getElementById("bank-amount").value =
            features.Amount;

        // Fill 28 PCA signals

        for (let i = 1; i <= 28; i++) {

            const input = document.getElementById(`bank-V${i}`);

            if (!input) {

                throw new Error(
                    `Pattern Signal ${i} input is missing.`
                );
            }

            input.value = features[`V${i}`];
        }

        // Clear previous prediction

        clearResult(predictionResult);

        // Display actual dataset label

        const actualLabel = sample.actual_label === 1
            ? "Confirmed Fraud"
            : "Legitimate";

        if (testSampleStatus) {

            testSampleStatus.textContent =
                `${actualLabel} sample loaded successfully. Click Analyze transaction to test the model.`;
        }

        // Open advanced investigation

        const advancedDetails = document.querySelector(
            ".advanced-details"
        );

        if (advancedDetails) {
            advancedDetails.open = true;
        }

        // Scroll to form

        document.getElementById("bank-time").scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    } catch (error) {

        if (testSampleStatus) {

            testSampleStatus.textContent =
                error.message || "Unable to load sample.";
        }

    } finally {

        selectedButton.disabled = false;
        selectedButton.textContent = originalText;

    }
}


// Fraud sample button

if (loadFraudButton) {

    loadFraudButton.addEventListener("click", function () {

        loadDatasetSample("fraud");

    });
}


// Legitimate sample button

if (loadLegitimateButton) {

    loadLegitimateButton.addEventListener("click", function () {

        loadDatasetSample("legitimate");

    });
}


/* ==========================================
   INITIALIZE DASHBOARD
========================================== */

updateAnalytics();
updateConstellationStats();
