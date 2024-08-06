import React, { useEffect, useState, useRef } from 'react'
import Navbar from '../layouts/Navbar'
import { useRouter } from 'next/router'
import { sendMessege } from '../mutation/sendMessege'
import { gql, useLazyQuery } from '@apollo/client'
import IncomingChat from './mobileChat/IncomingChat'
import { formatDate, formatTime } from '../common/formatTime'
import RoomsData from './mobileChat/RoomsData'
import Appbar from '../layouts/Appbar'
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ImageIconButton } from './MyProfile'
import { useTranslation } from 'react-i18next'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { ChatVideoPlayer } from './Home'
import { localePostfix_gql } from '../common/utils'
import GiftImagePreviewModal from './mobileChat/GiftImagePreviewModal'
import { sendGift } from '../mutation/sendGift'


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
const REALGIFT_QUERY = (locale) => gql`
  query allRealGift {
    allRealGift {
      id
      giftName : giftName${localePostfix_gql(locale)}
      cost
      picture
      url
      type
      status
    }
  }
`;
const MESSEGES_QUERY = gql`
query messages($id:ID){
    messages(id:$id){
      edges{
        node{
            id
          content
          messageType
          timestamp
          userId{
            id
            username
            avatarPhotos{
              url
            }
          }
          roomId{
            id
            name
            userId{
              id
              username
              avatarPhotos{
                url
              }
            }
          }
        }
      }
    }
  }
`
const ROOMS_QUERY = gql`
  query rooms {
    rooms {
      edges {
        node {
          id
          name
          lastModified
          unread
          blocked
          messageSet {
            edges {
              node {
                id
                content
                messageType
                timestamp
                giftMessageSender {
                  id
                }
              }
            }
          }

          userId {
            coins
            id
            fullName
            isOnline
            purchaseCoins
            giftCoins
            coins
            avatarPhotos {
              url
            }
            username
          }
          target {
            id
            username
            isOnline
            avatarPhotos {
              url
            }
            fullName
            purchaseCoins
            giftCoins
            coins
          }
        }
      }
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
const VIRTUALGIFT_QUERY = (locale) => gql`
  query allVirtualGift {
    allVirtualGift {
      id
      giftName : giftName${localePostfix_gql(locale)}
      cost
      picture
      url
      type
      status
    }
  }
