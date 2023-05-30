const computeButton = document.getElementById("compute");
const resetButton = document.getElementById("reset");
const hoursInput = document.getElementById("hours");
const salaryInput = document.getElementById("salary");

// Events
computeButton.addEventListener("click", takeHomePay);
resetButton.addEventListener("click", testTwo);

function takeHomePay() {
    let hours = parseInt(hoursInput.value);
    let salary = parseInt(salaryInput.value);
    try
    {
        if(isNaN(hours))
        {
            throw "Please enter a number in the hours textbox!";
        }

        if(isNaN(salary))
        {
            throw "Please enter a number in the salary textbox!";
        }
        window.alert(hours * salary);
        hoursInput.value = "";
        salaryInput.value = "";
    } catch(e) {
        window.alert(e);
    }
}

function testTwo() {
    hoursInput.value = "";
    salaryInput.value = "";
}