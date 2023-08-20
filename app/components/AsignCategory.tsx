import { User } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import MultiSelect from "./MultiSelect";
import { useRef } from "react";
interface AssignCategoryProps {
  user: User;
  editable?: boolean;
}

function AssignCategory({ user, editable }: AssignCategoryProps) {
  const { categories } = useLoaderData();
  let modalref = useRef();
  return (
    <>
      {user.categories.length > 0 && (
        <>
          {user.categories.map((c) => (
            <span className="badge bg-green-300" key={c}>
              {c}
            </span>
          ))}
        </>
      )}
      {editable && (
        <button onClick={() => modalref.current.showModal()} className="mx-2  ">
          <FiEdit2 size={10} />
        </button>
      )}

      <dialog ref={modalref} className="modal">
        <form method="dialog" className="modal-box h-[40vh]">
          <button className="bg-gray-400 btn-sm btn-circle  btn-ghost absolute right-2 top-2">
            ✕
          </button>
          <h3 className="font-bold text-lg">Select Categories</h3>
          <MultiSelect
            optionsData={categories}
            values={user.categories}
            user={user}
          />
        </form>
      </dialog>
    </>
  );
}

export default AssignCategory;
