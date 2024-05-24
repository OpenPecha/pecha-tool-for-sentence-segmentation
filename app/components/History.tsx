import { Link, useLoaderData } from "@remix-run/react";
interface HistoryItemProps {
  id: number;
  user: any;
  onClick: () => void;
  icon: JSX.Element;
  disabled?: boolean;
  currentId: number;
}
interface AdminHistoryItemProps {
  id: number;
  onClick: () => void;
  icon: JSX.Element;
  reviewed: boolean;
  selectedId: number;
}
function HistoryItem({
  id,
  user,
  onClick,
  icon,
  disabled,
  currentId,
}: HistoryItemProps) {
  const { history } = useLoaderData();
  if (disabled)
    return (
      <div className="px-2 text-white flex gap-3 cursor-pointer hover:border-2 border-purple-800">
        {id} {icon}
      </div>
    );
  return (
    <Link
      to={`/?session=${user.username}&history=${id}`}
      className={`px-2 flex gap-3 items-center ${
        history == id ? "bg-gray-700" : ""
      }`}
      onClick={onClick}
    >
      {id} {icon}
    </Link>
  );
}

function AdminHistoryItem({
  id,
  onClick,
  icon,
  reviewed,
  selectedId,
}: AdminHistoryItemProps) {
  return (
    <div
      className="text-white flex gap-3 cursor-pointer hover:border-2 border-purple-800"
      style={{
        background: selectedId == id ? "rgba(1,1,1,0.4)" : "",
      }}
      onClick={onClick}
    >
      {id}
      {reviewed ? icon : null}
    </div>
  );
}

function DemoHistoryItem({
  id,
  user,
  onClick,
  icon,
  disabled,
}: HistoryItemProps) {
  if (disabled)
    return (
      <div className="text-white flex gap-3 cursor-pointer hover:border-2 border-purple-800">
        {id} {icon}
      </div>
    );
  return (
    <div className="history-item flex gap-3 items-center" onClick={onClick}>
      {id} {icon}
    </div>
  );
}

export { HistoryItem, AdminHistoryItem, DemoHistoryItem };
