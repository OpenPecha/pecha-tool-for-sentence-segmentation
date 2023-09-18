import { useFetcher, useLoaderData } from "@remix-run/react";
import React from "react";
import Papa from "papaparse";

function UploadText() {
  const [data, setData] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [csvData, setCsvData] = React.useState([]);

  const dataUpload = useFetcher();
  const { lastbatch } = useLoaderData();
  const startBatch = parseInt(lastbatch) + 1;
  const convertToCSV = () => {
    Papa.parse(data, {
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
    convertToCSV();
  }, [data]);
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      let filename = file.name;
      if (filename.includes(".txt")) {
        filename = filename.replace(".txt", "");
      }
      setFileName(filename);
      const reader = new FileReader();
      reader.onload = (event) => {
        setData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = () => {
    if (csvData?.length < 1) return null;
    const value = JSON.stringify(csvData);
    try {
      dataUpload.submit(
        {
          name: fileName,
          data: value,
        },
        {
          method: "POST",
          action: "/api/upload",
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setData("");
      setFileName("");
    }
  };
  return (
    <div className="float-right mb-2 flex gap-3 items-center">
      {dataUpload.data?.error && (
        <div className="text-red-600">{dataUpload.data.error}</div>
      )}
      <input
        type="file"
        accept=".txt"
        onChange={handleFileInputChange}
        className="file-input file-input-bordered w-full max-w-xs"
      />
      <button
        onClick={handleUpload}
        className=" bg-green-300 dark:bg-green-600 dark:text-white btn-sm rounded-md min-h-0"
      >
        {dataUpload.state !== "idle" ? <div>uploading</div> : <>upload</>}
      </button>{" "}
    </div>
  );
}

export default UploadText;
