import Link from "next/link";

const FullScreenViewModal = ({ open, onClose, children }) => {
  return (
    <div
      className={
        open
          ? "full_gift_image_preview_modal show align-items-center justify-content-center"
          : "full_gift_image_preview_modal"
      }
      style={{
        width: "calc(100vw - 245px)",
        top: "65px",
        left: "240px",
        zIndex: "999",
      }}
    >
      <div className="d-flex align-items-center">
        <Link
          href=""
          className="full_gift_image_preview_modal_button"
          onClick={onClose}
        >
          <img
            src="/images/close_ic.svg"
            alt="close/icon"
            width={25}
            height={25}
          />
        </Link>
      </div>
      {children}
    </div>
  );
};

export default FullScreenViewModal;
