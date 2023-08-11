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
const principalInput = document.getElementById("principal");
const interestInput = document.getElementById("interest");
const mMPInput = document.getElementById("mMP");
const testButton = document.getElementById("test");
const debtBulletPointsList = document.getElementById("debtInfo");
const lineChartCanvas = document.getElementById("lineChart");

const conversionRatiosToYear = new Map([["Week", 52.1429], ["Biweek", 26.07145], ["Semimonth", 24], ["Month", 12], ["Year", 1]]);
const debtsHashMap = new Map([[0, null],[1, null],[2, null],[3, null],[4, null]]);
const deletionOrder = [];
const debtCount = 5;
let count = 0;
let lineChart = null, donutChart = null;
// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", reset);
advancedFormButton.addEventListener("click", function() { addForm(advancedForm) });
optionBox.addEventListener("change", selectedOption);
isDebtCalculatorForm.addEventListener("change", function() { addForm(debtCalculatorForm) });
addDebtButton.addEventListener("click", function() { addDebtToList(count) });
testButton.addEventListener("click", function() { createLineChart(100) });

function addForm(form) 
{
    if(form.style.display === "block") 
    {
        form.style.display = "none";
        return;
    }
    form.style.display = "block";
}

function addDebtToList(count) {
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
    
    if(debtBulletPointsList.childNodes.length <= debtCount) 
    {
        count = debtBulletPointsList.childNodes.length - 1;
        let selectNum = 0;
        if(deletionOrder.length >= 1 || deletionOrder.length == debtCount) {
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

const checkIfExists = (chart) => {
    if(chart !== null) {
        chart.destroy();
    }
}

function createDonutChart(allTaxes, incomeBeforeTax) {
    checkIfExists(donutChart);
    donutChart = new Chart(donutChartCanvas, {
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

function createLineChart(givenIncome) 
{
    const copyMap = JSON.parse(JSON.stringify(Array.from(debtsHashMap)));

    checkIfExists(lineChart);
    let currentDebts = Array.from(copyMap);
    for(var i = currentDebts.length - 1; i >= 0; i--)
    {
        if(currentDebts[i][1] === null) {
            currentDebts.splice(i, 1);
        }
    }

    //[Key, [Princ,Interest,MMP]]
    currentDebts.sort(function(a, b) {return a[1][2] - b[1][2];});

    // Perform calculations
    givenIncome /= 12;
    givenIncome = givenIncome.toFixed(2);
    let date = new Date();
    const dateAndDebtsSumList = [[],[]];
    let getDebtArray = [];
    let sum = 0;
    let debtDataPoint = 0;
    while(currentDebts.length !== 0 && dateAndDebtsSumList[1].length < 100)
    {
        sum = 0;
        for(var i = 0; i < currentDebts.length; i++) 
        {
            getDebtArray = currentDebts[i][1];
            sum += getDebtArray[0];
        }

        sum = Number(sum.toFixed(2));
        //[ [0,[1,1,1]], [1,[3,3,3]], ...]
        currentDebts[0][1][0] -= givenIncome;
        currentDebts[0][1][0] = Number(currentDebts[0][1][0].toFixed(2));
        if(currentDebts[0][1][0] <= 0)
        {
            if(currentDebts.length >= 2)
            {
                currentDebts[1][1][0] -= Math.abs(currentDebts[0][1][0]);
                currentDebts[1][1][0] = Number(currentDebts[1][1][0].toFixed(2));
            }
            currentDebts.shift();
        }

        dateAndDebtsSumList[0].push(new Intl.DateTimeFormat("en-US",{year: 'numeric', month:"long"}).format(date));
        date.setMonth(date.getMonth() + 1);
        dateAndDebtsSumList[1].push(sum);

        for(var i = 0; i < currentDebts.length; i++) 
        {
            getDebtArray = currentDebts[i][1];
            getDebtArray[0] = getDebtArray[0] * getDebtArray[1];
            getDebtArray[0] = Number(getDebtArray[0].toFixed(2));
        }

        //Last point
        if(currentDebts.length === 0) 
        {
            dateAndDebtsSumList[0].push(new Intl.DateTimeFormat("en-US",{year: 'numeric', month:"long"}).format(date));
            dateAndDebtsSumList[1].push(0.00);
        } 
    }

    if(dateAndDebtsSumList[1].length >= 100) {
        window.alert("Can't pay off debts!");
        return;
    }

    lineChart = new Chart(lineChartCanvas, {
        type: 'line',
        data: {
            labels: dateAndDebtsSumList[0],
            datasets: [{
                label: 'Test Data',
                data: dateAndDebtsSumList[1],
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 1,
                fill: false
                }]
            },
        })
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
    if(count == 0) {
        window.alert("No Debts are listed!");
        return;
    }
    createLineChart(incomeAfterTax);
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

function reset() {
    outputCalculatorForm.value = salaryInput.value = hoursInput.value = "";
    advancedForm.style.display = afterCalculationInfo.style.display = afterCalculationForm.style.display = "none";
    checkIfExists(donutChart);
    checkIfExists(lineChart);
}