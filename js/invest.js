const hoursInput = document.getElementById("hours");
const salaryInput = document.getElementById("salary");
const computeButton = document.getElementById("compute");
const resetButton = document.getElementById("reset");
const taxRateOutput = document.getElementById("taxRate");
const takeHomePayOutput = document.getElementById("takeHomePay");
const optionBox = document.getElementById("timeConverter");
//converted to years.
const conversionRatios = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);
let taxRate = 0;
let grossIncome = 0;
let conversionOption = "";

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", testTwo);

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
        if(isNaN(workHours))
        {
            throw "Please enter a number in the hours textbox!";
        }
        if(isNaN(salary))
        {
            throw "Please enter a number in the salary textbox!";
        }
        salaryInput.value = "";
        hoursInput.value = "";
    } catch(e) {
        window.alert(e);
    }

    if(conversionOption === "Hour") {
        salary *= workHours;
        conversionOption = "Week";
    }
    grossIncome = salary * conversionRatios.get(conversionOption);
    taxRate = getTaxRate(grossIncome);
    taxRateOutput.textContent += " " + (taxRate * 100) + "%";
    takeHomePayOutput.textContent += " " + Math.round(grossIncome / 12) + "/month";
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