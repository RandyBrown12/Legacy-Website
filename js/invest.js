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
const addDebtButton = document.getElementById("addDebt");
const debtInfoList = document.getElementById("debtInfo");
const principalInput = document.getElementById("principal");
const interestInput = document.getElementById("interest");
const mMPInput = document.getElementById("mMP");
const testButton = document.getElementById("test");
const debtBulletPointsList = document.getElementById("debtInfo");
/* let debtBulletPointsList = debtInfoList.getElementsByTagName("li"); */

const conversionRatiosToYear = new Map([["Week", 52.1429], ["Biweek", 26.07145], ["Semimonth", 24], ["Month", 12], ["Year", 1]]);
const debtsHashMap = new Map([[0, null],[1, null],[2, null],[3, null],[4, null]]);
const deletionOrder = [];
let debtCount = 0;
// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", reset);
advancedFormButton.addEventListener("click", function() { addForm(advancedForm) });
optionBox.addEventListener("change", selectedOption);
isDebtCalculatorForm.addEventListener("change", function() { addForm(debtCalculatorForm) });
addDebtButton.addEventListener("click", addDebtToList);
testButton.addEventListener("click", testItems);

function addForm(form) 
{
    if(form.style.display === "block") 
    {
        form.style.display = "none";
        return;
    }
    form.style.display = "block";
}

let count = 0;
function addDebtToList() {
    let principal = parseFloat(principalInput.value), interest = parseFloat(interestInput.value), mmp = parseFloat(mMPInput.value);
    try {
        if(isNaN(principal) || isNaN(interest) || isNaN(mmp))
        {
            throw "Debt Calculator does not have correct format!";
        }
    } catch (exception) {
        window.alert(exception)
        return;
    }
    
    if(debtBulletPointsList.childNodes.length <= 5) 
    {
        count = debtBulletPointsList.childNodes.length - 1;
        let selectNum = 0;
        if(deletionOrder.length >= 1 || deletionOrder.length == 5) {
            selectNum = deletionOrder[0];
            deletionOrder.shift();
        } else {
            selectNum = count;
        }

        let listElement = document.createElement("li");
        listElement.textContent = `Principal: ${principal} Interest: ${interest} MMP: ${mmp}`;
        listElement.addEventListener('click', function () {
            window.alert('Clicked on: ' + listElement.innerText);
            debtsHashMap.set(selectNum, null);
            deletionOrder.push(selectNum);
            listElement.parentNode.removeChild(listElement);
            listElement = null;
        });
        debtBulletPointsList.append(listElement);
        debtsHashMap.set(selectNum, [principal, interest, mmp]);
    } else {
        window.alert("Max Debts is 5!");
        return;
    }
}

function testItems() 
{
    let sorted = Array.from(debtsHashMap);
    for(let i = sorted.length - 1; i >= 0; i--)
    {
        if(sorted[i][1] === null) {
            sorted.splice(i, 1);
        }
    }
    sorted.sort(function(a, b) {return a[1][2] - b[1][2];});
    console.log("After Sort: ");
    for(const [key, valueCheck] of sorted)
    {
        if(valueCheck != null) {
            let item1 = valueCheck[0], item2 = valueCheck[1], item3 = valueCheck[2];
            console.log(`Key: ${key} Principal: ${item1} Interest: ${item2} MMP: ${item3}`);
        }
    }
}

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

    } catch (exception) {
        window.alert(exception);
        return;
    }

    if (salaryTimeOption === "Hour") {
        incomeBeforeTax *= workHours;
        salaryTimeOption = "Week";
    }
    
    incomeBeforeTax *= conversionRatiosToYear.get(salaryTimeOption);
    setBracketMaximum(incomeBeforeTax);

    federalTaxedIncome = getTaxRate(incomeBeforeTax, "Federal");
    stateTaxedIncome = getTaxRate(incomeBeforeTax, "State");
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
