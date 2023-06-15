const federalYearlyRates = [[0.10, 10275], [0.12, 41775], [0.22, 89075], [0.24, 170050], [0.32, 215950], [0.35, 539900], [0.37, Infinity]];
const stateYearlyRates = [[0, 0, 6350], [0, 0.0025, 7350], [2.50, 0.0075, 8850], [13.75, 0.0175, 10100], [35.63, 0.0275, 11250], [67.25, 0.0375, 13550], [153.50, 0.0475, Infinity]];
const ficaMaximumRate = 160200;
const medicareMaxiumRate = 200000;
const ficaTaxRate = 0.072;
const medicareTaxRate = [0.0145, 0.0235];

export const setBracketMaximum = (salary) => federalYearlyRates[6][1] = stateYearlyRates[6][2] = salary;
//Margin Tax Rate: $10,275 goes to 10%, $31500 goes to 12%, until it reaches a bracket.
//1st additional money, 2nd number rate, 3rd number maxAllotedIncome

//Note: First input is 40 hours per week.
//Note 2: If in hours, convert hours to weeks otherwise convert [weeks,months,years] to years.
//Test: $7.25 hr with 40 hrs/week should be 290 per week.
//Test2: $290 week with 40 hrs/week should be 1256 per month.
export function getFederalTaxRate(grossIncome) 
{
    let prevMaxIncome = 0;
    let taxes = 0;
    for(const [marginalTaxRate, maxAllotedIncome] of federalYearlyRates)
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
    }
    return parseFloat(taxes.toFixed(2));
}

export function getStateTaxRate(grossIncome) 
{
    let prevMaxIncome = 0;
    let taxes = 0;
    for(const [additionalIncome, marginalTaxRate, maxAllotedIncome] of stateYearlyRates)
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

export function getFicaTaxRate(grossIncome) 
{
    let totalTaxIncome = 0;
    totalTaxIncome += (grossIncome > ficaMaximumRate ? ficaMaximumRate : grossIncome) * ficaTaxRate;
    totalTaxIncome += (grossIncome > medicareMaxiumRate ? medicareTaxRate[1] : medicareTaxRate[0]) * grossIncome;
    return parseFloat(totalTaxIncome.toFixed(2));
}