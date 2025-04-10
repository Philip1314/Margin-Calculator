document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get input elements
    const positionTypeSelect = document.getElementById('positionType');
    const initialCapitalInput = document.getElementById('initialCapital');
    const riskPreferencePercentInput = document.getElementById('riskPreferencePercent');
    const entryPriceInput = document.getElementById('entryPrice');
    const takeProfitPriceInput = document.getElementById('takeProfitPrice');

    // Get output elements
    const margin2xEl = document.getElementById('margin2x');
    const margin3xEl = document.getElementById('margin3x');
    const margin5xEl = document.getElementById('margin5x');
    const margin10xEl = document.getElementById('margin10x');
    const margin30xEl = document.getElementById('margin30x');
    const margin50xEl = document.getElementById('margin50x');
    const margin100xEl = document.getElementById('margin100x');
    const margin125xEl = document.getElementById('margin125x');
    const profitAmountEl = document.getElementById('profitAmount');
    const stopLossPriceEl = document.getElementById('stopLossPrice');
    const possibleLossEl = document.getElementById('possibleLoss'); // Get possible loss element
    const errorDiv = document.getElementById('error');
    const resultsDiv = document.getElementById('results');

    // Clear previous results and errors
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Get values and convert to numbers
    const positionType = positionTypeSelect.value; // 'long' or 'short'
    const initialCapital = parseFloat(initialCapitalInput.value);
    const preferredRiskPercent = parseFloat(riskPreferencePercentInput.value);
    const entryPrice = parseFloat(entryPriceInput.value);
    const takeProfitPrice = parseFloat(takeProfitPriceInput.value);

    // --- Input Validation ---
    if (isNaN(initialCapital) || isNaN(preferredRiskPercent) || isNaN(entryPrice) || isNaN(takeProfitPrice)) {
        errorDiv.textContent = 'Error: Please fill in all fields with valid numbers.';
        errorDiv.style.display = 'block';
        return;
    }
    if (initialCapital <= 0 || preferredRiskPercent <= 0 || entryPrice <= 0 || takeProfitPrice <= 0) {
        errorDiv.textContent = 'Error: Initial capital, preferred risk percentage, and prices must be positive numbers.';
        errorDiv.style.display = 'block';
        return;
    }
    if (entryPrice === takeProfitPrice) {
        errorDiv.textContent = 'Error: Entry Price and Take Profit Price cannot be the same.';
        errorDiv.style.display = 'block';
        return;
    }
    if (preferredRiskPercent > 100 || preferredRiskPercent <= 0) {
        errorDiv.textContent = 'Error: Preferred risk percentage must be between 0 and 100.';
        errorDiv.style.display = 'block';
        return;
    }

    let lossPerTrade;
    let positionSize;
    let profitAmount;
    let stopLossPrice;
    let takeProfitPercent;
    let stopLossPercent;

    // Calculate loss per trade in currency
    lossPerTrade = initialCapital * (preferredRiskPercent / 100);

    // --- Calculate Take Profit Percentage ---
    if (positionType === 'long') {
        if (takeProfitPrice <= entryPrice) {
            errorDiv.textContent = 'Error: For LONG, Take Profit Price must be higher than Entry Price.';
            errorDiv.style.display = 'block';
            return;
        }
        takeProfitPercent = ((takeProfitPrice - entryPrice) / entryPrice) * 100;
        stopLossPercent = takeProfitPercent / 2; // Assuming 1:2 risk/reward
        stopLossPrice = entryPrice * (1 - (stopLossPercent / 100));
        profitAmount = positionSize * (takeProfitPercent / 100); // Profit will be calculated later with position size
    } else if (positionType === 'short') {
        if (takeProfitPrice >= entryPrice) {
            errorDiv.textContent = 'Error: For SHORT, Take Profit Price must be lower than Entry Price.';
            errorDiv.style.display = 'block';
            return;
        }
        takeProfitPercent = ((entryPrice - takeProfitPrice) / entryPrice) * 100;
        stopLossPercent = takeProfitPercent / 2; // Assuming 1:2 risk/reward
        stopLossPrice = entryPrice * (1 + (stopLossPercent / 100));
        profitAmount = positionSize * (takeProfitPercent / 100); // Profit will be calculated later with position size
    }

    // Calculate position size
    positionSize = lossPerTrade / (stopLossPercent / 100);

    // Calculate profit amount based on the calculated Take Profit percentage
    profitAmount = positionSize * (takeProfitPercent / 100);

    // --- Calculate Required Margin for different leverage levels ---
    const leverageValues = [2, 3, 5, 10, 30, 50, 100, 125];
    const marginResults = {};

    leverageValues.forEach(leverage => {
        marginResults[`${leverage}x`] = positionSize / leverage;
    });

    // --- Display Results ---
    possibleLossEl.textContent = lossPerTrade.toFixed(2); // Display possible loss
    profitAmountEl.textContent = profitAmount.toFixed(2);
    stopLossPriceEl.textContent = stopLossPrice; // No rounding

    // Display margin results with check against initial capital
    const marginElements = {
        '2x': margin2xEl,
        '3x': margin3xEl,
        '5x': margin5xEl,
        '10x': margin10xEl,
        '30x': margin30xEl,
        '50x': margin50xEl,
        '100x': margin100xEl,
        '125x': margin125xEl,
    };

    leverageValues.forEach(leverage => {
        const leverageKey = `${leverage}x`;
        const element = marginElements[leverageKey];
        if (marginResults[leverageKey] > initialCapital) {
            element.textContent = 'Not Applicable';
            element.style.color = 'red';
        } else {
            element.textContent = marginResults[leverageKey].toFixed(2);
            element.style.color = ''; // Reset color
        }
    });

    resultsDiv.style.display = 'block';
});