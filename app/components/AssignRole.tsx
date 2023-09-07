import { User } from "@prisma/client";
import { useState } from "react";
import { Role } from "@prisma/client";
import Select from "react-tailwindcss-select";
import { useFetcher } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
function AssignRole({
  annotator,
  isAdmin,
}: {
  annotator: User;
  isAdmin: boolean;
}) {
  const [editRole, setEditRole] = useState(false);
  const fetcher = useFetcher();
  function openRoleEdit() {
    setEditRole(true);
  }
  let options: { value: Role; label: Role }[] = [
    { value: "ADMIN", label: "ADMIN" },
    { value: "REVIEWER", label: "REVIEWER" },
    { value: "ANNOTATOR", label: "ANNOTATOR" },
    { value: "USER", label: "USER" },
  ];
  let value = { value: annotator.role, label: annotator.role };
  function handleChange(data) {
    let role = data.value;
    if (!role) {
      data = "";
    }
    let i = confirm(
      "do you want " + annotator.nickname + " to be " + role + "?"
    );
    if (i) {
      fetcher.submit(
        {
          id: annotator.id,
          role,
          action: "change_role",
        },
        {
          method: "POST",
          action: "/api/user",
        }
      );
      setEditRole(false);
    }
  }

  if (editRole)
    return (
      <Select
        isMultiple={false}
        value={value}
        primaryColor="green"
        onChange={handleChange}
        options={options}
        isSearchable
        loading={fetcher.state !== "idle"}
      />
    );
  return (
    <div className="flex gap-2 items-center">
      <span className="font-light text-sm">{annotator.role}</span>
      {isAdmin && (
        <button onClick={openRoleEdit}>
          <FiEdit2 />
        </button>
      )}
    </div>
  );
}

export default AssignRole;
