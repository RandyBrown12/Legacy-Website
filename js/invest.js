const hoursInput = document.getElementById("hours");
const salaryInput = document.getElementById("salary");
const computeButton = document.getElementById("compute");
const resetButton = document.getElementById("reset");
const federalTaxRateOutput = document.getElementById("federalTaxRate");
const stateTaxRateOutput = document.getElementById("stateTaxRate");
const takeHomePayOutput = document.getElementById("takeHomePay");
const optionBox = document.getElementById("timeConverter");
//converted to years.
const conversionRatios = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);
//Margin Tax Rate: $10,275 goes to 10%, $31500 goes to 12%, until it reaches a bracket.
//1st additional money, 2nd number rate, 3rd number maxAllotedIncome
const federalYearlyRates = [[0.10, 10275], [0.12, 41775], [0.22, 89075], [0.24, 170050], [0.32, 215950], [0.35, 539900], [0.37, Infinity]];
const stateYearlyRates = [[0, 0, 6350], [0, 0.0025, 7350], [2.50, 0.0075, 8850], [13.75, 0.0175, 10100], [35.63, 0.0275, 11250], [67.25, 0.0375, 13550], [153.50, 0.0475, Infinity]];
const fica = [[0.062, 147000],[0.0145, 0]];
//1825 Semi-Monthly. Two Withholding
//41.67 * 2

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", resetTextboxes);
optionBox.addEventListener("change", selectedOption);
//Note: First input is 40 hours per week.
//Note 2: If in hours, convert hours to weeks otherwise convert [weeks,months,years] to years.
//Test: $7.25 hr with 40 hrs/week should be 290 per week.
//Test2: $290 week with 40 hrs/week should be 1256 per month.
function takeHomePay() {
    let taxRate = 0, grossIncome = 0, federalTaxedIncome = 0, stateTaxedIncome = 0;
    let conversionOption = timeConverter.options[timeConverter.selectedIndex].text;
    federalTaxRateOutput.textContent = federalTaxRateOutput.textContent.substring(0, 19);
    stateTaxRateOutput.textContent = stateTaxRateOutput.textContent.substring(0, 17);
    takeHomePayOutput.textContent = takeHomePayOutput.textContent.substring(0, 24);
    let workHours = parseInt(hoursInput.value);
    let salary = parseFloat(salaryInput.value);

    try
    {
        if((isNaN(workHours) && conversionOption === "Hour")|| isNaN(salary))
        {
            throw "Please enter numbers in the textboxes!";
        }
        resetTextboxes();
    } catch(e) {
        window.alert(e);
    }

    if(conversionOption === "Hour") {
        salary *= workHours;
        conversionOption = "Week";
    }
    salary *= conversionRatios.get(conversionOption);
    federalYearlyRates[6][1] = stateYearlyRates[6][2] = salary;
    federalTaxedIncome = getFederalTaxRate(salary);
    stateTaxedIncome = getStateTaxRate(salary);
    federalTaxRateOutput.textContent += " " + federalTaxedIncome;
    stateTaxRateOutput.textContent += " " + stateTaxedIncome;
    takeHomePayOutput.textContent += " " + Math.round(salary / 12) + "/month";
}

function resetTextboxes() {
    salaryInput.value = hoursInput.value = "";
}

function selectedOption() {
    if(timeConverter.selectedIndex !== 0) {
        hoursInput.disabled = true;
        hoursInput.value = hoursInput.placeholder = "";
        return;
    }
    hoursInput.disabled = false;
    hoursInput.placeholder = "Ex: 15";
}

function getFederalTaxRate(useGrossIncome) {
    let prevMaxIncome = 0;
    let taxes = 0;
    for([marginalTaxRate, maxAllotedIncome] of federalYearlyRates)
    {
        if(useGrossIncome > maxAllotedIncome)
        {
            taxes += marginalTaxRate * (maxAllotedIncome - prevMaxIncome);
            prevMaxIncome = maxAllotedIncome;
        } else {
            taxes += marginalTaxRate * (useGrossIncome - prevMaxIncome);
            break;
        }
    }
    return taxes.toFixed(2);
}

function getStateTaxRate(useGrossIncome) {
    let prevMaxIncome = 0;
    let taxes = 0;
    for([additionalIncome, marginalTaxRate, maxAllotedIncome] of stateYearlyRates)
    {
        if(useGrossIncome > maxAllotedIncome) 
        { 
            prevMaxIncome = maxAllotedIncome
            continue;
        }
        taxes = additionalIncome + (marginalTaxRate * (useGrossIncome - prevMaxIncome));
    }
    return taxes.toFixed(2);
}