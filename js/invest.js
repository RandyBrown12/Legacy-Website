import { getTaxRate, getFicaTaxRate, setBracketMaximum } from "./taxRates.js";

//Elements
const outputCalculatorForm = document.getElementById("outputCalculator");
const computeButton = document.getElementById("compute");
const hoursInput = document.getElementById("hours");
const optionBox = document.getElementById("timeConverter");
const resetButton = document.getElementById("reset");
const salaryInput = document.getElementById("salary");
const afterCalculationForm = document.getElementById("afterCalculation");
const afterCalculationInfo = document.getElementById("afterCalculationInfo");
const donutChartCanvas = document.getElementById("donutChart");
const advancedFormButton = document.getElementById("advanced");
const advancedForm = document.getElementById("advancedForm");
const afterCalcuationFormDropDown = document.getElementById("afterCalculationTime");
const selfEmployeedCheckBox = document.getElementById("selfEmployeed");
const filingStatusDropDown = document.getElementById("filingStatus");
const debtCalculatorForm = document.getElementById("debtCalculator");
const isDebtCalculatorForm = document.getElementById("isDebtCalculator");

const conversionRatiosToYear = new Map([["Week", 52.1429], ["Biweek", 26.07145], ["Semimonth", 24], ["Month", 12], ["Year", 1]]);

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", reset);
advancedFormButton.addEventListener("click", function() { addForm(advancedForm) });
optionBox.addEventListener("change", selectedOption);
isDebtCalculatorForm.addEventListener("change", function() { addForm(debtCalculatorForm) });

function addForm(form) 
{
    if(form.style.display === "block") 
    {
        form.style.display = "none";
        return;
    }
    form.style.display = "block";
}

/* function activateForm() {
    if(isDebtCalculatorForm.checked) {

    }
} */

function takeHomePay() 
{
    let federalTaxedIncome = 0, stateTaxedIncome = 0, ficaTaxedIncome = 0, incomeAfterTax = 0;
    let salaryTimeOption = timeConverter.value;
    let afterCalculationTimeOption = afterCalcuationFormDropDown.value;
    let filingStatus = filingStatusDropDown.value;

    let workHours = parseFloat(hoursInput.value);
    let incomeBeforeTax = parseFloat(salaryInput.value);

    try {
        if ((isNaN(workHours) && salaryTimeOption === "Hour") || isNaN(incomeBeforeTax)) {
            throw "Please enter numbers in the textboxes!";
        } else if(incomeBeforeTax <= 0 || (salaryTimeOption === "Hour" && workHours <= 0)) {
            throw "Please enter positive numbers in the textboxes!";
        } else if(salaryTimeOption === "Hour" && workHours > 168) {
            throw "You can't work over 168 hours every week!";
        }

    } catch (e) {
        window.alert(e);
        return;
    }

    if (salaryTimeOption === "Hour") {
        incomeBeforeTax *= workHours;
        salaryTimeOption = "Week";
    }
    
    incomeBeforeTax *= conversionRatiosToYear.get(salaryTimeOption);
    setBracketMaximum(incomeBeforeTax, filingStatus);
/*     setBracketMaximum(incomeBeforeTax); */
    federalTaxedIncome = getTaxRate(incomeBeforeTax, "Federal" + filingStatus);
    filingStatus = (filingStatus === "Single" || filingStatus === "MFS") ? "Seperate" : "Jointly";
    stateTaxedIncome = getTaxRate(incomeBeforeTax, "State" + filingStatus);
    ficaTaxedIncome = getFicaTaxRate(incomeBeforeTax, selfEmployeedCheckBox.checked);

    incomeAfterTax = incomeBeforeTax - (federalTaxedIncome + stateTaxedIncome + ficaTaxedIncome);
    incomeAfterTax = incomeAfterTax.toFixed(2);

    outputCalculatorForm.innerHTML = "Before Tax: $" + (incomeBeforeTax / conversionRatiosToYear.get(afterCalculationTimeOption)).toFixed(2) + "/" + afterCalculationTimeOption;
    outputCalculatorForm.innerHTML += "<br>After Tax: $" + (incomeAfterTax / conversionRatiosToYear.get(afterCalculationTimeOption)).toFixed(2) + "/"+ afterCalculationTimeOption;
    afterCalculationInfo.style.display = afterCalculationForm.style.display = "block";

    let allTaxes = [federalTaxedIncome, stateTaxedIncome, ficaTaxedIncome, incomeAfterTax];
    
    createDonutChart(allTaxes, incomeBeforeTax);
}

function reset() {
    outputCalculatorForm.value = salaryInput.value = hoursInput.value = "";
    advancedForm.style.display = afterCalculationInfo.style.display = afterCalculationForm.style.display = "none";
    if(myChart !== null) {
        myChart.destroy()
    }
}

function selectedOption() {
    if (timeConverter.selectedIndex !== 0) {
        hoursInput.disabled = true;
        hoursInput.value = hoursInput.placeholder = "";
        return;
    }
    hoursInput.disabled = false;
    hoursInput.placeholder = "Ex: 15";
}

let myChart = null
function createDonutChart(allTaxes, incomeBeforeTax) {
    if(myChart !== null) {
        myChart.destroy()
    }

    myChart = new Chart(donutChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Federal Tax', 'State Tax', 'FICA', 'Remaining Income'],
          datasets: [{
            data: allTaxes,
            backgroundColor: ['#000000','#E18A18','#1912DB','#41AC1A'],
            borderWidth: 1
          }]
        },
        options: 
        {
            responsive: true, maintainAspectRatio: false,
            title: 
            {
                display: true, 
                text:'Amount of Money after Taxes annually',
                font: {
                    family: 'Arial',
                    size: 150,
                    style: 'basic',
                },
                colors: 'rgba(0, 0, 0, 1)',
            },
            plugins: {
                datalabels:
                {
                    color: 'whitesmoke',
                    formatter: function(value) {
                        if(value === 0)
                        {
                            return null;
                        }
                        return (value / incomeBeforeTax * 100).toFixed(2) + "%";
                    }
                },
            }
        }
      });
      donutChartCanvas.style.display = 'block';
}
