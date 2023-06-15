import {getFederalTaxRate, getStateTaxRate, getFicaTaxRate, setBracketMaximum} from "./taxRates.js";

//Elements
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

const conversionRatiosToYear = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", resetTextboxes);
optionBox.addEventListener("change", selectedOption);

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
        if((isNaN(workHours) && conversionOption === "Hour") || isNaN(salary))
        {
            throw "Please enter numbers in the textboxes!";
        }
        resetTextboxes();
    } catch(e) {
        window.alert(e);
    }

    if(conversionOption === "Hour") 
    {
        salary *= workHours;
        conversionOption = "Week";
    }

    salary *= conversionRatiosToYear.get(conversionOption);
    beforeTaxRateOutput.textContent += " " + Math.round(salary / 12) + "/month";
    setBracketMaximum(salary);
    federalTaxedIncome = getFederalTaxRate(salary);
    stateTaxedIncome = getStateTaxRate(salary);
    ficaTaxedIncome = getFicaTaxRate(salary);
    federalTaxRateOutput.textContent += (federalTaxedIncome / salary * 100).toFixed(2) + "%";
    stateTaxRateOutput.textContent += (stateTaxedIncome / salary * 100).toFixed(2) + "%";
    ficaTaxRateOutput.textContent += (ficaTaxedIncome / salary * 100).toFixed(2) + "%";
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