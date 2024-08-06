import { gql, useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../layouts/Navbar";
import { Alert, Box, Dialog, Typography } from "@mui/material";
import Appbar from "../layouts/Appbar";
import NotificationIcon from "../../public/images/notificationIcon.svg";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
const MethodsDialog = dynamic(() => import("./paymentMethod/MethodsDialog"));
const ThanksPurchasingModal = dynamic(() =>
  import("./paymentMethod/ThanksPurchasingModal")
);

const GET_COIN_PRICES_QUERY = gql`
  query getCoinPrices {
    getCoinPrices {
      originalPrice
      discountedPrice
      currency
      coinsCount
      id
      isActive
    }
  }
`;

const GET_COIN_CATEGORY = gql`
  query coinsCategory {
    coinsCategory {
      id
      name
      minCoins
      maxCoins
      isActive
    }
  }
`;

// const CardBoxData = [
//   {
//     name: "silver",
//     icon: "silverCoins",
//   },
//   {
//     name: "gold",
//     icon: "goldCoins",
//   },
//   {
//     name: "platinum",
//     icon: "platinumCoins",
//   },
// ];

// const BuyCoinCardBox = ({ coinData }) => {
//   return (
//     <div className="col-lg-4 col-12 buy-coins-column">
//       <div className="transparent-black-background buy-coins-card">
//         <img src="/images/coinIcon.svg" alt='coinIcon' className="buy-coins-icon" />
//         <span className="buy-coin-headeing">Silver</span>
//         <div className="coins-card-items-container">
//           {coinData?.map((item, index) => (
//             <CoinBanner {...item} />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

const CoinBanner = ({
  id,
  coinsCount,
  discountedPrice,
  originalPrice,
  onClick,
  coinText = "Coins",
  actionText = "Buy",
}) => {
  return (
    <div className="coins-card-item" key={id}>
      <div className="coins-value">
        <span>{coinsCount}</span>
        <small>{coinText}</small>
      </div>
      <strike className="">${originalPrice}</strike>
      <div className="global-btn-3 price-btn">${discountedPrice}</div>
      <button className="global-btn-3 buy-btn" onClick={onClick}>
        {actionText}
      </button>
    </div>
  );
};

const BuyChatCoin = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  const [getCoinPriceData, { data, error, loading }] = useLazyQuery(
    GET_COIN_PRICES_QUERY
  );

  const [getCoinsCategory, { data: coinsCategory }] =
    useLazyQuery(GET_COIN_CATEGORY);

  useEffect(() => {
    getCoinPriceData();
    getCoinsCategory();
    setIsClient(true);
  }, []);

  const [alert, setAlert] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [thanksModal, setOpenThanksModal] = useState(false);
  let coinData = data?.getCoinPrices;
  const [purchaseCoins, setPurchaseCoins] = useState(0);

  const [open, setOpen] = useState(false);
  const router = useRouter();

  console.log(coinData, "Data");

  const handleOpen = (item) => {
    setOpen(true);
    setSelectedPackage(item);
  };

  const CardBoxData = coinsCategory?.coinsCategory?.map((coin) => ({
    ...coin,
    icon: `${coin.name.toLowerCase()}Coins`,
  }));

  const handleThanksPurchasingModal = (isShowmThanksModal) => {
    setOpen(false);
    setTimeout(() => {
      setOpenThanksModal(isShowmThanksModal);
      setPurchaseCoins(selectedPackage?.coinsCount || 0);
    }, 500);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {isClient && alert && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 1000,
            top: "50%",
            position: "fixed",
          }}
        >
          <Alert severity="success">
            {t("buy_chat_coins.alert_success_msg")}
          </Alert>
        </Box>
      )}
      {/* <Navbar /> */}
      <div className="my-profile-wrapper">
        <div className="header-control header-gold interests-header">
          <i
            onClick={() => router.back()}
            className="fa fa-angle-left "
            aria-hidden="true"
          ></i>
          <Typography
            sx={{
              margin: "auto",
              color: "#070707",
              fontSize: "22px",
              fontWeight: 600,
              fontFamily: "Open Sans",
            }}
          >
            {isClient && t("buy_chat_coins.buy_coins")}
          </Typography>
          <NotificationIcon />
          <div className="profile_avtar">
            <img
              alt="Avatar"
              src="/images/i69Avatar.png"
              style={{ height: "40px", width: "40px", borderRadius: "50%" }}
            />
          </div>
        </div>
        <div className="buy-container">
          <div className="m-0 p-0 buy-card-wrapper">
            {coinData?.length > 0 &&
              CardBoxData?.map((obj) => (
                // <BuyCoinCardBox {...item} coinData={coinData} />
                <div
                  className="col-lg-4 col-sm-12 col-12 buy-coins-column"
                  key={obj.name}
                >
                  <div className="transparent-black-background buy-coins-card">
                    <img
                      src={`/images/${obj.icon}.png`}
                      alt="coinsIcon"
                      className="buy-coins-icon"
                    />
                    <span className="buy-coin-heading">
                      {t(`buy_chat_coins.${obj.name.toLowerCase()}`)}
                    </span>

                    <div className="coins-card-items-container">
                      {coinData?.map((item, index) => {
                        if (
                          item.coinsCount >= obj.minCoins &&
                          item.coinsCount <= obj.maxCoins
                        ) {
                          return (
                            <CoinBanner
                              key={index}
                              {...item}
                              onClick={() => handleOpen(item)}
                              coinText={t("buy_chat_coins.coins")}
                              actionText={t("buy_chat_coins.buy")}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <Dialog open={open} onClose={handleClose}>
            <MethodsDialog
              setOpen={setOpen}
              coinPrice={selectedPackage?.discountedPrice}
              coinsCount={selectedPackage?.coinsCount}
              setMessage={setAlert}
              handleThanksPurchasingModal={handleThanksPurchasingModal}
            />
          </Dialog>
          {thanksModal && (
            <ThanksPurchasingModal
              close={() => setOpenThanksModal(false)}
              coins={purchaseCoins}
            />
          )}
          <div>
            <Appbar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyChatCoin;
