import React, { useState } from "react";

function simulateBetOutcome(betArray, clientSeed, nonce) {
    const hash = `${clientSeed}-${nonce}`;
    const randomValue = hash.length + Math.random();
    return Math.floor(randomValue % betArray.length);
}

function generateNumericString(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

export default function Simulator() {
    const [clientSeed, setClientSeed] = useState(generateNumericString(9));
    const [rngSeed, setRngSeed] = useState(generateNumericString(64));
    const [nonce, setNonce] = useState(1);
    const [betArray, setBetArray] = useState([5, 0, 0, 0, 0]);
    const [simulationResult, setSimulationResult] = useState(null);
    const [validationMessage, setValidationMessage] = useState("");
    const [validationStatus, setValidationStatus] = useState("");

    const validateBetArray = (betArray) => {
        const sum = betArray.reduce((acc, curr) => acc + curr, 0);
        const expectedValue = sum / betArray.length;

        if (expectedValue === 1) {
            setValidationMessage("Equal odds = allowed ✅");
            setValidationStatus("success");
        } else if (expectedValue > 1) {
            setValidationMessage("Player has an advantage = not allowed ❌");
            setValidationStatus("error");
        } else {
            setValidationMessage("House has an advantage = not allowed ❌");
            setValidationStatus("error");
        }
    };

    const handleSimulate = () => {
        const result = simulateBetOutcome(betArray, clientSeed, nonce);
        setSimulationResult(result);
        validateBetArray(betArray);
    };

    const renderBetArrayWithHighlight = () => (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "5px",
                justifyContent: "center",
                maxWidth: "100%",
                overflow: "hidden",
            }}
        >
            {betArray.map((value, index) => (
                <div
                    key={index}
                    style={{
                        padding: "auto",
                        borderRadius: "25%",
                        backgroundColor: index === simulationResult ? "#4CAF50" : "#f44336",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "16px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        textAlign: "center",
                        width: "25px",
                        height: "25px",
                    }}
                >
                    {value}x
                </div>
            ))}
        </div>
    );


    return (
        <div
            style={{
                maxWidth: "500px",
                margin: "auto",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                textAlign: "center",
                border: "1px solid #ccc",
            }}
        >
            <label style={{ display: "block", fontWeight: "bold", fontSize: "24px" }}>
                Gamba Play Simulator
            </label>
            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    RNG Seed:
                </label>
                <input
                    type="number"
                    value={rngSeed}
                    onChange={(e) => setRngSeed(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />
            </div>
            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Client Seed:
                </label>
                <input
                    type="number"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />
            </div>
            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Nonce:
                </label>
                <input
                    type="number"
                    value={nonce}
                    onChange={(e) => setNonce(parseInt(e.target.value))}
                    style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />
            </div>
            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Bet Array (comma-separated):
                </label>
                <input
                    value={betArray.join(",")}
                    onChange={(e) =>
                        setBetArray(e.target.value.split(",").map(Number))
                    }
                    style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />
            </div>
            <button
                onClick={handleSimulate}
                style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#8851ff",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9564ff")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#8851ff")}
            >
                Simulate Play
            </button>
            <p
                style={{
                    marginTop: "10px",
                    color: validationStatus === "success" ? "#4CAF50" : "#f44336",
                    fontWeight: "bold",
                }}
            >
                {validationMessage}
            </p>
            <label>
                Result:
            </label>
            {simulationResult !== null && renderBetArrayWithHighlight()}
        </div>
    );
}
