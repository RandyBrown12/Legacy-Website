import { getTaxRate, getFicaTaxRate, setBracketMaximum } from "./taxRates.js";

//Elements
const beforeTaxRateOutput = document.getElementById("beforeTaxPay");
const computeButton = document.getElementById("compute");
const federalTaxRateOutput = document.getElementById("federalTaxRate");
const ficaTaxRateOutput = document.getElementById("ficaTaxRate");
const hoursInput = document.getElementById("hours");
const optionBox = document.getElementById("timeConverter");
const resetButton = document.getElementById("reset");
const salaryInput = document.getElementById("salary");
const stateTaxRateOutput = document.getElementById("stateTaxRate");
const takeHomePayOutput = document.getElementById("takeHomePay");
const afterCalculationForm = document.getElementById("afterCalculation");
const afterCalculationText = document.getElementById("afterCalculationText");
const donutChartCanvas = document.getElementById("donutChart");
afterCalculationText.style.visibility = afterCalculationForm.style.visibility = "hidden";
const conversionRatiosToYear = new Map([["Week", 52.1429], ["Month", 4.34524], ["Year", 1]]);
let allTaxes = [];
// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", resetTextboxes);
optionBox.addEventListener("change", selectedOption);

function takeHomePay() 
{
    let taxRate = 0, grossIncome = 0, federalTaxedIncome = 0, stateTaxedIncome = 0, ficaTaxedIncome = 0;
    let conversionOption = timeConverter.options[timeConverter.selectedIndex].text;
    beforeTaxRateOutput.textContent = beforeTaxRateOutput.textContent.substring(0, 29);
    federalTaxRateOutput.textContent = federalTaxRateOutput.textContent.substring(0, 17);
    stateTaxRateOutput.textContent = stateTaxRateOutput.textContent.substring(0, 15);
    takeHomePayOutput.textContent = takeHomePayOutput.textContent.substring(0, 24);
    ficaTaxRateOutput.textContent = ficaTaxRateOutput.textContent.substring(0, 15);
    let workHours = parseFloat(hoursInput.value);
    let salary = parseFloat(salaryInput.value);
    try {
        if ((isNaN(workHours) && conversionOption === "Hour") || isNaN(salary)) {
            throw "Please enter numbers in the textboxes!";
        } else if(salary <= 0 || (conversionOption === "Hour" && workHours <= 0)) {
            throw "Please enter positive numbers in the textboxes!";
        }
        resetTextboxes();
    } catch (e) {
        window.alert(e);
        return;
    }

    if (conversionOption === "Hour") {
        salary *= workHours;
        conversionOption = "Week";
    }

    salary *= conversionRatiosToYear.get(conversionOption);
    beforeTaxRateOutput.textContent += " " + Math.round(salary / 12) + "/month";
    setBracketMaximum(salary);
    federalTaxedIncome = getTaxRate(salary, "Federal");
    stateTaxedIncome = getTaxRate(salary, "State");
    ficaTaxedIncome = getFicaTaxRate(salary);
    federalTaxRateOutput.textContent += " " + (federalTaxedIncome / salary * 100).toFixed(2) + "%";
    stateTaxRateOutput.textContent += " " + (stateTaxedIncome / salary * 100).toFixed(2) + "%";
    ficaTaxRateOutput.textContent += " " + (ficaTaxedIncome / salary * 100).toFixed(2) + "%";
    salary -= federalTaxedIncome + stateTaxedIncome + ficaTaxedIncome;
    salary = salary.toFixed(2);
    takeHomePayOutput.textContent += " " + Math.round(salary / 12) + "/month";
    afterCalculationText.style.visibility = afterCalculationForm.style.visibility = "visible";
    allTaxes = [federalTaxedIncome, stateTaxedIncome, ficaTaxedIncome, salary];
    createDonutChart(allTaxes);
}

function resetTextboxes() {
    salaryInput.value = hoursInput.value = "";
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

//Doughnut chart:
let myChart = null
function createDonutChart(allTaxes) {
    if(myChart !== null) {
        myChart.destroy()
    }
    myChart = new Chart(donutChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Federal Tax', 'State Tax', 'FICA', 'Remaining Income'],
          datasets: [{
            data: allTaxes,
            backgroundColor: ['#FF0000','#00FF00','#0000FF','#000000'],
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
                    size: 50,
                    weight: 'bold',
                },
                colors: 'rgba(0, 0, 0, 1)',
            },
            plugins: {
                datalabels:
                {
                    formatter: function(value) {
                        return '$' + value;
                    }
                },
            }
        }
      });
      if(donutChartCanvas.style.backgroundColor === "white") {
        return;
      }
      donutChartCanvas.style.backgroundColor = "white";
      donutChartCanvas.style.border = "1px solid black";
}
