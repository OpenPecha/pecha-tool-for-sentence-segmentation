import { useRef, useEffect } from "react";
import { Ignore, Right, Undo, Wrong } from "./SVGS";
import classNames from "classnames";

interface ButtonProps {
  handleClick: () => void;
  type: "CONFIRM" | "REJECT" | "IGNORE" | "UNDO";
  disabled: boolean;
  title: string;
  shortCut: string;
}

function Button({ handleClick, type, disabled, title, shortCut }: ButtonProps) {
  let classbtn = `btn ${type.toLowerCase()}`;
  let innerValue: JSX.Element | null;
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === shortCut) {
        btnRef.current?.click();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortCut]);

  switch (type) {
    case "CONFIRM":
      innerValue = <Right />;
      break;
    case "REJECT":
      innerValue = <Wrong />;
      break;
    case "IGNORE":
      innerValue = <Ignore />;
      break;
    case "UNDO":
      innerValue = <Undo />;
      break;
    default:
      innerValue = null;
      break;
  }

  return (
    <button
      disabled={disabled}
      title={title}
      className={classNames(
        classbtn,
        "cursor-pointer border-none flex justify-center items-center"
      )}
      onClick={handleClick}
      ref={btnRef}
    >
      {innerValue}
    </button>
  );
}

export default Button;
