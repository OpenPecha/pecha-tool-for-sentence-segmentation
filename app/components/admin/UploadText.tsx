import { useFetcher, useLoaderData } from "@remix-run/react";
import React from "react";
import Papa from "papaparse";

type uploaddata = { batch: number; original_text: string; version: string };

function UploadText() {
  const [csvData, setCsvData] = React.useState<uploaddata[]>([]);
  const [fileNames, setFileNames] = React.useState<string[]>([]);
  const dataUpload = useFetcher();
  const { lastbatch } = useLoaderData();
  let currentBatch = parseInt(lastbatch) + 1;

  const convertToCSV = (filename, data) => {
    Papa.parse(data, {
      complete: (result) => {
        const lines = result.data;
        const rows = [];
        let currentRow = [];
        lines.forEach((line, index) => {
          currentRow.push(line);
          if (currentRow.length === 6 || index === lines.length - 1) {
            // Adjusted from 10 to 6
            // Map your schema fields to the lines in the currentRow
            const original_text = currentRow.join("\n"); // Join 6 lines into one

            // Add other fields as needed
            const rowData = {
              original_text: original_text,
              version: filename,
              batch: currentBatch,
            };

            rows.push(rowData);
            if (rows.length % 10 === 0 && rows.length !== 0) {
              currentBatch += 1;
            }

            currentRow = [];
          }
        });
        setCsvData((prev) => [...prev, ...rows]);
        setFileNames((prev) => [...prev, filename]);
        currentBatch++;
      },
    });
  };

  function reset() {
    setCsvData([]);
    setFileNames([]);
  }

  const handleFileInputChange = (e) => {
    reset();
    let files = e.target.files;
    if (files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = e.target.files[i];

      if (file) {
        let filename = file.name;
        if (filename.includes(".txt")) {
          filename = filename.replace(".txt", "");
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          convertToCSV(filename, event.target?.result);
        };

        reader.readAsText(file);
      }
    }
  };

  const handleUpload = () => {
    if (csvData?.length < 1) return null;
    const value = JSON.stringify(csvData);
    const name = JSON.stringify(fileNames);
    try {
      dataUpload.submit(
        {
          name,
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
      reset();
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
        multiple
        className="file-input file-input-bordered w-full max-w-xs"
      />
      <button
        onClick={handleUpload}
        className="bg-green-300 dark:bg-green-600 dark:text-white btn-sm rounded-md min-h-0"
      >
        {dataUpload.state !== "idle" ? <div>uploading</div> : <>upload</>}
      </button>
    </div>
  );
}

export default UploadText;
