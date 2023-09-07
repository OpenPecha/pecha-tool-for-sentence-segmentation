import { useRef, useEffect } from "react";
import { Ignore, Right, Undo, Wrong } from "../assets/svgs";
interface ButtonProps {
  handleClick: () => void;
  value: string;
  disabled: boolean;
  title: string;
  shortCut: string;
  className?: string;
}

function Button({
  handleClick,
  value,
  disabled,
  title,
  shortCut,
  className,
}: ButtonProps) {
  let classbtn = "h-[100px] w-[100px]  cursor-pointer hover:opacity-80";
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
      classbtn += " bg-[--success-btn]";
      break;
    case "REJECT":
      innerValue = <Wrong />;
      classbtn += " bg-[--cancel-btn]";
      break;
    case "IGNORE":
      innerValue = <Ignore />;
      classbtn += " bg-[--normal-btn]";
      break;
    case "UNDO":
      innerValue = <Undo />;
      classbtn += " bg-[--normal-btn]";
      break;
  }
  return (
    <button
      disabled={disabled}
      title={title}
      className={className ? className : classbtn}
      onClick={handleClick}
      ref={btnRef}
    >
      {innerValue}
    </button>
  );
}
export default Button;
