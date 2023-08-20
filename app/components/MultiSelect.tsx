import { useFetcher } from "@remix-run/react";
import Select from "react-tailwindcss-select";
interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  optionsData: string[];
  values: string[];
  user: { id: string };
}

export default function MultiSelect({
  optionsData,
  values,
  user,
}: MultiSelectProps) {
  let options: Option[] = optionsData.map((c) => ({ value: c, label: c }));
  let fetcher = useFetcher();
  function handleChange(category: any) {
    let data = category?.map((c) => c.value);
    if (!category) {
      data = [];
    }
    fetcher.submit(
      {
        id: user.id,
        categories: JSON.stringify(data),
        action: "change_categories",
      },
      {
        method: "POST",
        action: "/api/user",
      }
    );
  }

  return (
    <div className="max-w-xs">
      <Select
        isMultiple={true}
        value={values.map((c) => ({ value: c, label: c })) || []}
        options={options}
        primaryColor="green"
        onChange={handleChange}
        isSearchable
        loading={fetcher.state !== "idle"}
      />
    </div>
  );
}
