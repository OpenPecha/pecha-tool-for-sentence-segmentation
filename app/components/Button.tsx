import { useRef, useEffect } from "react";
interface ButtonProps {
  handleClick: () => void;
  value: string;
  disabled: boolean;
  title: string;
  shortCut: string;
}

function Button({
  handleClick,
  value,
  disabled,
  title,
  shortCut,
}: ButtonProps) {
  let classbtn = "btn";
  let innerValue: any = value;
  let btnRef = useRef(null);
  useEffect(() => {
    function handlekeyDown(e) {
      if (e.key === shortCut) {
        btnRef.current.click();
      }
    }
    document.addEventListener("keydown", handlekeyDown);
    return () => {
      document.removeEventListener("keydown", handlekeyDown);
    };
  }, []);
  switch (value) {
    case "CONFIRM":
      innerValue = <Right />;
      classbtn = "btn-right";
      break;
    case "REJECT":
      innerValue = <Wrong />;
      classbtn = "btn-wrong";
      break;
    case "IGNORE":
      innerValue = <Ignore />;
      classbtn = "btn-ignore";
      break;
    case "UNDO":
      innerValue = <Undo />;
      classbtn = "btn-undo";
      break;
  }
  return (
    <button
      style={{ border: "none", cursor: "pointer" }}
      disabled={disabled}
      title={title}
      className={classbtn + " " + "btn"}
      onClick={handleClick}
      ref={btnRef}
    >
      {innerValue}
    </button>
  );
}
export default Button;

function Right() {
  return (
    <svg aria-hidden="true" fill="white" viewBox="0 0 24 24" className="c01125">
      <path d="M9 16.172l10.594-10.594 1.406 1.406-12 12-5.578-5.578 1.406-1.406z"></path>
    </svg>
  );
}

function Wrong() {
  return (
    <svg aria-hidden="true" fill="white" viewBox="0 0 24 24" className="c01125">
      <path d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z"></path>
    </svg>
  );
}
function Ignore() {
  return (
    <svg aria-hidden="true" fill="white" viewBox="0 0 24 24" className="c01125">
      <path d="M12 20.016c4.406 0 8.016-3.609 8.016-8.016 0-1.828-0.609-3.563-1.688-4.922l-11.25 11.25c1.359 1.078 3.094 1.688 4.922 1.688zM3.984 12c0 1.828 0.609 3.563 1.688 4.922l11.25-11.25c-1.359-1.078-3.094-1.688-4.922-1.688-4.406 0-8.016 3.609-8.016 8.016zM12 2.016c5.531 0 9.984 4.453 9.984 9.984s-4.453 9.984-9.984 9.984-9.984-4.453-9.984-9.984 4.453-9.984 9.984-9.984z"></path>
    </svg>
  );
}
function Undo() {
  return (
    <svg aria-hidden="true" fill="white" viewBox="0 0 24 24" className="c01125">
      <path d="M11.016 9l1.406 1.406-3.609 3.609h9.188v-10.031h2.016v12h-11.203l3.609 3.609-1.406 1.406-6-6z"></path>
    </svg>
  );
}
