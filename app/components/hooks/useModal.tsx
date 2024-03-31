import React, { useState, useRef } from "react";

function useModal() {
  let [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(true);
  };

  const Toggle_Modal = ({ children, ...props }) => (
    <button onClick={openModal} {...props}>
      {children}
    </button>
  );
  function changeOpen() {
    setIsOpen(!isOpen);
  }
  const Modal = ({ children }) => (
    <>
      {isOpen && (
        <dialog
          open={isOpen}
          className="modal z-20 absolute"
          onClose={() => setIsOpen(false)}
        >
          <div className="modal-box w-11/12 max-w-5xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            {children}
          </div>
          <div className="modal-backdrop backdrop-blur-sm">
            <button type="button" onClick={() => setIsOpen(false)}>
              close
            </button>
          </div>
        </dialog>
      )}
    </>
  );

  return { Toggle_Modal, Modal, changeOpen };
}

export default useModal;
