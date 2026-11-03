from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import random

app = Flask(__name__)

CORS(app)


# =====================================
# SHARED FLOOD DATA
# =====================================

flood_data = {
    "rainfall": 82,
    "waterLevel": 2.4,
    "drainageIssues": 3,
    "affectedAreas": 12,
    "risk": "HIGH"
}


# =====================================
# HOME ROUTE - BACKEND STATUS
# =====================================

@app.route("/")
def home():

    return jsonify({
        "message": "AI Flood Management Backend is running!"
    })


# =====================================
# GET FLOOD DATA
# =====================================

@app.route("/api/flood-data", methods=["GET"])
def get_flood_data():

    return jsonify(flood_data)


# =====================================
# UPDATE FLOOD DATA
# =====================================

@app.route("/api/update-data", methods=["POST"])
def update_flood_data():

    global flood_data

    data = request.get_json() or {}

    flood_data["rainfall"] = float(
        data.get("rainfall", flood_data["rainfall"])
    )

    flood_data["waterLevel"] = float(
        data.get("waterLevel", flood_data["waterLevel"])
    )

    rainfall = flood_data["rainfall"]
    water_level = flood_data["waterLevel"]

    # Calculate flood risk

    if rainfall >= 90 or water_level >= 2.7:

        flood_data["risk"] = "HIGH"
        flood_data["affectedAreas"] = 20

    elif rainfall >= 60 or water_level >= 2.2:

        flood_data["risk"] = "MEDIUM"
        flood_data["affectedAreas"] = 13

    else:

        flood_data["risk"] = "LOW"
        flood_data["affectedAreas"] = 5

    return jsonify({
        "message": "Flood data updated successfully!",
        "data": flood_data
    })


# =====================================
# FLOOD PREDICTION API
# =====================================

@app.route("/api/predict", methods=["POST"])
def predict_flood():

    data = request.get_json() or {}

    rainfall = float(data.get("rainfall", 0))
    water_level = float(data.get("waterLevel", 0))

    drainage = str(
        data.get("drainage", "normal")
    ).lower()

    # Calculate flood risk

    if (
        rainfall >= 90
        or water_level >= 2.7
        or drainage == "blocked"
    ):

        risk = "HIGH"

        message = (
            "High flood risk! "
            "Immediate precautions are recommended."
        )

    elif (
        rainfall >= 60
        or water_level >= 2.2
        or drainage == "partial"
    ):

        risk = "MEDIUM"

        message = (
            "Moderate flood risk. "
            "Stay alert and monitor conditions."
        )

    else:

        risk = "LOW"

        message = (
            "Low flood risk. "
            "Conditions are relatively safe."
        )

    return jsonify({
        "risk": risk,
        "message": message,
        "rainfall": rainfall,
        "waterLevel": water_level,
        "drainage": drainage
    })


# =====================================
# FLOOD ALERTS API
# =====================================

@app.route("/api/alerts", methods=["GET"])
def get_flood_alerts():

    risk = flood_data["risk"]

    if risk == "HIGH":

        title = "HIGH FLOOD RISK"

        message = (
            "Heavy rainfall and rising water levels "
            "require immediate attention."
        )

    elif risk == "MEDIUM":

        title = "MODERATE FLOOD RISK"

        message = (
            "Increased monitoring is recommended. "
            "Stay alert."
        )

    else:

        title = "LOW FLOOD RISK"

        message = (
            "Normal environmental conditions. "
            "Stay aware."
        )

    return jsonify({
        "risk": risk,
        "title": title,
        "message": message
    })


# =====================================
# FLOOD MAP API
# =====================================

@app.route("/api/map-locations", methods=["GET"])
def get_map_locations():

    risk = flood_data["risk"]

    locations = [

        {
            "name": "Riverside Area",
            "risk": "High" if risk == "HIGH" else "Medium"
        },

        {
            "name": "Central Lowland",
            "risk": "Medium" if risk != "LOW" else "Low"
        },

        {
            "name": "North Residential Area",
            "risk": "Low"
        },

        {
            "name": "East Junction",
            "risk": "Medium" if risk != "HIGH" else "High"
        }

    ]

    return jsonify(locations)


# =====================================
# DRAINAGE SCANNER API
# =====================================

