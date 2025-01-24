// digital PCR plate
// for this example, we'll say our plate has only 3 rows with 5 wells per row

const wells = [
  { name: 'Row 1', values: [0.0, 15.0, 12.0, 12.0, 15.0] },
  { name: 'Row 2', values: [34.0, 30.0, 0.0, 34.0, 18.0] },
  { name: 'Row 3', values: [0.0, 9.0, 56.0, 5.0, 6.0] },
];

// intensity for a well that we consider a successful amplification or intensity
const threshold = 20.0;

// analyze the wells of the plate
function analyzeWellData(wells, threshold) {
  let totalValues = 0;
  let sumValues = 0;
  let countAboveThreshold = 0; let allValues = [];

  for (const well of wells) {
    for (const value of well.values) {
      totalValues++;
      sumValues += value;
      if (value > threshold) {
        countAboveThreshold++;
      }
      allValues.push(value);
    }
  }
  const average = sumValues / totalValues;
  const outliers = findOutliers(allValues); 

  return { average, countAboveThreshold, outliers };
}

// find outliers
function findOutliers(data) {
  const q1 = data.sort((a, b) => a - b)[Math.floor(data.length * 0.25)];
  const q3 = data.sort((a, b) => a - b)[Math.ceil(data.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - (1.5 * iqr); 
  const upperBound = q3 + (1.5 * iqr); 
  return data.filter(x => x < lowerBound || x > upperBound);
}

// let's call the function
const result = analyzeWellData(wells, threshold);

// finally, output the results
console.log("Average value:", result.average);
console.log("Count of values above threshold:", result.countAboveThreshold);
console.log("Outliers:", result.outliers); 
