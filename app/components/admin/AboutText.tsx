import { useFetcher, useLoaderData } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { BiSolidCloudDownload } from "react-icons/bi";
import { downloadJsonlFile } from "~/lib/downloadfile";
type Text_Props = {
  version: string;
  category: string;
};

function AboutText() {
  const { texts } = useLoaderData();
  return (
    <>
      <div className="collapse collapse-plus bg-base-200">
        <input type="radio" name="my-accordion-3" />
        <div className="collapse-title text-xl font-medium bg-gray-300">
          <h2>Category</h2>
        </div>
        <div className="collapse-content">
          {texts.map((text: Text_Props) => {
            return <Text_Category text={text} key={text.version} />;
          })}
        </div>
      </div>
      <div className="collapse collapse-plus bg-base-200 mt-3">
        <input type="radio" name="my-accordion-3" />
        <div className="collapse-title text-xl font-medium bg-gray-300">
          <h2>Downloads</h2>
        </div>
        <div className="collapse-content">
          {texts.map((text: Text_Props) => {
            return <DownloadText text={text} key={text.version} />;
          })}
        </div>
      </div>
    </>
  );
}

function Text_Category({ text }: { text: Text_Props }) {
  const [hasChanges, setHasChanges] = React.useState(false);
  const [value, setValue] = React.useState<null | string>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useLoaderData();
  const isAdmin = user?.role === "ADMIN";
  const fetcher = useFetcher();
  function handleSubmit(e) {
    e.preventDefault();
    if (!isAdmin) return null;
    let category = inputRef.current?.value;
    fetcher.submit(
      {
        _action: "change_category",
        version: text.version,
        category: category!,
      },
      {
        method: "PATCH",
        action: "/api/text",
      }
    );
    setHasChanges(false);
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="text-center flex w-full px-2 justify-between mt-2"
    >
      <h4 className="text-lg font-bold">{text.version}</h4>
      <input hidden name="_action" readOnly value="change_category"></input>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          name="category"
          placeholder="Type here"
          className="input input-bordered input-primary w-full max-w-xs"
          value={value ?? text.category}
          onChange={(e) => {
            setHasChanges(e.target.value !== text.category);
            setValue(e.target.value);
          }}
        />
        {hasChanges && (
          <button
            onClick={handleSubmit}
            className="cursor-pointer"
            disabled={!isAdmin}
          >
            Save
          </button>
        )}
      </div>
    </form>
  );
}

function DownloadText({ text }: { text: Text_Props }) {
  let fetcher = useFetcher();
  function handleDownload() {
    fetcher.load(`/api/text/${text.version}`);
  }
  useEffect(() => {
    if (fetcher.data) {
      downloadJsonlFile(fetcher.data, text.version);
    }
  }, [fetcher.data]);
  return (
    <div className="text-center flex w-full px-2 justify-between mt-2">
      <h4 className="text-lg font-bold">{text.version}</h4>
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex gap-2 items-center cursor-pointer hover:bg-green-300 px-2 rounded"
        >
          <BiSolidCloudDownload />
          Download
        </button>
      </div>
    </div>
  );
}

export default AboutText;
