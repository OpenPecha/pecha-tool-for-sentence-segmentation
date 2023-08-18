import { Link } from "@remix-run/react";

interface HistoryItemProps {
  id: string;
  user: any;
  onClick: () => void;
  icon: JSX.Element;
  reviewer: boolean;
  disabled?: boolean;
}

export default function HistoryItem({
  id,
  user,
  onClick,
  icon,
  reviewer,
  disabled,
}: HistoryItemProps) {
  let split = id.split("_");
  let historyName = split[0] + "_" + split[1] + "_" + split[split.length - 1];
  if (id.startsWith("c_")) {
    id = id.replace("c_", "a_");
  }
  if (disabled)
    return (
      <div className="flex items-center justify-between">
        {historyName}
        <div className="flex">{icon} 😁</div>
      </div>
    );
  return (
    <Link
      to={`/${reviewer ? "reviewer" : ""}?session=${
        user.username
      }&history=${id}`}
      className="flex justify-between px-2"
      onClick={onClick}
    >
      {historyName} {icon}
    </Link>
  );
}
