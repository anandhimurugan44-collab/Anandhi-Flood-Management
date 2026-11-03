// =====================================
// CONFIG
// =====================================
const BACKEND_URL = "https://ai-flood-management.onrender.com";
const REFRESH_INTERVAL = 15000; // 15 s (Render free tier can be slow to wake up)

// =====================================
// HELPERS
// =====================================
function $(id) {
    return document.getElementById(id);
}

// Safely set text (does nothing if the element is not on this page)
function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
}

// fetch wrapper with response.ok check + JSON parsing
async function apiRequest(path, options) {
    const response = await fetch(BACKEND_URL + path, options);
    if (!response.ok) {
        throw new Error("Server error: " + response.status);
    }
    return response.json();
}

function postJSON(body) {
    return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
}

// =====================================
// SHARED FLOOD DATA (localStorage)
// =====================================
let floodData = {
    rainfall: 82,
    waterLevel: 2.4,
    drainageIssues: 3,
    affectedAreas: 12,
    risk: "HIGH"
};

function saveFloodData() {
    try {
        localStorage.setItem("floodData", JSON.stringify(floodData));
    } catch (e) {
        console.error("Could not save flood data:", e);
    }
}

function loadFloodData() {
    try {
        const saved = localStorage.getItem("floodData");
        if (saved) floodData = JSON.parse(saved);
    } catch (e) {
        console.error("Could not load flood data:", e);
    }
}

loadFloodData();

// =====================================
// FLOOD RISK (single set of thresholds)
// =====================================
function getRiskLevel(rainfall, waterLevel) {
    if (rainfall >= 90 || waterLevel >= 2.7) return "HIGH";
    if (rainfall >= 60 || waterLevel >= 2.2) return "MEDIUM";
    return "LOW";
}

function calculateFloodRisk() {
    floodData.risk = getRiskLevel(
        Number(floodData.rainfall),
        Number(floodData.waterLevel)
    );
    saveFloodData();
}

