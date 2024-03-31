import { useFetcher, useOutletContext } from "@remix-run/react";
import Select from "react-tailwindcss-select";
import { User } from "@prisma/client";
import { AiFillDelete } from "react-icons/ai/index.js";
interface Option {
  value: string;
  label: string;
}

function AssignReviewer({ user }: { user: any }) {
  let { reviewers } = useOutletContext();

  let options: Option[] = reviewers.map((c: User) => ({
    value: c.username,
    label: c.username,
  }));

  let fetcher = useFetcher();
  function handleChange(data: any) {
    let reviewer = data.value;
    if (!reviewer) {
      data = "";
    }
    let i = confirm(
      "do you want " +
        reviewer +
        " to be the reviewer of " +
        user.nickname +
        "?"
    );
    if (i) {
      fetcher.submit(
        {
          id: user.id,
          reviewer,
          action: "change_reviewer",
        },
        {
          method: "POST",
          action: "/api/user",
        }
      );
    }
  }
  let value = {
    value: user.reviewer?.username,
    label: user.reviewer?.username,
  };
  function handleDelete() {
    let i = confirm(
      "do you want to remove " + user.reviewer?.username + " as reviewer?"
    );
    if (i) {
      fetcher.submit(
        {
          id: user.id,
          reviewer: "",
          action: "change_reviewer",
        },
        {
          method: "POST",
          action: "/api/user",
        }
      );
    }
  }
  return (
    <div className="flex gap-2 w-[50%]">
      <Select
        isMultiple={false}
        value={value}
        primaryColor="green"
        onChange={handleChange}
        options={options}
        isSearchable
        loading={fetcher.state !== "idle"}
      />
      <div className="flex items-center cursor-pointer" onClick={handleDelete}>
        <AiFillDelete />
      </div>
    </div>
  );
}

export default AssignReviewer;
