import Link from "next/link";

const ViewModal = ({ children, onClose, open }) => {
  return (
    <div
      className={
        open
          ? "gift_image_preview_modal show align-items-center justify-content-center"
          : "gift_image_preview_modal"
      }
      style={{
        width: "70%",
        top: "31vh",
        left: "10%",
      }}
    >
      <div className="d-flex align-items-center">
        <Link
          href=""
          className="gift_image_preview_modal_button"
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

export default ViewModal;