// =====================================
// NAVIGATION
// =====================================
function scrollToSection(sectionId) {
    const el = $(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

// =====================================
// HOME PAGE STATUS
// =====================================
function updateHomeStatus() {
    setText("homeRainfall", floodData.rainfall + " mm");
    setText("homeWaterLevel", floodData.waterLevel + " m");
    setText("homeRisk", floodData.risk);
}

// =====================================
// DASHBOARD
// =====================================

// Show locally stored data
function updateDashboardFromData() {
    setText("dashRainfall", floodData.rainfall);
    setText("dashWater", floodData.waterLevel);
    setText("dashRisk", floodData.risk);
    setText("affectedAreas", floodData.affectedAreas);
}

// Simulated data (demo button)
function updateDashboardPage() {
    const rainfall = Math.floor(Math.random() * 70) + 30;
    const waterLevel = Number((Math.random() * 2 + 1.2).toFixed(1));
    const affectedAreas = Math.floor(Math.random() * 10) + 5;

    setText("dashRainfall", rainfall);
    setText("dashWater", waterLevel);
    setText("dashRisk", getRiskLevel(rainfall, waterLevel));
    setText("affectedAreas", affectedAreas);
}

// Real data from Flask backend
async function updateDashboardFromBackend() {
    try {
        const data = await apiRequest("/api/flood-data");

        setText("dashRainfall", data.rainfall);
        setText("dashWater", data.waterLevel);
        setText("dashRisk", data.risk);
        setText("affectedAreas", data.affectedAreas);
    } catch (error) {
        // No alert() here: this runs automatically every few seconds
        console.error("Dashboard backend error:", error);
    }
}

// =====================================
// MONITORING
// =====================================

// Simulated sensor values (demo button)
function updateMonitoring() {
    const rainfall = Math.floor(Math.random() * 70) + 30;
    const waterLevel = Number((Math.random() * 2 + 1.2).toFixed(1));

    setText("monitorRainfall", rainfall + " mm");
    setText("monitorWaterLevel", waterLevel + " m");
    setText("monitorDrainage", Math.random() > 0.7 ? "Blocked" : "Normal");

    let road;
    if (rainfall > 85 || waterLevel > 2.7) {
        road = "Flooded";
    } else if (rainfall > 65 || waterLevel > 2.2) {
        road = "Warning";
    } else {
        road = "Safe";
    }
    setText("monitorRoad", road);
}

// Show stored data (merged from the two old versions)
function updateMonitoringPage() {
    setText("rainfallValue", floodData.rainfall + " mm");
    setText("waterLevelValue", floodData.waterLevel + " m");
    setText("monitorRainfall", floodData.rainfall + " mm");
    setText("monitorWaterLevel", floodData.waterLevel + " m");
    setText("monitorRisk", floodData.risk);
}

// Send new readings to backend
async function updateMonitoringData() {
    const rainfall = parseFloat(prompt("Enter rainfall (mm):"));
    const waterLevel = parseFloat(prompt("Enter water level (m):"));

    if (isNaN(rainfall) || isNaN(waterLevel)) {
        alert("Please enter valid numerical values!");
        return;
    }

    try {
        const result = await apiRequest(
            "/api/update-data",
            postJSON({ rainfall: rainfall, waterLevel: waterLevel })
        );

        floodData = result.data;
        saveFloodData();
        updateMonitoringPage();

        alert("Flood data updated successfully!");
    } catch (error) {
        console.error("Backend connection error:", error);
        alert("Unable to connect to backend!");
    }
}

// =====================================
// DRAINAGE
// =====================================

// Simulated check (demo button)
function checkDrainage() {
    const conditions = ["NORMAL", "PARTIAL BLOCKAGE", "BLOCKED"];
    const result = conditions[Math.floor(Math.random() * conditions.length)];

    setText("drainageResult", result);

    if (result === "BLOCKED") {
        setText("drainageMessage", "⚠️ Possible blockage detected. Immediate inspection recommended.");
    } else if (result === "PARTIAL BLOCKAGE") {
        setText("drainageMessage", "⚠️ Partial blockage detected. Maintenance may be required.");
    } else {
        setText("drainageMessage", "Drainage network is operating normally.");
    }
}

// Backend scan
async function scanDrainage() {
    setText("scanStatus", "SCANNING...");
    setText("scanMessage", "Analyzing drainage network...");

    try {
        const result = await apiRequest("/api/drainage-scan");

        setText("scanStatus", result.status);
        setText("scanMessage", result.message);
    } catch (error) {
        console.error("Drainage backend error:", error);
        setText("scanStatus", "ERROR");
        setText("scanMessage", "Unable to connect to backend.");
    }
}

// =====================================
// FLOOD PREDICTION
// =====================================
async function predictFlood() {
    const rainfallEl = $("rainfallInput");
    const waterEl = $("waterInput");
    const drainageEl = $("drainageInput");

    if (!rainfallEl || !waterEl) return;

    const rainfall = parseFloat(rainfallEl.value);
    const waterLevel = parseFloat(waterEl.value);
    const drainage = drainageEl ? drainageEl.value : "";

    if (isNaN(rainfall) || isNaN(waterLevel)) {
        alert("Please enter rainfall and water level.");
        return;
    }

    setText("predictionResult", "PREDICTING...");
    setText("predictionMessage", "");

    try {
        const result = await apiRequest(
            "/api/predict",
            postJSON({
                rainfall: rainfall,
                waterLevel: waterLevel,
                drainage: drainage
            })
        );

        setText("predictionResult", result.risk);
        setText("predictionMessage", result.message);
    } catch (error) {
        console.error("Prediction backend error:", error);
        setText("predictionResult", "ERROR");
        setText("predictionMessage", "Unable to connect to backend. Please try again.");
    }
}

// =====================================
// FLOOD MAP
// =====================================
function showLocation(location, risk) {
    setText("selectedLocation", "Selected Location: " + location);
    setText("locationRisk", risk + " RISK");
}

async function loadMapLocations() {
    try {
        const locations = await apiRequest("/api/map-locations");
        // TODO: display these on your map / list
        console.log("Map locations loaded:", locations);
    } catch (error) {
        console.error("Flood Map backend error:", error);
    }
}

// =====================================
// ALERTS
// =====================================
function acknowledgeAlert() {
    setText("currentAlertTitle", "ALERT ACKNOWLEDGED");
    setText("currentAlertMessage", "The current warning has been acknowledged by the monitoring team.");
    setText("alertTime", new Date().toLocaleTimeString());
}

function generateAlert() {
    const output = $("alertOutput");
    if (!output) return;
    output.textContent = "🚨 Emergency flood alert generated successfully.";
    output.style.background = "#fee2e2";
    output.style.color = "#991b1b";
}

function showEvacuation() {
    const output = $("alertOutput");
    if (!output) return;

    output.textContent = "";
    const strong = document.createElement("strong");
    strong.textContent = "Evacuation Advice:";
    output.append(
        "🏃 ",
        strong,
        " Follow official emergency instructions and move toward designated safe areas when advised."
    );
    output.style.background = "#ffedd5";
    output.style.color = "#9a3412";
}

// Local alert banner based on stored risk
function updateAlertStatus() {
    const alertStatus = $("alertStatus");
    if (!alertStatus) return;

    if (floodData.risk === "HIGH") {
        alertStatus.textContent = "🔴 HIGH FLOOD RISK";
        setText("alertMessage", "High-risk conditions detected. Follow official emergency guidance.");
    } else if (floodData.risk === "MEDIUM") {
        alertStatus.textContent = "🟠 MEDIUM FLOOD RISK";
        setText("alertMessage", "Flood-risk indicators are elevated. Continue monitoring conditions.");
    } else {
        alertStatus.textContent = "🟢 LOW FLOOD RISK";
        setText("alertMessage", "Current conditions indicate relatively low flood risk.");
    }
}

// Alerts from backend
async function loadFloodAlerts() {
    try {
        const data = await apiRequest("/api/alerts");

        setText("currentAlertTitle", data.title);
        setText("currentAlertMessage", data.message);
        setText("alertTime", new Date().toLocaleTimeString());
    } catch (error) {
        // No alert() here: this runs automatically every few seconds
        console.error("Alerts backend error:", error);
    }
}

// =====================================
// EVACUATION
// =====================================
async function findSafeRoute() {
    const select = $("locationSelect");
    if (!select) return;

    try {
        const result = await apiRequest(
            "/api/evacuation",
            postJSON({ location: select.value })
        );

        setText("evacuationStatus", result.status);
        setText("evacuationMessage", result.message);

        const box = $("routeResult");
        if (box) {
            // Built with textContent (not innerHTML) to avoid HTML injection
            box.textContent = "";

            const title = document.createElement("h3");
            title.textContent = "Route Recommendation";
            box.appendChild(title);

            [
                ["Location", result.location],
                ["Risk Level", result.risk],
                ["Recommended Route", result.route]
            ].forEach(function (item) {
                const p = document.createElement("p");
                const label = document.createElement("strong");
                label.textContent = item[0] + ": ";
                p.appendChild(label);
                p.append(String(item[1]));
                box.appendChild(p);
            });
        }
    } catch (error) {
        console.error("Evacuation backend error:", error);
        alert("Unable to connect to backend!");
    }
}

function activateEvacuationMode() {
    setText("evacuationStatus", "EVACUATION ALERT");
    setText(
        "evacuationMessage",
        "Follow official emergency instructions and move toward designated safe areas when advised."
    );
}

// =====================================
// RAINFALL ANALYSIS
// =====================================

// Simulated analysis (demo button)
function analyzeRainfall() {
    const rainfall = Math.floor(Math.random() * 100) + 1;

    floodData.rainfall = rainfall;
    calculateFloodRisk(); // same thresholds as everywhere else

    let intensity;
    if (rainfall <= 25) {
        intensity = "LOW";
    } else if (rainfall <= 60) {
        intensity = "MODERATE";
    } else {
        intensity = "HEAVY";
    }

    setText("rainValue", rainfall);
    setText("rainIntensity", intensity);
    setText("rainContribution", floodData.risk);
    setText("rainAnalysisStatus", floodData.risk);
    setText("rainAnalysisMessage", "Rainfall data updated successfully. Flood risk: " + floodData.risk);
}

// Backend rainfall analysis
async function loadRainfallAnalysis() {
    try {
        const data = await apiRequest("/api/rainfall-analysis");

        setText("rainValue", data.rainfall);
        setText("rainIntensity", data.intensity);
        setText("rainContribution", data.contribution);
    } catch (error) {
        console.error("Rainfall backend error:", error);
    }
}

// =====================================
// MITIGATION
// =====================================
async function loadMitigationData() {
    try {
        const data = await apiRequest("/api/mitigation");
        setText("preparednessScore", data.preparednessScore + "%");
    } catch (error) {
        console.error("Mitigation backend error:", error);
    }
}

async function generateMitigation() {
    try {
        const data = await apiRequest(
            "/api/mitigation-recommendation",
            postJSON({})
        );

        setText("mitigationStatus", data.status);
        setText("mitigationMessage", data.message);
    } catch (error) {
        console.error("Mitigation recommendation error:", error);
        alert("Unable to connect to backend!");
    }
}

// =====================================
// PAGE INITIALISATION (by element, not by file name)
// =====================================
document.addEventListener("DOMContentLoaded", function () {

    // Home
    updateHomeStatus();

    // Monitoring
    updateMonitoringPage();

    // Alert banner
    updateAlertStatus();

    // Dashboard
    if ($("dashRisk")) {
        updateDashboardFromData();      // show cached data instantly
        updateDashboardFromBackend();   // then fetch fresh data
        setInterval(updateDashboardFromBackend, REFRESH_INTERVAL);
    }

    // Alerts page
    if ($("currentAlertTitle")) {
        loadFloodAlerts();
        setInterval(loadFloodAlerts, REFRESH_INTERVAL);
    }

    // Rainfall page
    if ($("rainValue")) {
        loadRainfallAnalysis();
    }

    // Mitigation page
    if ($("preparednessScore")) {
        loadMitigationData();
    }

    // Flood map page
    if ($("selectedLocation")) {
        loadMapLocations();
    }
});