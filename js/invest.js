const hoursInput = document.getElementById("hours");
const salaryInput = document.getElementById("salary");
const computeButton = document.getElementById("compute");
const resetButton = document.getElementById("reset");
const taxRateOutput = document.getElementById("taxRate");
const takeHomePayOutput = document.getElementById("takeHomePay");
const optionBox = document.getElementById("timeConverter");
//converted to years.
const conversionRatios = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);
//Margin Tax Rate: $10,275 goes to 10%, $31500 goes to 12%, until it reaches a bracket.
const federalYearlyRates = new Map([[0.10, 10275], [0.12, 41775], [0.22, 89075], [0.24, 170050], [0.32, 215950], [0.35, 539900], [0.37, 999999999]]);
const stateYearlyRates = new Map([[0.0025, 1000], [0.0075, 2500], [0.0175, 3750], [0.0275, 4900], [0.0375, 7200], [0.0475, 999999999]]);
let taxRate = 0;
let grossIncome = 0;
let conversionOption = "";

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", resetTextboxes);
optionBox.addEventListener("change", selectedOption);
//Note: First input is 40 hours per week.
//Note 2: If in hours, convert hours to weeks otherwise convert [weeks,months,years] to years.
//Test: $7.25 hr with 40 hrs/week should be 290 per week.
//Test2: $290 week with 40 hrs/week should be 1256 per month.
function takeHomePay() {
    taxRate = 0;
    grossIncome = 0;
    taxRateOutput.textContent = taxRateOutput.textContent.substring(0, 9);
    takeHomePayOutput.textContent = takeHomePayOutput.textContent.substring(0, 24);
    let workHours = parseInt(hoursInput.value);
    let salary = parseFloat(salaryInput.value);
    let conversionOption = timeConverter.options[timeConverter.selectedIndex].text;
    try
    {
        if(isNaN(workHours) && timeConverter.selectedIndex === 0)
        {
            throw "Please enter a number in the hours textbox!";
        }
        if(isNaN(salary))
        {
            throw "Please enter a number in the salary textbox!";
        }
        resetTextboxes();
    } catch(e) {
        window.alert(e);
    }

    if(conversionOption === "Hour") {
        salary *= workHours;
        conversionOption = "Week";
    }
    salary *= conversionRatios.get(conversionOption)
    grossIncome = getTaxRate(salary, "Federal");
    taxRateOutput.textContent += getTaxRate(salary, "Federal") + "    " + getTaxRate(salary, "State");
    takeHomePayOutput.textContent += " " + Math.round(grossIncome / 12) + "/month";
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

function getTaxRate(useGrossIncome, chosenTaxBracket) {
    let prevMaxIncome = 0;
    let federalTaxes = 0;
    if(chosenTaxBracket === "Federal") {
        chosenTaxBracket = federalYearlyRates.entries();
    } else if(chosenTaxBracket === "State") {
        chosenTaxBracket = stateYearlyRates.entries();
    }
    for([marginalTaxRate, maxIncome] of chosenTaxBracket)
    {
        if(useGrossIncome > maxIncome)
        {
            federalTaxes += marginalTaxRate * (maxIncome - prevMaxIncome);
            prevMaxIncome = maxIncome;
        } else {
            federalTaxes += marginalTaxRate * (useGrossIncome - prevMaxIncome);
            break;
        }
        console.log(federalTaxes);
    }
    return federalTaxes;
}