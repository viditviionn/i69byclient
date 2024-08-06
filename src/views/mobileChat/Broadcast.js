import { gql, useLazyQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { formatDate, formatTime } from "../../common/formatTime";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { localePostfix_gql } from "../../common/utils";

const BROADCAST_QUERY = (locale) => gql`
  query broadcast {
    broadcastMsgs {
      edges {
        node {
          id
          timestamp
          content : ${"content" + localePostfix_gql(locale)}
        }
      }
    }
  }
`;
// locale.length === 5 :: locale -> zh_cn

const Broadcast = ({ setSelectedUser, setTime }) => {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [getBroadCastData, { data, loading, error }] = useLazyQuery(
    BROADCAST_QUERY(locale)
  );
  useEffect(() => {
    getBroadCastData();
  }, []);

  let broadcastData = data?.broadcastMsgs?.edges;

  const fetchId = (node) => {
    // setSelectedUser(node?.id);
    // setTime(node?.timestamp);
  };

  return (
    <>
      <div
        onClick={() => fetchId(broadcastData && broadcastData[0]?.node)}
        className="user-list"
        id="broadcastroom"
      >
        <small>
          {console.log({ broadcastData })}
          {formatDate(broadcastData && broadcastData[0]?.node?.timestamp)}
        </small>

        <img className="pro_img" src="/images/logo-right.jpg" alt="logo" />

        <div className="chat-list-text">
          <div>
            <strong>{t("message_screen.team")} i69</strong>
            <span>{broadcastData && broadcastData[0]?.node?.content}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const BroadcastMsgs = ({ selectedUser }) => {
  const { locale } = useRouter();
  const [getBroadCastData, { data, loading, error }] = useLazyQuery(
    BROADCAST_QUERY(locale)
  );

  useEffect(() => {
    getBroadCastData();
  }, []);

  let broadcastData = data?.broadcastMsgs?.edges;
  // console.log(broadcastData)
  // console.log(selectedUser)
  // console.log(broadcastData && broadcastData[0]?.node?.id)
  return (
    <>
      {/* {selectedUser === broadcastData && broadcastData[0]?.node?.id && ( */}
      <div>
        {broadcastData &&
          broadcastData.map((item, index) => (
            <div key={index} className="msg-left">
              <div className="bubble-2">
                <figure>
                  <img src="/images/author_img50x.png" alt="i69 avatar" />
                </figure>
                <span className="msg_txt">{item?.node?.content}</span>
              </div>
              <small className="time_lbl">
                {formatTime(item?.node?.timestamp)}
              </small>
            </div>
          ))}
      </div>

      {/* )}  */}
    </>
  );
};

export default Broadcast;
