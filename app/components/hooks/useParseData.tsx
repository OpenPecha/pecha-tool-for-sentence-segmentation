import React from "react";
import Papa from "papaparse";
function useParseData({ data, fileName, startBatch }) {
  const [csvData, setCsvData] = React.useState([]);
  const convertToCSV = (data1) => {
    Papa.parse(data1, {
      complete: (result) => {
        const lines = result.data;
        const rows = [];
        let currentRow = [];
        let currentBatch = startBatch;
        lines.forEach((line, index) => {
          currentRow.push(line);

          if (currentRow.length === 10 || index === lines.length - 1) {
            // Map your schema fields to the lines in the currentRow
            const original_text = currentRow.join(" "); // Join 10 lines into one

            // Add other fields as needed
            const rowData = {
              original_text: original_text,
              version: fileName,
              batch: currentBatch,
            };

            rows.push(rowData);
            if (rows.length % 10 === 0 && rows.length !== 0) {
              currentBatch += 1;
            }

            currentRow = [];
          }
        });

        setCsvData(rows);
      },
    });
  };

  React.useEffect(() => {
    if (data && data !== "") {
      convertToCSV(data);
    }
  }, [data]);

  return csvData;
}

export default useParseData;
