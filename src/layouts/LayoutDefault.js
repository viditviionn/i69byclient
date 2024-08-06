import React, { useEffect, useState } from "react";
import Head from "next/head";
import { set_user_value_from_localstorage } from "../../redux/actions/user";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import Link from "next/link";
import Navbar from "./Navbar";
import { Authenticated } from "../common/middleWare";
const FullScreenLoader = dynamic(() =>
  import("../components/elements/FullScreenLoader")
);
import ShareMomentScreen from "../views/home/ShareMomentScreen";
import HomeIcon from "../../public/images/homeIcon.svg";
import ChatIcon from "../../public/images/chatIcon.svg";
import SearchIcon from "../../public/images/magnifier.svg";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useLazyQuery, gql } from "@apollo/client";
import { Avatar } from "../views/Home2";

const bottomNavs = [
  {
    name: "Home",
    icon: <HomeIcon />,
    path: "/",
  },
  {
    name: "Search",
    icon: <SearchIcon width="35" height="35" />,
    path: "/search",
  },
  {
    name: "Share Moment",
    icon: <AddCircleIcon width="35" height="35" />,
    path: "#shareMoment",
  },
  {
    name: "Message",
    icon: <ChatIcon />,
    path: "/chat",
  },
];

const USER_QUERY = gql`
  query user($id: String!) {
    user(id: $id) {
      username
      fullName
      coins
      avatarPhotos {
        url
      }
    }
  }
`;

const LayoutDefault = (props) => {
  const [loader, setLoader] = useState(false);
  const [userId, setUserId] = useState();
  const [getUserData, { data, error, loading }] = useLazyQuery(USER_QUERY);
  const [activePage, setActivePage] = useState("");

  useEffect(() => {
    setLoader(true);
    let userInfo = {
      signup: localStorage.getItem("token"),
      uid: localStorage.getItem("token"),
    };
    set_user_value_from_localstorage(userInfo);
    const id = localStorage.getItem("userId");
    setUserId(id || "");
    setTimeout(() => {
      setLoader(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (userId) {
      getUserData({
        variables: {
          id: userId,
        },
      });
    }
  }, [userId]);

  const { children } = props;
  // redux
  const { set_user_value_from_localstorage } = props;

  const router = useRouter();

  useEffect(() => {
    setActivePage(
      bottomNavs.find((item) => router.pathname === item.path)?.name
    );
  }, []);

  return (
    <>
      {loader ? (
        <FullScreenLoader />
      ) : (
        <>
          <Head>
            <meta name="viewport" />
          </Head>

          <main className="site-content">
            {![
              "/landing",
              "/signin",
              "/policy",
              "/contactUs",
              "/faq",
              "/terms",
              "/signin-email",
              "/intrested",
              "/tags",
              "/about",
              "/edit-profile",
              "/welcome-page",
              "/i69app-data-deletion/i69app-data-deletion-instructions",

              "/"
            ].includes(router.pathname) && (
              <Authenticated>
                <Navbar />
              </Authenticated>
            )}
            {activePage === "Share Moment" ? (
              <Box className="texture-01 interested-in-container">
                <ShareMomentScreen setCurrentScreen={setActivePage} />
              </Box>
            ) : (
              children
            )}
            {![
              "/landing",
              "/signin",
              "/policy",
              "/contactUs",
              "/faq",
              "/terms",
              "/signin-email",
              "/intrested",
              "/tags",
              "/about",
              "/edit-profile",
              "/welcome-page",
            ].includes(router.pathname) && (
              <Authenticated>
                <Box
                  className="bottom-nav"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "black",
                    position: "fixed",
                    bottom: "0",
                    left: "0",
                    padding: "6px 24px",
                    zIndex: 5,
                    backgroundColor: "#175361",
                    alignItems: "center",
                  }}
                >
                  {bottomNavs.map((item, ind) => (
                    <Link
                      className={`bottom-nav-item ${
                        activePage === item.name && "active"
                      }`}
                      key={`nav-item-${ind}-${item.name}`}
                      href={item.path}
                      onClick={() => {
                        setActivePage(item.name);
                      }}
                    >
                      <i>{item.icon}</i>
                    </Link>
                  ))}
                  <Link href={"/my-profile"}>
                    <Avatar
                      src={data?.user?.avatarPhotos[0]?.url}
                      alt="avatar"
                      style={{
                        maxHeight: "55px",
                        maxWidth: "55px",
                        height: "55px",
                        width: "55px",
                      }}
                    />
                  </Link>
                </Box>
              </Authenticated>
            )}
          </main>
        </>
      )}
    </>
  );
};
const mapStateToProps = (state) => {
  return {
    signup: state.UserReducer.signup,
  };
};
export default connect(mapStateToProps, { set_user_value_from_localstorage })(
  LayoutDefault
);
