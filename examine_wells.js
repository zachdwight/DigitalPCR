// digital PCR plate

// PART I - Analyze our collection of droplets as a plate

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

  return { average, countAboveThreshold, outliers, totalValues };
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

// PART II - Calculate Copy Number
// If we continue and assume a well above threshold is our positive droplet, we use poisson to estimate copy number
// this assumes a poisson distribution of target molecules across droplets


function calculateCopyNumber(positiveDroplets, totalDroplets, volumePerDroplet) {
  /**
   * Args:
   *   positiveDroplets: Number of droplets that tested positive for the target.
   *   totalDroplets: Total number of droplets analyzed.
   *   volumePerDroplet: Volume of each droplet in liters.
   * 
   * Returns:
   *   Estimated copy number per microliter.
   */

  // Calculate the fraction of positive droplets
  const p = positiveDroplets / totalDroplets;

  // Calculate the Poisson parameter (lambda)
  const lambda = -Math.log(1 - p);

  // Calculate the copy number per droplet
  const copiesPerDroplet = lambda;

  // Calculate the copy number per microliter
  const copiesPerMicroliter = copiesPerDroplet / (volumePerDroplet * 1e-6); 

  return copiesPerMicroliter;
}

// Example usage:
const positiveDroplets = result.countAboveThreshold; // result from analyze wells
const totalDroplets = result.totalValues; // result from analyze wells
const volumePerDroplet = 2e-15; // 2 picoliters

// call the function to calc copy number
const copyNumber = calculateCopyNumber(positiveDroplets, totalDroplets, volumePerDroplet);

// output the result
console.log("Estimated copy number per microliter:", copyNumber.toFixed(2)); 
