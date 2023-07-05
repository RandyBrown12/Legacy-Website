import { getTaxRate, getFicaTaxRate, setBracketMaximum } from "./taxRates.js";

//Elements
const outputCalculatorForm = document.getElementById("outputCalculator");
const computeButton = document.getElementById("compute");
const hoursInput = document.getElementById("hours");
const optionBox = document.getElementById("timeConverter");
const resetButton = document.getElementById("reset");
const salaryInput = document.getElementById("salary");
const afterCalculationForm = document.getElementById("afterCalculation");
const afterCalculationText = document.getElementById("afterCalculationText");
const donutChartCanvas = document.getElementById("donutChart");
afterCalculationText.style.visibility = afterCalculationForm.style.visibility = "hidden";
const conversionRatiosToYear = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", reset);
optionBox.addEventListener("change", selectedOption);

function takeHomePay() 
{
    let federalTaxedIncome = 0, stateTaxedIncome = 0, ficaTaxedIncome = 0, incomeAfterTax = 0;
    let conversionOption = timeConverter.options[timeConverter.selectedIndex].text;

    let workHours = parseFloat(hoursInput.value);
    let incomeBeforeTax = parseFloat(salaryInput.value);
    try {
        if ((isNaN(workHours) && conversionOption === "Hour") || isNaN(incomeBeforeTax)) {
            throw "Please enter numbers in the textboxes!";
        } else if(incomeBeforeTax <= 0 || (conversionOption === "Hour" && workHours <= 0)) {
            throw "Please enter positive numbers in the textboxes!";
        }
        reset();
    } catch (e) {
        window.alert(e);
        return;
    }

    if (conversionOption === "Hour") {
        incomeBeforeTax *= workHours;
        conversionOption = "Week";
    }
    
    incomeBeforeTax *= conversionRatiosToYear.get(conversionOption);
    setBracketMaximum(incomeBeforeTax);

    federalTaxedIncome = getTaxRate(incomeBeforeTax, "Federal");
    stateTaxedIncome = getTaxRate(incomeBeforeTax, "State");
    ficaTaxedIncome = getFicaTaxRate(incomeBeforeTax);

    incomeAfterTax = incomeBeforeTax - (federalTaxedIncome + stateTaxedIncome + ficaTaxedIncome);
    incomeAfterTax = incomeAfterTax.toFixed(2);

    outputCalculatorForm.innerHTML = "Before Tax: $" + Math.round(incomeBeforeTax / 12) + "/month";
    outputCalculatorForm.innerHTML += "<br>After Tax: $" + Math.round(incomeAfterTax / 12) + "/month";
    afterCalculationText.style.visibility = afterCalculationForm.style.visibility = "visible";

    let allTaxes = [federalTaxedIncome, stateTaxedIncome, ficaTaxedIncome, incomeAfterTax];
    
    createDonutChart(allTaxes, incomeBeforeTax);
}

function reset() {
    outputCalculatorForm.value = salaryInput.value = hoursInput.value = "";
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
    let chartFontSize = 0;
    if(myChart !== null) {
        myChart.destroy()
        donutChartCanvas.style.display = 'none';
    }

    if(donutChartCanvas.offsetWidth === 650 && donutChartCanvas.offsetHeight === 500) {
        chartFontSize = 500;
    } else if(donutChartCanvas.offsetWidth === 400 && donutChartCanvas.offsetHeight === 300) {
        chartFontSize = 150;
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
            responsive: false, maintainAspectRatio: false,
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
