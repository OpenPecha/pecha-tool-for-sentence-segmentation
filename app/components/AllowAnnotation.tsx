import { useFetcher } from "@remix-run/react";
import { User } from "@prisma/client";

function AllowAnnotation({ annotator }: { annotator: User }) {
  const fetcher = useFetcher();

  function handleChangeAllow() {
    fetcher.submit(
      {
        id: annotator.id,
        allow: !annotator.allow_assign,
        action: "change_allow_assign",
      },
      {
        action: "/api/user",
        method: "POST",
      }
    );
  }

  return (
    <div>
      <input
        title="active/inactive"
        type="checkbox"
        className={`toggle toggle-success ${
          fetcher.state !== "idle" &&
          "cursor-not-allowed opacity-50 pointer-events-non"
        }`}
        checked={annotator?.allow_assign!}
        onChange={handleChangeAllow}
        aria-label="Toggle_role"
      />
    </div>
  );
}

export default AllowAnnotation;
