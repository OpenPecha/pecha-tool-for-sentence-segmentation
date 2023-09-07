export function groupByBatch(data: any[]) {
  // Initialize an object to store the grouped data
  const groupedData = {};

  // Iterate through the data and group by the "batch" attribute
  data.forEach((item) => {
    const batch = item.batch;

    // If the batch doesn't exist in the groupedData object, create an empty array for it
    if (!groupedData[batch]) {
      groupedData[batch] = [];
    }

    // Push the item into the corresponding batch array
    groupedData[batch].push(item);
  });
  return groupedData;
}
