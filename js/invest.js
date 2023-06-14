const hoursInput = document.getElementById("hours");
const salaryInput = document.getElementById("salary");
const computeButton = document.getElementById("compute");
const resetButton = document.getElementById("reset");
const beforeTaxRateOutput = document.getElementById("beforeTaxPay");
const federalTaxRateOutput = document.getElementById("federalTaxRate");
const stateTaxRateOutput = document.getElementById("stateTaxRate");
const ficaTaxRateOutput = document.getElementById("ficaTaxRate");
const takeHomePayOutput = document.getElementById("takeHomePay");
const optionBox = document.getElementById("timeConverter");
//converted to years.
const conversionRatios = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);
//Margin Tax Rate: $10,275 goes to 10%, $31500 goes to 12%, until it reaches a bracket.
//1st additional money, 2nd number rate, 3rd number maxAllotedIncome
const federalYearlyRates = [[0.10, 10275], [0.12, 41775], [0.22, 89075], [0.24, 170050], [0.32, 215950], [0.35, 539900], [0.37, Infinity]];
const stateYearlyRates = [[0, 0, 6350], [0, 0.0025, 7350], [2.50, 0.0075, 8850], [13.75, 0.0175, 10100], [35.63, 0.0275, 11250], [67.25, 0.0375, 13550], [153.50, 0.0475, Infinity]];
const fica = [[0.062, 147000],[0.0145, 0]];

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", resetTextboxes);
optionBox.addEventListener("change", selectedOption);
//Note: First input is 40 hours per week.
//Note 2: If in hours, convert hours to weeks otherwise convert [weeks,months,years] to years.
//Test: $7.25 hr with 40 hrs/week should be 290 per week.
//Test2: $290 week with 40 hrs/week should be 1256 per month.
function takeHomePay() {
    let taxRate = 0, grossIncome = 0, federalTaxedIncome = 0, stateTaxedIncome = 0, ficaTaxedIncome = 0;
    let conversionOption = timeConverter.options[timeConverter.selectedIndex].text;
    beforeTaxRateOutput.textContent = beforeTaxRateOutput.textContent.substring(0, 29);
    federalTaxRateOutput.textContent = federalTaxRateOutput.textContent.substring(0, 19);
    stateTaxRateOutput.textContent = stateTaxRateOutput.textContent.substring(0, 17);
    takeHomePayOutput.textContent = takeHomePayOutput.textContent.substring(0, 24);
    ficaTaxRateOutput.textContent = ficaTaxRateOutput.textContent.substring(0, 23);
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
    beforeTaxRateOutput.textContent += " " + Math.round(salary / 12) + "/month";
    federalYearlyRates[6][1] = stateYearlyRates[6][2] = salary;
    federalTaxedIncome = getFederalTaxRate(salary);
    stateTaxedIncome = getStateTaxRate(salary);
    ficaTaxedIncome = getFicaTaxRate(salary);
    federalTaxRateOutput.textContent += " " + federalTaxedIncome + "   " + (federalTaxedIncome / salary).toFixed(4);
    stateTaxRateOutput.textContent += " " + stateTaxedIncome + "   " +(stateTaxedIncome / salary).toFixed(4);
    ficaTaxRateOutput.textContent += " " + ficaTaxedIncome + "   " + (ficaTaxedIncome / salary).toFixed(4);
    console.log(federalTaxedIncome + stateTaxedIncome + ficaTaxedIncome);
    salary -= federalTaxedIncome + stateTaxedIncome + ficaTaxedIncome;
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

function getFederalTaxRate(grossIncome) {
    let prevMaxIncome = 0;
    let taxes = 0;
    for([marginalTaxRate, maxAllotedIncome] of federalYearlyRates)
    {
        if(grossIncome > maxAllotedIncome)
        {
            taxes += marginalTaxRate * (maxAllotedIncome - prevMaxIncome);
            prevMaxIncome = maxAllotedIncome;
        } else {
            console.log(grossIncome - prevMaxIncome);
            taxes += marginalTaxRate * (grossIncome - prevMaxIncome);
            break;
        }
        console.log(taxes)
    }
    return parseFloat(taxes.toFixed(2));
}

function getStateTaxRate(grossIncome) {
    let prevMaxIncome = 0;
    let taxes = 0;
    for([additionalIncome, marginalTaxRate, maxAllotedIncome] of stateYearlyRates)
    {
        if(grossIncome > maxAllotedIncome) 
        { 
            prevMaxIncome = maxAllotedIncome
            continue;
        }
        taxes = additionalIncome + (marginalTaxRate * (grossIncome - prevMaxIncome));
    }
    return parseFloat(taxes.toFixed(2));
}

function getFicaTaxRate(grossIncome) {
    let ficaTaxRate = 0.062;
    let medicareTaxRate = [0.0145, 0.0235];
    let totalTaxIncome = 0;
    totalTaxIncome += (grossIncome > 160200 ? 160200 : grossIncome)  * ficaTaxRate;
    totalTaxIncome += (grossIncome > 200000 ? medicareTaxRate[1] : medicareTaxRate[0]) * grossIncome;
    return parseFloat(totalTaxIncome.toFixed(2));
}