@app.route("/api/drainage-scan", methods=["GET"])
def drainage_scan():

    blockage = random.choice([
        "NORMAL",
        "PARTIAL BLOCKAGE",
        "BLOCKED"
    ])

    if blockage == "NORMAL":

        status = "NORMAL"

        message = (
            "Drainage network is functioning properly."
        )

    elif blockage == "PARTIAL BLOCKAGE":

        status = "WARNING"

        message = (
            "Partial blockage detected. "
            "Maintenance is recommended."
        )

    else:

        status = "CRITICAL"

        message = (
            "Severe blockage detected! "
            "Immediate cleaning is required."
        )

    return jsonify({
        "status": status,
        "message": message
    })


# =====================================
# EVACUATION API
# =====================================

@app.route("/api/evacuation", methods=["POST"])
def evacuation():

    data = request.get_json() or {}

    location = data.get(
        "location",
        "Riverside Area"
    )

    risk = flood_data["risk"]

    if risk == "HIGH":

        status = "EVACUATION ALERT"

        message = (
            "High flood risk! Evacuation is strongly "
            "recommended. Follow official emergency instructions."
        )

        route = (
            "Move to the nearest designated elevated shelter. "
            "Avoid flooded roads."
        )

    elif risk == "MEDIUM":

        status = "PRECAUTIONARY ALERT"

        message = (
            "Moderate flood risk. "
            "Prepare for possible evacuation."
        )

        route = (
            "Move toward elevated safe areas "
            "and monitor official alerts."
        )

    else:

        status = "PREPAREDNESS MODE"

        message = (
            "Flood risk is low. "
            "Stay alert and prepared."
        )

        route = (
            "No immediate evacuation required. "
            "Follow local safety guidance."
        )

    return jsonify({
        "location": location,
        "risk": risk,
        "status": status,
        "message": message,
        "route": route
    })


# =====================================
# RAINFALL ANALYSIS API
# =====================================

@app.route("/api/rainfall-analysis", methods=["GET"])
def rainfall_analysis():

    rainfall = flood_data["rainfall"]

    # Rainfall intensity

    if rainfall >= 80:

        intensity = "HEAVY"

    elif rainfall >= 50:

        intensity = "MODERATE"

    else:

        intensity = "LIGHT"

    # Rainfall contribution to flood

    if rainfall >= 80:

        contribution = "HIGH"

    elif rainfall >= 50:

        contribution = "MEDIUM"

    else:

        contribution = "LOW"

    return jsonify({
        "rainfall": rainfall,
        "intensity": intensity,
        "contribution": contribution
    })


# =====================================
# MITIGATION ANALYSIS API
# =====================================

@app.route("/api/mitigation", methods=["GET"])
def mitigation_analysis():

    rainfall = flood_data["rainfall"]
    risk = flood_data["risk"]

    # Simulated preparedness score

    if risk == "HIGH":

        score = 60

    elif risk == "MEDIUM":

        score = 78

    else:

        score = 95

    return jsonify({
        "preparednessScore": score,
        "rainfall": rainfall,
        "risk": risk
    })


# =====================================
# MITIGATION RECOMMENDATION API
# =====================================

@app.route(
    "/api/mitigation-recommendation",
    methods=["POST"]
)
def mitigation_recommendation():

    rainfall = flood_data["rainfall"]
    risk = flood_data["risk"]

    if risk == "HIGH":

        status = "HIGH PRIORITY"

        message = (
            "Heavy rainfall and high flood risk detected. "
            "Clean drainage channels, activate emergency "
            "monitoring, prepare evacuation shelters, "
            "and follow official alerts."
        )

    elif risk == "MEDIUM":

        status = "PRECAUTIONARY ACTION"

        message = (
            "Moderate flood risk detected. "
            "Monitor rainfall and water levels, "
            "inspect drainage systems, and prepare "
            "emergency supplies."
        )

    else:

        status = "NORMAL PREPAREDNESS"

        message = (
            "Flood risk is currently low. "
            "Maintain clean drainage systems, "
            "monitor weather conditions, and keep "
            "emergency supplies ready."
        )

    return jsonify({
        "status": status,
        "message": message,
        "risk": risk,
        "rainfall": rainfall
    })


# =====================================
# RUN FLASK SERVER (RENDER COMPATIBLE)
# =====================================

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )