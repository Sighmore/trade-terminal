// Function to handle trade execution
document.getElementById("executeTrade").addEventListener("click", () => {
    const bias = document.getElementById("bias").value;
    const sentiment = document.getElementById("sentiment").value;
    const asiaSweep = document.getElementById("asiaSweep").checked;
    const eab = document.getElementById("eab").checked;

    // Validate the inputs
    if (!bias) {
        displayResult("Please select a bias.");
        return;
    }
    if (!sentiment) {
        displayResult("Please provide the sentiment behind the bias.");
        return;
    }
    if (!asiaSweep || !eab) {
        displayResult("Please complete all checklist items.");
        return;
    }

    // Simulate trade execution
    displayResult(`Trade executed: ${bias.toUpperCase()} with sentiment '${sentiment}'.`);
});

// Function to display results
function displayResult(message) {
    const resultElement = document.getElementById("result");
    resultElement.textContent = message;
}
