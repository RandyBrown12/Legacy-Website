const hoursInput = document.getElementById("hours");
const salaryInput = document.getElementById("salary");
const computeButton = document.getElementById("compute");
const resetButton = document.getElementById("reset");
const taxRateOutput = document.getElementById("taxRate");
const takeHomePayOutput = document.getElementById("takeHomePay");
const conversionRatios = [["hour", 1], ["week", 168], ["month", 1], ["year", 1]];
let taxRate = 0;
let grossIncome = 0;

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", testTwo);

//Note: First input is 40 hours per week.

function takeHomePay() {
    grossIncome = 0;
    taxRate = 0;
    taxRateOutput.textContent = taxRateOutput.textContent.substring(0, 9);
    takeHomePayOutput.textContent = takeHomePayOutput.textContent.substring(0, 24);
/*     let years = parseInt(hoursInput.value) * 8760; */
    console.log(taxRateOutput.textContent);
    let salary = parseInt(salaryInput.value);
    try
    {
/*         if(isNaN(years))
        {
            throw "Please enter a number in the hours textbox!";
        } */
        if(isNaN(salary))
        {
            throw "Please enter a number in the salary textbox!";
        }
        salaryInput.value = "";
    } catch(e) {
        window.alert(e);
    }
    grossIncome = salary;
    taxRate = getTaxRate(grossIncome);
    taxRateOutput.textContent += " " + (taxRate * 100) + "%";
    takeHomePayOutput.textContent += " " + Math.round(grossIncome / 180) + "/month";
}

function testTwo() {
    salaryInput.value = "";
}

function getTaxRate(useGrossIncome) {
    if(useGrossIncome > 215950) {
        return 0.35;
    } else if(useGrossIncome > 170050) {
        return 0.32;
    } else if(useGrossIncome > 89075) {
        return 0.24;
    } else if(useGrossIncome > 41775) {
        return 0.22;
    } else if(useGrossIncome > 10275) {
        return 0.12;
    } else {
        return 0;
    }
}