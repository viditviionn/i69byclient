import { Alert, Box, Modal, Typography } from "@mui/material";
import { gql, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { Avatar } from "../views/Home2";
import HomeIcon from "../../public/images/homeIcon.svg";
import ChatIcon from "../../public/images/chatIcon.svg";
import SearchIcon from "../../public/images/magnifier.svg";
import SettingIcon from "../../public/images/settingIcon.svg";
import NotificationIcon from "../../public/images/notificationIcon.svg";
import SubscriptionIcon from "../../public/images/subscriptionIcon.svg";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useFacebookSdk from "../hooks/useFacebookSdk";
import axiosConfig from "../common/axiosConfig";
import { ModalClose } from "@mui/joy";
import { Img } from "react-image";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
const Policy = dynamic(() => import("../views/Policy"));
const Terms = dynamic(() => import("../views/Terms"));
const ContactUs = dynamic(() => import("../views/ContactUs"));
const Faq = dynamic(() => import("../views/FAQ"));
const DeleteProfileModal = dynamic(() =>
  import("../views/home/DeleteProfileModal")
);

const USER_QUERY = gql`
  query user($id: String!) {
    user(id: $id) {
      username
      email
      avatarPhotos {
        url
      }
    }
  }
`;

const ROOMS_QUERY = gql`
  query rooms {
    rooms {
      edges {
        node {
          unread
        }
      }
    }
  }
`;

const Navbar = ({
  customTab,
  setOpenSubscriptionModal,
  userStoryMomentList,
  menuIcon,
  className,
  showIconOnly = false,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [token, setToken] = useState(null);
  const [settingMenu, setSettingMenu] = useState(false);
  const [activePage, setActivePage] = useState("search");
  const [activeTab, setActiveTab] = useState("search");
  const [unreadCount, setunreadCount] = useState(0);
  const { asPath } = router;
  // let unreadCount = 0;
  const audioPlayer = useRef(null);
  const isSdkLoaded = useFacebookSdk();
  const [permissionDeclined, setPermissionDeclined] = useState(false);
  const [facebookToken, setFacebookToken] = useState();
  const [userId, setUserId] = useState();
  const [isShownUserDeleteConfirmation, setShownUserDeleteConfirmation] =
    useState(false);
  const [isShownSuccessDeleteMsgAlert, setShownSuccessDeleteMsgAlert] =
    useState(false);
  const [updatedCustomTab, setUpdatedCustomTab] = useState();

  useEffect(() => {
    if (customTab) {
      setUpdatedCustomTab(customTab);
    }
  }, [customTab]);

  const settingOptions = [
    {
      url: "",
      label: "Delete",
      handleOnClick: () => setShownUserDeleteConfirmation(true),
    },
    { url: "policy", label: "Policy" },
    { url: "terms", label: "Terms" },
    { url: "faq", label: "Faq" },
    { url: "contactUs", label: "Contact Us" },
  ];

  const [open, setOpen] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState("");

  const settingsItems = {
    Policy: <Policy />,
    Terms: <Terms />,
    Faq: <Faq />,
    "Contact Us": <ContactUs />,
  };

  const [getUserData, { data, loading: userLoading, refetch }] =
    useLazyQuery(USER_QUERY);

  const [getRoomData, { data: roomData, loading, refetch: refetchData }] =
    useLazyQuery(ROOMS_QUERY);

  useEffect(() => {
    if (userId) {
      getUserData({
        variables: {
          id: userId,
        },
      });
    }
  }, [userId]);

  useEffect(() => {
    getRoomData();
  }, [typeof loading]);

  useEffect(() => {
    // Retrieve userId from localStorage on component mount
    const id = localStorage.getItem("userId");
    const facebookTokenValue = localStorage.getItem("facebook-token");
    setUserId(id || "");
    setFacebookToken(facebookTokenValue || "");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tok = localStorage.getItem("token");
      setToken(tok);
    }
  }, [token]);

  useEffect(() => {
    if (updatedCustomTab?.active) {
      setActivePage(updatedCustomTab?.name);
    } else {
      const activeRoute = asPath.substring(asPath.lastIndexOf("/") + 1);
      setActivePage(activeRoute);
    }
  }, [updatedCustomTab]);

  // const fetchData = () => {
  //   refetch();
  //   refetchData();
  //   if (roomData && !unreadCount) {
  //     roomData?.rooms?.edges
  //       ?.filter((item) => parseInt(item?.node?.unread) > 0)
  //       .map(
  //         (item, index) => (
  //           (setunreadCount(prev => prev + 1)), audioPlayer.current.play()
  //         )
  //       );
  //   }
  // };

  //test
  useEffect(() => {
    if (!userId) {
      console.log("first time");
      // Retrieve userId from localStorage on component mount only
      const id = localStorage.getItem("userId");
      setUserId(id || "");
    }

    // this one called every three second
    // const id = setInterval(fetchData, 3000);
    // return () => clearInterval(id);
    // fetchData();
  }, [data, loading, roomData, userLoading]);

  useEffect(() => {
    if (roomData) {
      setunreadCount(
        roomData?.rooms?.edges?.filter(
          (item) => parseInt(item?.node?.unread) > 0
        )?.length
      );
      roomData?.rooms?.edges
        ?.filter((item) => parseInt(item?.node?.unread) > 0)
        .map((item, index) => audioPlayer.current.play());
    }
  }, [roomData]);

  // console.log(unreadCount);
  const handleLogout = async () => {
    try {
      const response = await axiosConfig.post(
        "api/auth/logout/",
        {},
        {
          headers: {
            authorization: `Token ${token}`,
          },
        }
      );
      if (response && response.status === 200) {
        localStorage.clear();
        router.push("/landing");
      }
    } catch (error) {
      localStorage.clear();
      console.log("error", error);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSettings = () => {
    setSettingMenu(!settingMenu);
    console.log(settingMenu, "setting menu");
  };

  const handleCustomTab = (event) => {
    event.preventDefault();
    setActivePage("shareMoment");
    updatedCustomTab?.callback();
  };

  const handleResponse = (response) => {
    if (response.authResponse) {
      // User is logged in
      window.FB.api("/me/permissions", (permissionsResponse) => {
        const grantedPermissions = permissionsResponse?.data?.map(
          (permission) => permission.permission
        );
        if (
          grantedPermissions.includes("publish_to_groups") &&
          grantedPermissions.includes("publish_pages")
        ) {
          console.log("Write permissions granted");
          setPermissionDeclined(false); // Reset the declined state
        } else {
          console.log("Write permissions not granted");
          setPermissionDeclined(true); // Set the declined state
        }
      });
    } else {
      console.log("User cancelled login or did not fully authorize.");
      setPermissionDeclined(true); // Set the declined state
    }
  };

  const requestWritePermission = () => {
    if (isSdkLoaded) {
      window.FB.login(handleResponse, {
        scope: "publish_to_groups, publish_pages",
      });
    } else {
      console.error("Facebook SDK not loaded yet");
    }
  };

  const handleButtonClick = () => {
    // This is where you need the write permission
    requestWritePermission();
  };

  const handleRetryClick = () => {
    // Retry permission request if previously declined
    if (permissionDeclined) {
      requestWritePermission();
    }
  };

  const isAllowedToPublishMoments = userStoryMomentList?.find(
    (x) => x.methodName === "Publish Moments"
  )?.isAllowed;

  const handleSuccessAction = () => {
    setShownUserDeleteConfirmation(false);
    setTimeout(() => {
      router.push("/signin");
    }, 1000);
    setShownSuccessDeleteMsgAlert(true);
  };

  return (
    <>
      {showIconOnly && (
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasDarkNavbar"
          aria-controls="offcanvasDarkNavbar"
          aria-label="Toggle navigation"
        >
          {menuIcon ? (
            <Img src={menuIcon} height={45} width={45} />
          ) : (
            <span className="navbar-toggler-icon">
              <i className="fas fa-bars"></i>
            </span>
          )}
        </button>
      )}
      <nav
        className={`sidebar navbar navbar-expand-md navbar-dark bg-dark ${
          isOpen ? "mobile-left" : "fixed-left"
        } ${className}`}
      >
        <div
          className={`collapse navbar-collapse d-lg-flex justify-content-md-end ${
            isOpen ? "show" : "not-show"
          }`}
        >
          <Link
            className="navbar-brand"
            href="/"
            onClick={() => setActivePage("")}
          >
            <Img
              src="/images/i69app icon.webp"
              width={90}
              height={80}
              alt=""
              style={{ width: "90px", height: "auto" }}
            />
          </Link>
          <ul className="navbar-nav ms-0">
            <li
              className={`nav-item nav-item-user ${
                activePage === "my-profile" && "active"
              }`}
              onClick={() => setActivePage("my-profile")}
            >
              <Link href="/my-profile">
                <i>
                  <Avatar
                    src={
                      data?.user?.avatarPhotos?.filter(
                        (img) => img.type !== "PRIVATE"
                      )?.[0]?.url
                    }
                    style={{ cursor: "pointer" }}
                    alt="Avatar"
                  />
                </i>{" "}
                {t("navigation.my_profile")}
              </Link>
            </li>
            <li
              className={`nav-item ${activePage === "" && "active"}`}
              onClick={() => setActivePage("")}
            >
              <Link href="/">
                <i>
                  <HomeIcon />
                </i>{" "}
                {t("navigation.home")}
              </Link>
            </li>
            <li
              className={`nav-item ${activePage === "chat" && "active"}`}
              onClick={() => setActivePage("chat")}
            >
              <Link href="/chat">
                <i>
                  <ChatIcon />
                </i>
                {t("navigation.message")}
                {unreadCount != 0 && (
                  <b className="noti_count">{unreadCount}</b>
                )}
              </Link>
            </li>
            <li
              className={`nav-item ${activePage === "search" && "active"}`}
              onClick={() => setActivePage("search")}
            >
              <Link href="/search">
                <i>
                  <SearchIcon width="35" height="35" />
                </i>{" "}
                {t("navigation.search")}
              </Link>
            </li>
            {isAllowedToPublishMoments &&
              updatedCustomTab?.name === "shareMoment" && (
                <li
                  className={`nav-item ${
                    activePage === "shareMoment" && "active"
                  }`}
                >
                  <Link href="#shareMoment" onClick={handleCustomTab}>
                    {" "}
                    <i>
                      <AddCircleIcon width="35" height="35" />
                    </i>{" "}
                    {t("navigation.share_moment")}
                  </Link>
                </li>
              )}
            {/* <li className={`nav-item ${activePage === '' && activeTab === 'filter' && 'active'}`}
                            onClick={() => { setActivePage(''); setActiveTab('filter') }} >
                            <a href="/"><i><FilterIcon /></i> Filter</a>
                        </li> */}
            <li
              className={`nav-item ${
                activePage === "buy-chat-coin" && "active"
              }`}
              onClick={() => setActivePage("buy-chat-coin")}
            >
              <Link href="/buy-chat-coin">
                <i>
                  <Img
                    alt="Coin"
                    src="/images/coinIcon.svg"
                    width="39"
                    height="34"
                  />
                </i>{" "}
                {t("navigation.buy_coins")}
              </Link>
            </li>
            <li
              className={`nav-item ${
                activePage === "my-profile" &&
                activeTab === "subscription" &&
                "active"
              }`}
              onClick={() => {
                setActivePage("my-profile");
                setActiveTab("subscription");
                setOpenSubscriptionModal && setOpenSubscriptionModal(true);
              }}
            >
              <Link href="/my-profile#buy-subcription">
                <i>
                  <SubscriptionIcon />
                </i>{" "}
                {t("navigation.subscription")}
              </Link>
            </li>
            <li
              className={`nav-item ${
                activePage === "" && activeTab === "notification" && "active"
              }`}
              onClick={() => {
                setActivePage("");
                setActiveTab("notification");
              }}
            >
              <Link href="/">
                <i>
                  <NotificationIcon />
                </i>{" "}
                {t("navigation.notifications")}
              </Link>
            </li>

            <li
              className={`nav-item dropdown mb-2 ${
                settingMenu ? "show" : "not-show"
              }`}
            >
              <Link href="" onClick={toggleSettings} className="">
                <i>
                  <SettingIcon width="35" height="35" />
                </i>{" "}
                {t("navigation.settings")}
              </Link>
              <ul
                id="myDropdown"
                className={`dropdown-content ${
                  settingMenu ? "show" : "not-show"
                }`}
              >
                {settingOptions.map((menuItem, index) => {
                  return (
                    <li key={index} className="dropdown-item ml-4">
                      <Link href={`/${router?.asPath}`} legacyBehavior>
                        {menuItem.handleOnClick ? (
                          <a onClick={() => menuItem.handleOnClick()}>
                            {t(
                              `navigation.${menuItem.label
                                .toLowerCase()
                                .replace(" ", "_")}`
                            )}{" "}
                          </a>
                        ) : (
                          <Typography
                            className="nav-settings-item"
                            onClick={() => {
                              console.log(
                                menuItem.label,
                                settingsItems[menuItem.label],
                                "Labellll"
                              );
                              setSelectedSettingsItem(menuItem.label);
                              setOpen(true);
                            }}
                          >
                            {" "}
                            {t(
                              `navigation.${menuItem.label
                                .toLowerCase()
                                .replace(" ", "_")}`
                            )}
                          </Typography>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className={"nav-item signout-wrapper"}>
              {token === null ? (
                <span className="dropdown-item">
                  <button
                    onClick={() => router.push("/signin")}
                    className="signup button-1"
                  >
                    {t("navigation.sign_in")}
                  </button>
                </span>
              ) : (
                <span className="dropdown-item">
                  <button onClick={handleLogout} className="signup button-1">
                    {t("navigation.signout")}
                  </button>
                </span>
              )}
            </li>
            {/* {facebookToken && (
              <li className={"nav-item"}>
                <button onClick={handleButtonClick}>
                  Request Write Permission
                </button>
                {permissionDeclined && (
                  <div>
                    <p>
                      Permission was declined. Please grant permission to
                      proceed.
                    </p>
                    <button onClick={handleRetryClick}>
                      Retry Permission Request
                    </button>
                  </div>
                )}
              </li>
            )} */}
          </ul>
        </div>
        <audio ref={audioPlayer} src="/sound/notification-sound.mp3" />
      </nav>
      {isShownUserDeleteConfirmation && (
        <DeleteProfileModal
          email={data?.user?.email}
          userId={userId}
          token={token}
          handleSuccessAction={() => handleSuccessAction()}
          handleCloseButton={() => setShownUserDeleteConfirmation(false)}
        />
      )}
      {isShownSuccessDeleteMsgAlert && (
        <Box
          sx={{
            width: "30%",
            display: "block",
            zIndex: 1000,
            top: "50%",
            left: "40%",
            position: "fixed",
          }}
        >
          <Alert severity="success">YOU HAVE DELETED YOUR ACCOUNT</Alert>
        </Box>
      )}
      <Modal
        open={open}
        onClose={() => {
          setSelectedSettingsItem("");
          setOpen(false);
        }}
      >
        <div className="settings-modal-content">
          <ModalClose
            style={{ backgroundColor: "white" }}
            onClick={() => {
              setSelectedSettingsItem("");
              setOpen(false);
            }}
          />
          {selectedSettingsItem && settingsItems[selectedSettingsItem]}
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