`;


const MobileChat = () => {
  const { locale } = useRouter();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [roomsAllData, setRoomsAllData] = useState(null)
  const roomIdAsInt = Number(router.query.mobilechat);
  const [showLinks, setLinks] = useState(false);
  const { t } = useTranslation();
  const [userId, setUserId] = useState();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [videoUrlState, setVideoUrlState] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [giftImage, setGiftImage] = useState(null);
  const [showGiftDetails, setShowGiftDetails] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [giftImageDailouge, setGiftImageDailouge] = useState("");
  const [giftImageDailougeState, setGiftImageDailougeState] = useState("");
  const [selectedGift, setselectedGift] = useState();
  const [showGifts, setGifts] = useState(false);
  const [showReal, setShowReal] = useState(true);
  const [getRoomsData, { data : roomQuerydata  }] = useLazyQuery(ROOMS_QUERY);
  const [room, setRoom] = useState(null);
  const [
    getRealGiftData,
    {
      data: realGiftData,
      error: realGiftError,
      loading: realGiftLoading,
      refetch : refetch1,
    },
  ] = useLazyQuery(REALGIFT_QUERY(locale));
  const [
    getVirtualGiftData,
    {
      data: virtualGiftData,
      error: virtualGiftError,
      loading: virtualGiftLoading,
    },
  ] = useLazyQuery(VIRTUALGIFT_QUERY(locale));
  useEffect(() => {
    // Retrieve userId from localStorage on component mount
    const id = localStorage.getItem("userId");
    setUserId(id || "");
  }, []);

  useEffect(()=>{
    getRealGiftData();
    getVirtualGiftData();
    getRoomsData();
  },[])
  
  useEffect(() => {
    const img = new Image();
    img.src = giftImage;
    img.onload = () => {
      // Check if the image is horizontal or vertical based on its width and height
      if (img.width > img.height) {
        setIsHorizontal(true);
      } else {
        setIsHorizontal(false);
      }
    };
  }, [giftImage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const roomId = localStorage.getItem("roomId");
      console.log(roomId, "room id found");
      setRoom(roomId);
    }
  }, [room]);
  const [
    getUserData,
    {
      data: userData,
      error: userError,
      loading: userLoading,
      refetch: refetchData,
    },
  ] = useLazyQuery(USER_QUERY);
  const [getCoinsCategory, { data: coinsCategory }] =
    useLazyQuery(GET_COIN_CATEGORY);

  const [getMessageData, { data, error, loading, refetch }] =
    useLazyQuery(MESSEGES_QUERY);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages?.edges?.length]);

  useEffect(() => {
    getCoinsCategory();
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

  useEffect(() => {
    if (roomIdAsInt) {
      getMessageData({
        variables: { id: roomIdAsInt },
      });
    }
  }, [roomIdAsInt]);

  useEffect(() => {
    refetch()
  }, [message, roomIdAsInt, data, loading])

  let messegeData = (data?.messages?.edges)
  let newmessegeData = roomQuerydata?.rooms?.edges;
  console.log(data , "???")
  useEffect(() => {
    newmessegeData &&
      newmessegeData.length > 0 &&
      newmessegeData
        .filter((message) => message?.node?.id === room)
        .map(
          (item, index) => (
            setRoomsAllData(item?.node) , 
            setRoom(item?.node?.id)
          )
        );
      },[newmessegeData , room]);


  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendLocation = async () => {
    const response = await sendMessege({
      roomId: roomIdAsInt,
      messegeStr: message,
      messageType: "GL",
    });

    if (response) {
      console.log(response, new Date(), "Response");
      setMessage("");
      refetch();
      refetchData();
      console.log(response);
    }
    // setMessageType("GL")
  };
  const handleSendMessageData = () => {
    setGifts(!showGifts);
    setGiftImageDailougeState(false);
    handleSendGift();
  };
  const handleSendGift = async () => {
    console.log(selectedGift);
    const response = await sendGift({
      giftId: selectedGift,
      senderId: localStorage.getItem("userId"),
      receiverId:
        roomsAllData?.userId?.id === localStorage.getItem("userId")
          ? roomsAllData?.target?.id
          : roomsAllData?.userId?.id,
    });
  }
console.log(roomsAllData,"???")
  const handleSendMessage = async () => {
    if (latitude != null && longitude != null) {
      handleSendLocation();
      setLatitude(null);
      setLongitude(null);
    } else {
      if (message) {
        const response = await sendMessege({
          roomId: roomIdAsInt,
          messegeStr: message,
          messageType: "C",
        })

        if (response) {
          setMessage('');
          refetch();

        }
      }
    }
  };
const receiver =roomsAllData?.target?.fullName
? roomsAllData?.userId?.id ===
  localStorage.getItem("userId")
  ? roomsAllData?.target?.fullName
  : roomsAllData?.userId?.fullName
: `${t("message_screen.team")} i69`
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const sortMessgeData = messegeData && messegeData.sort((a, b) => new Date(a?.node?.timestamp) - new Date(b?.node?.timestamp));
    console.log(sortMessgeData,"sorted");
  const outgoingMessages = sortMessgeData && sortMessgeData.filter((message => message?.node?.userId?.id == localStorage.getItem('userId') || ( message?.node?.userId?.id !== localStorage.getItem('userId')  && message?.node?.messageType == "G")) )
    .sort((a, b) => new Date(a?.node?.timestamp) - new Date(b?.node?.timestamp));
  //   console.log(outgoingMessages);
  const incomingMessages = sortMessgeData && sortMessgeData.filter(message => ((message?.node?.messageType != "G"  && message?.node?.userId?.id !== localStorage.getItem('userId') )|| (message?.node?.messageType === "G"  && message?.node?.userId?.id === localStorage.getItem('userId'))))
    .sort((a, b) => new Date(a?.node?.timestamp) - new Date(b?.node?.timestamp));

  const getCoinIconName = (coins) => {
    const categories = coinsCategory?.coinsCategory;
    const matchedCoin = categories?.find(
      (c) => coins >= c.minCoins && coins <= c.maxCoins
    )?.name;
    return coins === 0 ? "silver" : matchedCoin?.toLowerCase();
  };

  const toggleSendAttachments = () => {
    setLinks(!showLinks);
  };
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
    };

    reader.readAsDataURL(selectedFile);

    const image = selectedFile;
    if (!image) {
      return;
    }
    const formData = new FormData();
    formData.append("upload_type", "image");
    formData.append("image", image);

    try {
      let httpLink;
      if (`${process.env.NEXT_PUBLIC_APP_ENV}` === "development") {
        httpLink = process.env.NEXT_PUBLIC_STAGING;
      } else {
        httpLink = process.env.NEXT_PUBLIC_PRODUCTION;
      }

      const response = await fetch(httpLink + "chat/image_upload", {
        method: "POST",
        body: formData,
        headers: {
          authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data) {
        setMessage(data?.img);
        setLinks(!showLinks);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  const getLocation = async () => {
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position, "location");
          handleSetLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      console.log("getcordinate is not working");
    }
  };
  const handleSetLocation = (lat, long) => {
    setMessage(lat + "," + long);
    setLatitude(lat);
    setLongitude(long);
    setLinks(!showLinks);
    refetch();
  };
  const showGiftDetailView = (image) => {
    setGiftImage(image);
    setShowGiftDetails(true);
  };

  const hideGiftDetail = () => {
    setShowGiftDetails(false);
  };
  const toggleSendGift = () => {
    setLinks(false);
    setGifts(!showGifts);
  };
  const setSelectedGiftData = (giftid) => {
    setselectedGift(giftid);
  };
  const showVirtualGifts = () => {
    setShowReal(false);
  };

  const showRealGifts = () => {
    setShowReal(true);
  };
  console.log(realGiftData , virtualGiftData ,locale,outgoingMessages, "??")
  return (
    <>
      <div className="relative-body" style={{ background: "#1F2326" }}>
        {/* <Navbar/> */}



        <div className="row m-0">

          <div className="col-12 chat-area px-0">
            <div className="header-control header-control-msg h-c-g col-12" >
              <div className='MobileChatHeader'>
                <RoomsData userData={userData} />
                <div className='MobileChatHeaderIconContainer'>
                  <SearchIcon   sx={ {color :"black"}} />
                  <InfoOutlinedIcon   sx={ {color :"black"}} />
                </div>
              </div>
              {/* <i onClick={()=>router.back()} className="fa fa-angle-left gold-icon" aria-hidden="true"></i> */}


              {/* <img src="/images/logo-right.jpg" alt='logo'/> */}
            </div>
            <div onClick={() => router.push('/buy-chat-coin')} className="coin-area" style={{ cursor: 'pointer' }}>
              <img
                src={`/images/${getCoinIconName(
                  userData?.user?.coins
                )}Coins.png`}
                alt="coins"
                height={20}
                width={20}
              />
              <small className="pb-1">COINS | {userData?.user?.coins} LEFT</small>
            </div>

            <div className="scr-cht src-chat-mobile">
              <div className="chat-time">{formatDate(messegeData && messegeData[0]?.node?.timestamp)}</div>

              <IncomingChat roomId={roomIdAsInt} incomingMessages={incomingMessages} />

              {outgoingMessages && outgoingMessages.length > 0 && outgoingMessages.map((item, index) => (
                <div key={index} className="msg-right">
                  <div className="bubble-1">
                    {/* <span className="text-left ">{item?.node?.content}</span>
                    <small className="text-right w-100">{formatTime(item?.node?.timestamp)}</small> */}
                    {/* <span className="text-left ">{item?.node?.content}</span>
            <small className="text-right w-100">{formatTime(item?.node?.timestamp)}</small> */}
                    {item?.node?.messageType == "G" ? (
                      <div className="rdtail">
                        <span className="msg_txt">
                          {item?.node?.content
                            .split(" ")
                            .slice(1)
                            .join(" ")}
                        </span>
                        <div className="sendedgift">
                          <img
                            className="giftImg"
                            src={item?.node?.content.split(" ")[0]}
                            alt="gift"
                          />
                          <a
                            href="#!"
                            className="giftview"
                          onClick={(e) =>
                            showGiftDetailView(
                              item?.node?.content.split(" ")[0]
                            )
                          }
                          >
                            <img src="/images/eye_ic.svg" alt="view" />
                          </a>
                        </div>
                      </div>
                    ) : item?.node?.content.startsWith("http") ||
                      item?.node?.content.startsWith("/media") ? (
                      /\.(mp4|webm|ogg|ogv|mov|avi|wmv|flv)$/i.test(
                        item?.node?.content
                      ) ? (
                        <>
                          <ChatVideoPlayer
                            src={
                              item?.node?.content.startsWith("/media")
                                ? "https://api.i69app.com" +
                                item?.node?.content
                                : item?.node?.content
                            }
                            setVideoUrlState={setVideoUrlState}
                            setVideoUrl={setVideoUrl}
                          />
                          <div
                            className={
                              videoUrlState
                                ? "gift_image_preview_modal video show align-items-center justify-content-center"
                                : "gift_image_preview_modal"
                            }
                           
                          >
                            <div className="d-flex align-items-center">
                              <a
                                href="#!"
                                className="gift_image_preview_modal_button"
                                onClick={() => {
                                  setVideoUrlState(false);
                                  setVideoUrl(null);
                                }}
                              >
                                <img
                                  src="/images/close_ic.svg"
                                  alt="close/icon"
                                  width={25}
                                  height={25}
                                />
                              </a>
                            </div>
                            <div
                              className="gift_image_preview_modal_image"
                            onClick={() => setVideoUrlState(false)}
                            >
                              {videoUrl && (
                                <video
                                  controls={true}
                                  muted={true}
                                  loop
                                  autoPlay={true}
                                  controlsList="nodownload"
                                >
                                  <source
                                    // src={
                                    //   item?.node?.content.startsWith(
                                    //     "/media"
                                    //   )
                                    //     ? "https://api.i69app.com" +
                                    //       item?.node?.content
                                    //     : item?.node?.content
                                    // }
                                    src={videoUrl}
                                    type="video/mp4"
                                  />
                                </video>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rdtail">
                          <div className="sendedgift">
                            <img
                              className="giftImg"
                              src={
                                item?.node?.content.startsWith("/media")
                                  ? "https://api.i69app.com" +
                                  item?.node?.content
                                  : item?.node?.content
                              }
                              alt="gift"
                            />
                            <a
                              href="#!"
                              className="giftview"
                            onClick={(e) =>
                              showGiftDetailView(
                                item?.node?.content.startsWith(
                                  "/media"
                                )
                                  ? "https://api.i69app.com" +
                                  item?.node?.content
                                  : item?.node?.content
                              )
                            }
                            >
                              <img
                                src="/images/eye_ic.svg"
                                alt="view"
                                
                              />
                            </a>
                          </div>
                          
                              
                            
                        </div>
                      
                      )
                    ) : item?.node?.messageType == "GL" ? (
                      <>
                        <APIProvider apiKey="AIzaSyBNDQFHOXjOH-AJH_tvgd7FM_IxLNClDRk">
                          <Map
                            style={{ width: "100%", height: "30vh" }}
                            defaultCenter={{
                              lat: parseFloat(
                                item?.node?.content.split(",")[0]
                              ),
                              lng: parseFloat(
                                item?.node?.content.split(",")[1]
                              ),
                            }}
                            defaultZoom={12}
                            gestureHandling={"greedy"}
                            disableDefaultUI={true}
                            fullscreenControl={true}
                            zoomControl={true}
                            streetViewControl={true}
                            mapTypeControl={true}
                          >
                            <Marker
                              position={{
                                lat: parseFloat(
                                  item?.node?.content.split(",")[0]
                                ),
                                lng: parseFloat(
                                  item?.node?.content.split(",")[1]
                                ),
                              }}
                            />
                          </Map>
                        </APIProvider>
                      </>
                    ) : (
                      <span className="text-left">
                        {item?.node?.content}
                      </span>
                    )}
                    <small className="text-right w-100">
                      {formatTime(item?.node?.timestamp)}
                    </small>
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              ))}


            </div>

            <div className="chat-send-area-two">

              <div className={showLinks ? "attache_modal show" : "attache_modal"}>
                <h4>{t("chat_box.select_image_file")}</h4>
                <div className="grid">
                  <div className="attache_file_btn">
                    <div className="icon">
                      <img src="/images/file_attache_ic1.svg" />
                    </div>
                    <strong>{t("chat_box.camera")}</strong>
                  </div>
                  <div className="attache_file_btn">
                    <div className="icon">
                      <label htmlFor="file-upload" className="custom--upload">
                        <img src="/images/file_attache_ic2.svg" />
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                    </div>
                    <strong>{t("chat_box.gallery")}</strong>
                  </div>
                  <div className="attache_file_btn">
                    <div className="icon" onClick={getLocation}>
                      <img src="/images/file_attache_ic3.svg" />
                    </div>
                    <strong>{t("chat_box.location")}</strong>
                  </div>
                </div>
              </div>
              <div className="send">
                <input
                  type="text"
                  placeholder="Enter a message"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={handleKeyPress}
                />
                <ImageIconButton icon="giftBox" onlyIcon classes="iconsForMobile" width="24px" onClick={toggleSendGift} />
    <div className={showGifts ? "sendgift_modal show" : "sendgift_modal"}>
            <div className="modal_title">
              <img src="/images/gift_img62x.png" />
              <span>{t("chat_box.gifts")}</span>
              <a href="#!" className="modal_close" onClick={toggleSendGift}>
                <img src="/images/close_circle_icon.svg" />
              </a>
            </div>
            <div className="modal_body">
              <ul className="nav_tabs">
                <li>
                  <a
                    href="#!"
                    className={showReal ? "active" : ""}
                    onClick={showRealGifts}
                  >
                    {t("chat_box.real_gifts")}
                  </a>
                </li>
                <li>
                  <a
                    href="#!"
                    className={showReal ? "" : "active"}
                    onClick={showVirtualGifts}
                  >
                    {t("chat_box.virtual_gifts")}
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab_pane">
                  {showReal && realGiftData && (
                    <>
                      <div className="grid">
                        {realGiftData.allRealGift &&
                          realGiftData.allRealGift.length > 0 &&
                          realGiftData.allRealGift.map((item, index) => (
                            <div
                              key={index}
                              className={
                                item?.id === selectedGift
                                  ? "selected column"
                                  : "column grid_gold_color"
                              }
                            >
                              <h4>{item?.giftName}</h4>
                              <figure
                                onClick={() => {
                                  setGiftImageDailouge(item);
                                  setGiftImageDailougeState(true);
                                  setSelectedGiftData(item?.id);
                                }}
                              >
                                <img src={item?.url} />{" "}
                                <a className="expand_link" href="#!">
                                  <img src="/images/interface-arrows_ic.svg" />
                                </a>
                              </figure>
                              <span>
                                {item?.cost} {t("chat_box.coins")}
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  {!showReal && virtualGiftData && (
                    <>
                      <div className="grid">
                        {virtualGiftData.allVirtualGift &&
                          virtualGiftData.allVirtualGift.length > 0 &&
                          virtualGiftData.allVirtualGift.map((item, index) => (
                            <div
                              key={index}
                              className={
                                item?.id === selectedGift
                                  ? "selected column"
                                  : "column grid_gold_color"
                              }
                            >
                              <h4>{item?.giftName}---</h4>
                              <figure
                                onClick={() => {
                                  setGiftImageDailouge(item);
                                  setGiftImageDailougeState(true);
                                  setSelectedGiftData(item?.id);
                                }}
                              >
                                <img src={item?.url} />
                                <a className="expand_link">
                                  <img src="/images/interface-arrows_ic.svg" />
                                </a>
                                {/* m */}
                              </figure>
                              <span>
                                {item?.cost} {t("chat_box.coins")}
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  {giftImageDailougeState && (
                    <GiftImagePreviewModal
                      user={receiver}
                      data={giftImageDailouge}
                      close={setGiftImageDailougeState}
                      handleSend={handleSendMessageData}
                    />
                  )}

                  <button
                    className="gift_send"
                    // onClick={() => {}}
                  >
                    {t("chat_box.send_gift_to")} {receiver}
                  </button>
                </div>
              </div>
            </div>
          </div>
                <i className="fa fa-paperclip" aria-hidden="true" onClick={toggleSendAttachments}></i>
                <ImageIconButton icon="send" onlyIcon classes="iconsForMobile" width="28px" onClick={handleSendMessage} />
                {/* <i className="fa-regular fa-paper-plane" onClick={handleSendMessage}></i> */}
              </div>
            </div>

          </div>
        </div>
        <Appbar />
        {
                        showGiftDetails && 
                        <div
                        className={
                          showGiftDetails
                            ? "gift_image_preview_modal image-wrapper show align-items-center justify-content-center"
                            : "gift_image_preview_modal"
                        }
                     
                      >
                        <div className="d-flex align-items-center">
                          <a
                            href="#!"
                            className="gift_image_preview_modal_button"
                            onClick={hideGiftDetail}
                          >
                            <img
                              src="/images/close_ic.svg"
                              alt="close/icon"
                              width={25}
                              height={25}
                            />
                          </a>
                        </div>
                        <div className="gift_image_preview_modal_image">
                          <img src={giftImage} alt="chat/img-modal" />
                        </div>
                      </div>
                     }
      </div>
    </>
  )
}

export default MobileChat
