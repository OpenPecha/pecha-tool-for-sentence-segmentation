import { User } from "@prisma/client";
import { useFetcher, useLoaderData } from "@remix-run/react";
import Select from "react-tailwindcss-select";
interface AssignCategoryProps {
  user: User;
}

function AssignCategory({ user }: AssignCategoryProps) {
  const { categories } = useLoaderData();
  let fetcher = useFetcher();
  let id = user.id;
  function handleChange(data: any) {
    let categories = data?.map((c) => c.value);
    let category = data?.length > 0 || data ? JSON.stringify(categories) : "[]";
    fetcher.submit(
      {
        id,
        category,
        action: "change_categories",
      },
      {
        method: "POST",
        action: "/api/user",
      }
    );
  }
  return (
    <div className="w-[50%] flex gap-2">
      <Select
        isSearchable
        primaryColor="green"
        isMultiple
        onChange={handleChange}
        value={user?.categories?.map((c) => ({ value: c, label: c }))}
        options={categories.map((c) => ({ value: c, label: c }))}
      />
    </div>
  );
}

export default AssignCategory;
