import Link from "next/link";
import { CircledCrossIcon } from "../Home2";
import {
  CustomButton,
  CloseIconStyles,
  InnerContainer,
  ModalContainer,
  Text,
} from "./SubscribeModal";
import { useTranslation } from "react-i18next";

const BalanceModal = ({ coins, close }) => {
  const { t } = useTranslation();
  return (
    <ModalContainer>
      <InnerContainer sx={{ height: "357px" }}>
        <CircledCrossIcon
          sx={CloseIconStyles}
          onClick={() => {
            close();
            console.log("User Balance Closed");
          }}
        />

        <img
          src="/images/coins-2.png"
          alt="icon"
          style={{ marginTop: "16px" }}
        />

        <Text sx={{ fontWeight: 300, mt: 3 }}>
          {t("payment_dialog.user_balance")}
        </Text>

        <Text sx={{ fontWeight: 700, fontSize: "24px", mt: 1 }}>{coins}</Text>

        <Text style={{ fontSize: "16px", fontWeight: 700 }}>
          {t("buy_chat_coins.coins")}
        </Text>

        <Link href="buy-chat-coin" legacyBehavior>
          <CustomButton onClick={close}>
            {t("payment_dialog.upgrade_balance")}
          </CustomButton>
        </Link>
      </InnerContainer>
    </ModalContainer>
  );
};

export default BalanceModal;
