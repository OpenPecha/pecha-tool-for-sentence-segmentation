import Select from "react-select";

export default function MultiSelect({ values, handleChange, defaults }) {
  let options = values.map((c) => ({ value: c, label: c }));
  return (
    <Select
      isMulti
      defaultValue={defaults.map((c) => ({ value: c, label: c }))}
      name="colors"
      options={options}
      className="w-full"
      classNamePrefix="select"
      onChange={handleChange}
    />
  );
}
