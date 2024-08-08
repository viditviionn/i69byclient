import { gql, useLazyQuery } from "@apollo/client";
import {
  Box,
  CircularProgress,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { AvatarWrapper, Avatar, CircledCrossIcon, VideoAvatar } from "../Home2";
import Carousel from "react-material-ui-carousel";
import AddStoryTooltip from "./AddStoryTooltip";
import { useEffect, useState, useRef, useCallback } from "react";
import RadionButton from "../../components/elements/RadionButton";
import moment from "moment";
import { useRouter } from "next/router";
import { clientUpload } from "../../ApolloClient/client";
import Link from "next/link";
import { DesktopDateTimePicker } from "@mui/x-date-pickers";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Preview,
} from "@mui/icons-material";
import { Img } from "react-image";
import { Fullscreen, SendRounded } from "@material-ui/icons";
import ViewModal from "../../components/elements/ViewModal";
import FullScreenViewModal from "../../components/elements/FullscreenViewModal";
import { useTranslation } from "react-i18next";

// data query

const GET_MOMENT_COMMENTS = gql`
  query getMomentComments($pk: Int!) {
    getMomentComments(momentPk: $pk) {
      id
      user {
        id
        username
        avatarPhotos {
          url
          user
          id
        }
        username
        firstName
        lastName
        fullName
        email
        gender
      }
      commentDescription
      momemt {
        momentDescription
        Title
        createdDate
        pk
      }
      createdDate
      pk
      replys {
        commentDescription
        user {
          username
          avatarPhotos {
            url
            user
            id
          }
          username
          firstName
          lastName
          fullName
          email
          gender
        }
      }
      like
      report
      __typename
    }
  }
`;

const GET_MOMENT_LIKES = gql`
  query getMomentLikes($pk: Int!) {
    getMomentLikes(momentPk: $pk) {
      id
      user {
        id
        username
        avatarPhotos {
          url
          user
          id
        }
        username
        firstName
        lastName
        fullName
        email
        gender
      }
      momemt {
        momentDescription
        Title
        createdDate
        pk
      }
      __typename
    }
  }
`;

const GET_ALL_USER_MOMENTS = gql`
  query GetAllUserMoments($width: Int = 30, $characterSize: Int = 400) {
    allUserMoments {
      edges {
        cursor
        cursor
        node {
          pk
          comment
          createdDate
          publishAt
          file
          id
          like
          momentDescription
          momentDescriptionPaginated(
            width: $width
            characterSize: $characterSize
          )
          user {
            id
            email
            fullName
            username
            gender
            email
            avatar {
              url
              id
              user
            }
            onesignalPlayerId
            avatarPhotos {
              url
              id
              user
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

const GET_ALL_USER_STORIES = gql`
  query GetAllUserMultiStories {
    allUserMultiStories {
      user {
        id
        fullName
        avatar {
          url
          id
        }
        avatarIndex
        avatarPhotos {
          url
          id
        }
      }
      batchNumber
      stories {
        edges {
          cursor
          node {
            createdDate
            publishAt
            file
            fileType
            id
            pk
            thumbnail
            commentsCount
            comments {
              pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
              }
              edges {
                cursor
                node {
                  id
                  pk
                  createdDate
                  commentDescription
                  objectId
                  pk
                  user {
                    id
                    fullName
                    avatarIndex
                    avatarPhotos {
                      url
                      id
                    }
                    avatar {
                      id
                      url
                    }
                  }
                }
              }
            }
            likesCount
            likes {
              pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
              }
              edges {
                cursor
                node {
                  id
                  pk
                  objectId
                  user {
                    id
                    fullName
                    avatarIndex
                    avatarPhotos {
                      url
                      id
                    }
                    avatar {
                      id
                      url
                    }
                  }
                }
              }
            }
            user {
              id
              fullName
              avatar {
                url
                id
              }
              avatarIndex
              avatarPhotos {
                url
                id
              }
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;

const SHARE_STORY_MUTATION = gql`
  mutation story($moderatorId: String, $file: Upload!) {
    insertStory(moderatorId: $moderatorId, file: $file) {
      story {
        file
        createdDate
        id
      }
    }
  }
`;

const SCHEDULE_STORY_MUTATION = gql`
  mutation scheduleStory(
    $moderatorId: String
    $file: Upload!
    $publishAt: DateTime!
  ) {
    insertStory(moderatorId: $moderatorId, file: $file, publishAt: $publishAt) {
      story {
        file
        createdDate
        id
      }
    }
  }
`;

const MOMENT_LIKE_MUTATION = gql`
  mutation likeMoment($momentId: ID) {
    likeMoment(momentId: $momentId) {
      like {
        id
        user {
          id
          username
        }
        momemt {
          id
        }
        createdAt
      }
    }
  }
`;

const STORY_LIKE_MUTATION = gql`
  mutation storyLike($objectId: Int) {
    genericLike(objectId: $objectId, objectType: "story") {
      genericLike {
        id
        user {
          id
          username
        }
        objectId
      }
    }
  }
`;

const MOMENT_COMMENT_MUTATION = gql`
  mutation commentMoment($momentId: ID, $commentDescription: String!) {
    commentMoment(
      momentId: $momentId
      commentDescription: $commentDescription
    ) {
      comment {
        id
        user {
          id
        }
        momemt {
          id
        }
        commentDescription
        createdDate
      }
    }
  }
`;

const GET_STORY_COMMENTS = gql`
  query getStoryComments($momentId: String!) {
    allStoryComments(storyId: $momentId) {
      objectId
      commentDescription
      createdDate
      user {
        username
        avatarPhotos {
          url
          user
          id
        }
        username
        firstName
        lastName
        fullName
        email
        gender
      }
    }
  }
`;

const STORY_COMMENT_MUTATION = gql`
  mutation commentStory($momentId: Int, $commentDescription: String!) {
    genericComment(
      objectType: "story"
      objectId: $momentId
      commentDescription: $commentDescription
    ) {
      genericComment {
        id
        replys {
          edges {
            node {
              pk
            }
          }
        }
        likesCount
        likes {
          edges {
            node {
              pk
            }
          }
        }
      }
    }
  }
`;

// Constants
const videoExtensions = /\.(mp4|webm|ogg|ogv|mov|avi|wmv|flv)$/i;

// ============= Styled Components =============
const StoriesContainer = styled(Box)({
  width: "100%",
  display: "flex",
  backgroundColor: "#1F243080",
  borderBottom: "3px solid #DEBC63",
  padding: "4px",
  gap: "4px",
  overflowX: "auto",
  // scrollbarWidth: 'none',
  // '-ms-overflow-style': 'none',
  // '&::-webkit-scrollbar': {
  //     display: 'none'
  // }
});

const AddStoryLightBlackShade = styled(Box)({
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  objectFit: "cover",
  borderRadius: "20px",
  position: "absolute",
  backgroundColor: "#000000b0",
});

const StoryImage = styled("img")({
  height: "100%",
  width: "100%",
  borderRadius: "20px",
  objectFit: "cover",
});

const StoryVideo = styled("video")({
  height: "100%",
  width: "100%",
  borderRadius: "20px",
  objectFit: "cover",
});

const StoryName = styled(Typography)({
  fontSize: "16px",
  fontWeight: 600,
  textAlign: "center",
  // whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  position: "absolute",
  bottom: 0,
  // marginLeft: "1.7rem",
  width: "100%",
  textShadow: "0 0 1rem rgba(255,255,255,1)",
  // "@media screen and (max-width: 1700px)": { marginLeft: "1.1rem" },
});

const MomentContainer = styled(Box)({
  backgroundColor: "#1F243080",
  display: "flex",
  flexWrap: "wrap",
  padding: "4px",
  margin: "4px",
  borderRadius: "10px",
});

const MomentResponsesBar = styled(Box)({
  width: "100%",
  borderTop: "1px solid #fff",
  paddingTop: "15px",
});

const SelectedImagePreview = styled(Box)({
  padding: "16px",
  background: "#000000a3",
  height: "100%",
  width: "100%",
  position: "fixed",
  zIndex: 999,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
});

const ShareOptionsContainer = styled(Box)({
  position: "absolute",
  bottom: "5%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
});

const RadionButtonsContainer = styled(Box)({
  backgroundColor: "#1F243080",
  display: "flex",
  gap: "10px",
  padding: "20px",
  borderRadius: "20px",
});

// ============= Custom Components =============
const AddStory = ({
  userData,
  setCurrentScreen,
  handleFileChange,
  userStoryMomentList,
  labelText = "ADD STORY",
}) => {
  const [open, setOpen] = useState(false);
  const onChangeHandler = (event) => {
    handleFileChange(event);
    setOpen(false);
  };

  const isAllowedToPublish = userStoryMomentList?.find(
    (x) => x.methodName === "Publish Story"
  )?.isAllowed;

  return (
    <AddStoryTooltip
      open={open}
      setCurrentScreen={setCurrentScreen}
      onChangeHandler={onChangeHandler}
    >
      <div
        className={`story-container add-story ${
          isAllowedToPublish ? "cursor-pointer" : ""
          }`}
        onClick={() => {
          if (!isAllowedToPublish) return;
          setOpen(!open);
        }}
      >
        <AddStoryLightBlackShade>
          {isAllowedToPublish && (
            <img
              src="/images/noto_camera.png"
              alt=""
              className={`add-story-icon ${
                !isAllowedToPublish ? "opacity-25 cursor-default" : ""
                }`}
              height={58}
              width={58}
              style={{
                height: "58px",
                width: "58px",
              }}
            />
          )}
        </AddStoryLightBlackShade>
        {/* <StoryImage src="/images/model25.png" alt="" /> */}
        <StoryImage src={userData?.user?.avatarPhotos[0]?.url} alt="" />
        {isAllowedToPublish && (
          <StoryName sx={{ color: "#F3D27A" }} title={labelText}>
            {labelText}
          </StoryName>
        )}
      </div>
    </AddStoryTooltip>
  );
};

const MomentVideoPlayer = ({ src }) => {
  const videoRef = useRef(null);

  const [isIconVisible, setIsIconVisible] = useState(true);

  useEffect(() => {
    if (videoRef?.current?.paused) {
      setIsIconVisible(true);
    }
  }, [setIsIconVisible]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Trigger when 50% of the video is in view
    };

    const callback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play();
          setIsIconVisible(false);
        } else {
          entry.target.pause();
          setIsIconVisible(true);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsIconVisible(true);
      }
    };
  }, []);

  const handleClick = (e) => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsIconVisible(false);
    } else {
      videoRef.current.pause();
      setIsIconVisible(true);
    }
  };

  const handleIconClick = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
    }
    setIsIconVisible(false);
  }, []);

  return (
    <div style={{ background: "black" }} onClick={handleClick}>
      <video
        className="moment-video"
        width="320"
        height="320"
        controlsList="nodownload"
        ref={videoRef}
        controls={true}
        id={`video-${src}`}
        onPlay={() => {
          setIsIconVisible(false);
        }}
        onPause={() => {
          setIsIconVisible(true);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="moment-video-icon">
        {isIconVisible && (
          <img
            src={"/images/videoIcon.svg"}
            alt="videoIcon.svg"
            onClick={handleIconClick}
          />
        )}
      </div>
    </div>
  );
};

const StoryVideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // Trigger when 50% of the video is in view
    };

    const callback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setAutoplay(true);
          entry.target.play();
          //   observer.unobserve(entry.target); // Stop observing once triggered
        } else {
          entry.target.pause();
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
  }, []);

  return (
    <video
      className="storyvideoprod"
      loop
      autoPlay={autoplay}
      controlsList="nodownload"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

const Story = ({ data, index, stories, onLikeStory, onCommentStory }) => {
  const { t } = useTranslation();
  const [showModel, setShowModel] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedID, setSelectedID] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [imgClass, setimgClass] = useState("shimmer");
  let selected = "";
  // let currentIndex = 0;
  let progress = 10;

  useEffect(() => {
    if (selectedID !== undefined) {
      setSelectedStory(stories?.[selectedID]);
    }
  }, [selectedID]);

  const showStoryDetailView = (data, index) => {
    setSelectedID(index);
    selected = "" + index;
    setSelectedStory(data);
    setShowModel(true);
  };

  const hideStoryDetailView = () => {
    setShowModel(false);
    setCurrentIndex(0)
  };

  const fetchData = () => {
    if (selectedID != null) {
      let id = "progressbar_" + selectedID + "_" + currentIndex + "_data";
      let chatbox = document.querySelector("#" + id);
      let totalBars = document.getElementsByClassName(
        "progressbar_" + selectedID
      );

      if (chatbox) {
        if (parseInt(chatbox.style.width) < 100) {
          let newval = parseInt(chatbox.style.width) + 1;
          chatbox.style.width = newval + "%";
        } else {
          if (totalBars.length - 1 > currentIndex) {
            // currentIndex = currentIndex + 1;
            setCurrentIndex(currentIndex + 1)
          } else {
            if (totalBars.length - 1 == currentIndex) {
              // currentIndex = 0;
              setCurrentIndex(0)
              setShowModel(false);
            }
          }
          chatbox.style.width = "0%";
        }
      }
    }

    // chatbox?.style.width = chatbox?.style.width + 10;
  };


  const handleNextStory = () => {
    let id = "progressbar_" + selectedID + "_" + currentIndex + "_data";
      let chatbox = document.querySelector("#" + id);
    chatbox.style.width = 0
    if (currentIndex < selectedStory?.stories?.edges.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if(selectedID < stories?.length - 1) {
        setSelectedID((prev) => Number(prev) + 1)
        setCurrentIndex(0);
      } else {
        setShowModel(false);
      }
    }
  };

  const handlePreviousStory = () => {
    let id = "progressbar_" + selectedID + "_" + currentIndex + "_data";
      let chatbox = document.querySelector("#" + id);
    chatbox.style.width = 0
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      if(selectedID !== 0) {
        setSelectedID((prev) => Number(prev) - 1)
        setCurrentIndex(0);
      } else {
        setShowModel(false);
      }
    }
  };


  useEffect(() => {
    const id = setInterval(fetchData, 100);
    return () => clearInterval(id);
  }, [selectedStory, selectedID, currentIndex]);

  const router = useRouter();

  const renderID = (id) => {
    router.push(`/profile/${id}`);
  };
  return (
    <>
      <Box sx={{ maxWidth: "120px" }}>
        <div
          className="story-container"
          onClick={(e) => showStoryDetailView(data, index)}
        >
          <AvatarWrapper sx={{ position: "absolute" }}>
            {/* {!videoExtensions.test(data?.user?.avatar?.url) ? ( */}
            <Avatar
              src={data?.user?.avatar?.url}
              alt=""
              style={{ width: "45px", height: "45px" }}
            />
            {/* ) : ( */}
            {/* <VideoAvatar>
                <source src={data?.user?.avatar?.url} />
              </VideoAvatar> */}
            {/* )} */}
          </AvatarWrapper>
          {/* {data?.stories?.edges?.map((story, sindex) => (
            <StoryImage src={story?.node?.file} alt="" key={sindex} />
            ))
            } */}
          {/* <StoryImage src={data?.stories?.edges[0]?.node?.file} alt="" /> */}
          {data?.stories?.edges[0]?.node?.file &&
            videoExtensions.test(data.stories.edges[0].node.file) ? (
            <StoryVideo
              className={imgClass}
              onLoadedData={() => setimgClass("")}
              key={data?.stories?.edges[0]?.node?.id}
              autoplay="false"
            >
              <source
                src={data?.stories?.edges[0]?.node?.file}
                type="video/mp4"
              />
            </StoryVideo>
          ) : (
            // <StoryImage src={data?.stories?.edges[0]?.node?.file} alt="" />
            <>
              <Img
                src={data?.stories?.edges[0]?.node?.file}
                alt="story-image"
                height={180}
                width={120}
                style={{
                  height: "100%",
                  width: "100%",
                  borderRadius: "20px",
                  objectFit: "cover",
                  textAlign: "center",
                }}
                key={data?.stories?.edges[0]?.node?.id}
                loader={
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress />
                  </div>
                }
                loading="lazy"
              />
              {/* {isImageLoading && <div
                  style={{
                    display: "flex",
                    height: "100%",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress />
                </div>} */}
            </>
          )}
          <StoryName
            sx={{
              color: "#F3D27A",
              backgroundColor: "#000000b0",
              borderRadius: "0px 0px 20px 20px",
              padding: "3px",
            }}
          >
            {data?.user?.fullName?.slice(0, 13)}
          </StoryName>
        </div>
      </Box>
      {showModel && (
        <div
          className="story_modal"
          key={selectedID}
          style={{ display: "block" }}
        >
          <div className="story_head">
            <div className="progressbar_grp">
              {selectedStory?.stories?.edges?.map((story, sindex) => (
                <div
                  className={"progressbar progressbar_" + selectedID}
                  id={"progressbar_" + selectedID + "_" + sindex}
                >
                  <span
                    id={"progressbar_" + selectedID + "_" + sindex + "_data"}
                    class="sronly"
                    style={{ width: "0%" }}
                  ></span>
                </div>
              ))}
            </div>
            <div className="author">
              <img
                src={selectedStory?.user?.avatar?.url}
                alt="avatar"
                onClick={() => renderID(selectedStory?.user?.id)}
              />
              <div className="txt">
                <span onClick={() => renderID(selectedStory?.user?.id)}>
                  {selectedStory?.user?.fullName?.slice(0, 13)}
                </span>
                <small>
                  {moment
                    .utc(selectedStory?.stories?.edges[0]?.node?.createdDate)
                    .local()
                    .startOf("seconds")
                    .fromNow()}
                </small>
              </div>
            </div>
            <a className="close" onClick={hideStoryDetailView}>
              <img src="/images/close_btn.svg" />
            </a>
          </div>
          <div className="story_mid">
            {/* {Number(selectedID) !== 0 && ( */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "33%",
                  cursor: "pointer",
                  zIndex: 3,
                }}
                onClick={() => {
                  // setSelectedID((prev) => Number(prev) - 1);
                  // setCurrentIndex(currentIndex - 1)
                  handlePreviousStory()
                }}
              >
                <KeyboardArrowLeft
                  fontSize="large"
                  sx={{ color: "white", height: "36px" }}
                />
              </div>
            {/* )} */}
            {/* {selectedID !== stories?.length - 1 && ( */}
            {/* {selectedID < stories?.length - 1 && ( */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "33%",
                  cursor: "pointer",
                  zIndex: 3,
                }}
                onClick={() => {
                  // setSelectedID((prev) => Number(prev) + 1);
                  // setCurrentIndex(currentIndex + 1)
                  handleNextStory()
                }}
              >
                <KeyboardArrowRight
                  fontSize="large"
                  sx={{ color: "white", height: "36px" }}
                />
              </div>
            {/* )} */}
            <Carousel
              controls={false}
              indicators={false}
              className="story_popup"
            >
              <div class="carousel-item active">
                {selectedStory?.stories?.edges[currentIndex]?.node?.file &&
                  videoExtensions.test(selectedStory.stories.edges[currentIndex]?.node.file) ? (
                  <StoryVideoPlayer
                    src={selectedStory.stories.edges[currentIndex]?.node.file}
                    key={selectedStory.stories.edges[currentIndex]?.node.file}
                  />
                ) : (
                  <img
                    src={selectedStory.stories.edges[currentIndex]?.node.file}
                    alt=""
                    key={selectedStory.stories.edges[currentIndex]?.node.file}
                  />
                )}
                <div className="story_foot">
                  <ul>
                    <li
                      onClick={() => onLikeStory?.(selectedStory.stories.edges[currentIndex]?.node?.pk)}
                    >
                      <img src="/images/like_ic.png" />
                      {selectedStory.stories.edges[currentIndex]?.node?.likesCount}
                      <span>{t("home_screen.likes")}</span>
                    </li>
                    <li
                      onClick={() => onCommentStory?.(selectedStory.stories.edges[currentIndex]?.node?.pk)}
                    >
                      <img src="/images/cmnt_ic.png" />
                      {selectedStory.stories.edges[currentIndex]?.node?.commentsCount}
                      <span>{t("home_screen.comments")}</span>
                    </li>
                    <li>
                      <img src="/images/gft_ic.png" /> <span>Send Gift</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      )}
    </>
  );
};

const ShareStoryOptions = ({
  show,
  setShow,
  selected,
  setSelected,
  selectedScheduleDate,
  onScheduleDateSelect,
  onShare,
  isSharing,
}) => {
  const sharingOptionsStyles = show
    ? {
        position: "absolute",
        background: "#000000d1",
        inset: 0,
        borderRadius: "20px",
      }
    : {};

  const ToggleButtonA = () => setSelected(1);
  const ToggleButtonB = () => setSelected(2);
  return (
    <Box sx={sharingOptionsStyles}>
      <ShareOptionsContainer>
        {show ? (
          <Box
            className="texture-01-transparent"
            sx={{ padding: "16px", borderRadius: "20px" }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: "25px", mb: 2 }}>
              Share Option
            </Typography>
            <RadionButtonsContainer>
              <RadionButton
                title="Share Now"
                checked={selected === 1}
                onChange={ToggleButtonA}
              />
              <RadionButton
                title="Share Later"
                checked={selected === 2}
                onChange={ToggleButtonB}
              />
            </RadionButtonsContainer>
            {selected === 2 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "8px",
                }}
              >
                <DesktopDateTimePicker
                  className="date-time-picker"
                  value={selectedScheduleDate}
                  minDateTime={moment()}
                  inputFormat="DD-MM-yyyy HH:mm:ss A"
                  onChange={(val) => {
                    onScheduleDateSelect(val.format());
                  }}
                  ampmInClock
                  renderInput={(params) => <TextField {...params} />}
                  views={[
                    "year",
                    "month",
                    "day",
                    "hours",
                    "minutes",
                    "seconds",
                  ]}
                />
              </div>
            )}
            <button className="global-btn-3" onClick={onShare}>
              {!isSharing ? (
                "SHARE"
              ) : (
                <CircularProgress sx={{ color: "#3A3A3A" }} />
              )}
            </button>
          </Box>
        ) : (
          <button className="global-btn-3" onClick={() => setShow(true)}>
            SHARE
          </button>
        )}
      </ShareOptionsContainer>
    </Box>
  );
};

export const AllMomentsList = ({
  momentData,
  smallScreen = false,
  setIfMomentImage,
  sx,
  setShowMomentImageState,
  setShowFullMomentImageState,
  setMomentPkforComments,
  onLikeMoment,
  onCommentMoment,
  onViewComments,
  onViewLikes,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const renderID = (id) => {
    router.push(`/profile/${id}`);
  };


  return (
    <Box
      className="momentslist"
      sx={{
        height: `calc(100vh)`,
        overflowY: "auto",
        ...sx,
      }}
    >
      {momentData?.map((item) => (
        <MomentContainer className="moment-container">
          <Box
            className={
              smallScreen
                ? "col-12 moment-image-container"
                : "col-lg-6 col-12 moment-image-container"
            }
            sx={{ paddingInline: "4px !important" }}
            // onClick={() => {
            //   setIfMomentImage(item.node.file);
            //   setShowMomentImageState(true);
            // }}
            position={"relative"}
          >
            {item?.node?.file && videoExtensions.test(item.node.file) ? (
              <MomentVideoPlayer src={item.node.file} />
            ) : (
              <>
                {item.node.file && (
                  <img
                    src={item.node.file}
                    width={320}
                    height={320}
                    alt=""
                    className="moment-image"
                  />
                )}
              </>
            )}
            <span className="view-buttons">
              <button
                onClick={() => {
                  if (
                    item?.node?.file &&
                    videoExtensions.test(item.node.file)
                  ) {
                    const videoPlayer = document.getElementById(
                      `video-${item?.node?.file}`
                    );
                    if (!videoPlayer.paused) {
                      videoPlayer.click();
                    }
                  }
                  onViewLikes(item.node.pk);
                  setMomentPkforComments(item.node.pk);
                  setIfMomentImage(item.node.file);
                  setShowMomentImageState(true);
                }}
              >
                <Preview fontSize="small" style={{ fontSize: "20px" }} />
              </button>
              <button
                onClick={() => {
                  if (
                    item?.node?.file &&
                    videoExtensions.test(item.node.file)
                  ) {
                    const videoPlayer = document.getElementById(
                      `video-${item?.node?.file}`
                    );
                    if (!videoPlayer.paused) {
                      videoPlayer.click();
                    }
                  }
                  onViewLikes(item.node.pk);
                  setMomentPkforComments(item.node.pk);
                  setIfMomentImage(item.node.file);
                  setShowFullMomentImageState(true);
                }}
              >
                <Fullscreen fontSize="small" style={{ fontSize: "20px" }} />
              </button>
            </span>
          </Box>
          <Box
            className={smallScreen ? "col-12" : "col-lg-6 col-12"}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingInline: "4px !important",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                  <AvatarWrapper sx={{ margin: 0 }}>
                    {/* <Avatar src="/images/model24.png" alt="" sx={{ height: 45, width: 45, maxHeight: 45, maxWidth: 45 }} /> */}
                    {/* <Avatar
                      src={item?.node?.user?.avatar?.url}
                      alt="avatar"
                      onClick={() => renderID(item?.node?.user?.id)}
                    /> */}
                    {/* {!videoExtensions.test(item?.node?.user?.avatar?.url) ? ( */}
                      <Avatar
                        src={item?.node?.user?.avatar?.url}
                        alt=""
                        style={{ width: "45px", height: "45px" }}
                      />
                    {/* ) : ( */}
                      {/* <VideoAvatar autoPlay>
                        <source src={item?.node?.user?.avatar?.url} />
                      </VideoAvatar> */}
                    {/* )} */}
                  </AvatarWrapper>
                  <Typography className="moment-heading">
                    <span
                      style={{ color: "#DEBC63" }}
                      onClick={() => renderID(item?.node?.user?.id)}
                    >
                      {item?.node?.user?.fullName}{" "}
                    </span>
                    <span style={{ color: "#ffffff" }}>
                      {t("home_screen.has_a_shared_a_moment")}.
                    </span>
                    <section>
                      {moment
                        .utc(item?.node?.createdDate)
                        .local()
                        .startOf("seconds")
                        .fromNow()}
                    </section>
                  </Typography>
                </Box>
                <img alt="Menu" src="/images/threeDotsMenuIcon.svg" />
              </Box>

              <Box className="moment-content">
                {item?.node?.momentDescription}
              </Box>
            </Box>
            <MomentResponsesBar>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: "20px" }}>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#EECD76",
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <img
                      src="/images/heartIcon.svg"
                      alt=""
                      height="20px"
                      width="20px"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        onLikeMoment?.(item.node.pk);
                      }}
                    />
                    <span>{item?.node?.like}</span>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#EECD76",
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <img
                      src="/images/messageIcon.svg"
                      alt=""
                      height="20px"
                      width="20px"
                      style={{ cursor: "pointer" }}
                      // onClick={() => {
                      //   onCommentMoment?.(item.node.pk);
                      // }}
                      onClick={() => {
                        if (
                          item?.node?.file &&
                          videoExtensions.test(item.node.file)
                        ) {
                          const videoPlayer = document.getElementById(
                            `video-${item?.node?.file}`
                          );
                          if (!videoPlayer.paused) {
                            videoPlayer.click();
                          }
                        }
                        setMomentPkforComments(item.node.pk);
                        setIfMomentImage(item.node.file);
                        setShowMomentImageState(true);
                      }}
                    />
                    <span>{item?.node?.comment}</span>
                  </Typography>
                </Box>
                <img
                  src="/images/giftIcon.svg"
                  alt=""
                  height="20px"
                  width="20px"
                  className="gift-icon"
                />
              </Box>
              {item?.node?.like > 0 && (
                <Typography
                  sx={{
                    fontFamily: "Roboto",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#ffffff60",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    onViewLikes?.(item?.node?.pk);
                    setMomentPkforComments(item.node.pk);
                    setIfMomentImage(item.node.file);
                    setShowMomentImageState(true);
                  }}
                >
                  {t("home_screen.view_likes")}
                </Typography>
              )}
              {item?.node?.comment > 0 && (
                <Typography
                  sx={{
                    fontFamily: "Roboto",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#ffffff60",
                    cursor: "pointer",
                  }}
                  // onClick={() => {
                  //   onViewComments?.(item?.node?.pk);
                  // }}
                  onClick={() => {
                    if (
                      item?.node?.file &&
                      videoExtensions.test(item.node.file)
                    ) {
                      const videoPlayer = document.getElementById(
                        `video-${item?.node?.file}`
                      );
                      if (!videoPlayer.paused) {
                        videoPlayer.click();
                      }
                    }
                    setMomentPkforComments(item.node.pk);
                    setIfMomentImage(item.node.file);
                    setShowMomentImageState(true);
                  }}
                >
                  {t("home_screen.view_all_comments")}
                </Typography>
              )}
            </MomentResponsesBar>
          </Box>
        </MomentContainer>
      ))}
    </Box>
  );
};
export const ViewMoment = ({ image, setImage }) => {
  return (
    <SelectedImagePreview className="selected-story-image-preview">
      <CircledCrossIcon
        sx={{ right: 20, padding: "2px", zIndex: 999 }}
        onClick={() => {
          setImage(null);
        }}
      />
      <Box sx={{ height: "96vh", position: "relative" }}>
        {/* <img src={image} alt="image" style={{ height: '100%', borderRadius: '20px' }} /> */}
        {image?.includes("image") || !videoExtensions.test(image) ? (
          <img
            src={image}
            alt="image"
            style={{ height: "100%", borderRadius: "20px" }}
          />
        ) : (
          <video
            className="image-preview"
            controls
            autoPlay
            style={{ height: "100%", borderRadius: "20px" }}
          >
            <source src={image}></source>
          </video>
        )}
      </Box>
    </SelectedImagePreview>
  );
};
// ============= Main =============
const HomeScreen = ({ setCurrentScreen, userData, userStoryMomentList }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedShareOption, setSelectedShareOption] = useState(1);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(moment());
  const [showMomentImage, setShowMomentImage] = useState(null);
  const [ifMomentImage, setIfMomentImage] = useState(null);
  const [showMomentImageState, setShowMomentImageState] = useState(false);
  const [showFullMomentImageState, setShowFullMomentImageState] =
    useState(false);
  const [momentPkforComments, setMomentPkforComments] = useState();
  const [showComment, setShowComment] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const [showLikes, setShowLikes] = useState(false);
  const [momentPkforLikes, setMomentPkforLikes] = useState(null);

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentDescription, setCommentDescription] = useState("");

  const [storyPkforComments, setStoryPkforComments] = useState(null);

  const [userId, setUserId] = useState();

  const [
    getAllUserStories,
    {
      data: userStories,
      error: userStoriesError,
      loading: userStoriesLoading,
      refetch: refetchData,
    },
  ] = useLazyQuery(GET_ALL_USER_STORIES);

  const [getAllUserMoments, { data, error, loading, refetch }] =
    useLazyQuery(GET_ALL_USER_MOMENTS);

  const [getMomentComments, { data: commentsData, refetch: refetchComments }] =
    useLazyQuery(GET_MOMENT_COMMENTS);

  const [
    getStoryComments,
    { data: storyCommentsData, refetch: refetchStoryComments },
  ] = useLazyQuery(GET_STORY_COMMENTS);

  const [getMomentLikes, { data: momentLikesData }] =
    useLazyQuery(GET_MOMENT_LIKES);

  useEffect(() => {
    getAllUserStories();
    getAllUserMoments();
  }, []);

  useEffect(() => {
    if (momentPkforComments) {
      getMomentComments({
        variables: {
          pk: momentPkforComments,
        },
      });
    }
  }, [momentPkforComments]);

  useEffect(() => {
    if (storyPkforComments) {
      getStoryComments({
        variables: {
          momentId: storyPkforComments,
        },
      });
    }
  }, [storyPkforComments]);

  useEffect(() => {
    if (momentPkforLikes) {
      getMomentLikes({
        variables: {
          pk: momentPkforLikes,
        },
      });
    }
  }, [momentPkforLikes]);

  const fetchData = () => {
    refetch();
    refetchData();
  };

  useEffect(() => {
    if (!userId) {
      // Retrieve userId from localStorage on component mount only
      const id = localStorage.getItem("userId");
      setUserId(id || "");
    }
  }, [data, loading, userStories, userStoriesLoading]);

  if (userStoriesLoading || loading)
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          height: "calc(100vh - 52px)",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );

  let momentData = data?.allUserMoments?.edges;
  let userStoriesData = userStories?.allUserMultiStories;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      // Update state with the data URL of the selected image
      setSelectedImage(e.target.result);
    };

    reader.onerror = (error) => {
      // Handle errors that occur during file reading
      console.error("File reading error:", error);
    };

    // Read the file as a data URL
    reader.readAsDataURL(selectedFile);

    console.log("Selected File:", selectedFile);
    // image = selectedFile;
    setFile(selectedFile);
  };

  const ShareStoryHandler = async () => {
    if (!file) {
      console.error("Please fill in all fields");
      return;
    }
    setIsSharing(true);
    console.log("file", file);
    console.log("userId", userId);
    if (selectedShareOption === 1) {
      try {
        // Call the shareStory mutation
        const result = await clientUpload.mutate({
          mutation: SHARE_STORY_MUTATION,
          variables: {
            file: file,
            // moderatorId: userId,
          },
        });

        if (result?.data?.insertStory?.story?.id) {
          setIsSharing(false);
          setSelectedImage(null);
          setShow(false);
          fetchData();
        }
      } catch (error) {
        console.error("Error ShareStory:", error?.message);
        setIsSharing(false);
        setSelectedImage(null);
        setShow(false);
        alert(error?.message);
        fetchData();
      }
    } else {
      try {
        // Call the shareStory mutation
        const result = await clientUpload.mutate({
          mutation: SCHEDULE_STORY_MUTATION,
          variables: {
            file: file,
            publishAt: selectedScheduleDate,
            // moderatorId: userId,
          },
        });

        if (result?.data?.insertStory?.story?.id) {
          setIsSharing(false);
          setSelectedImage(null);
          setShow(false);
          setSelectedScheduleDate(null);
          fetchData();
        }
      } catch (error) {
        console.error("Error ShareStory:", error?.message);
        setIsSharing(false);
        setSelectedImage(null);
        setShow(false);
        alert(error?.message);
        fetchData();
      }
    }
  };

  const handleLikeMoment = async (momentId) => {
    try {
      const response = await clientUpload.mutate({
        mutation: MOMENT_LIKE_MUTATION,
        variables: {
          momentId,
        },
      });

      console.log(response, "Response Like Moment");
      fetchData();
    } catch (error) {
      console.log(error, "Error");
      alert(error?.message);
    }
  };

  const handleViewLikes = (momentId) => {
    // setShowLikes(true);
    setMomentPkforLikes(momentId);
  };

  const handleViewComments = (momentId) => {
    setShowCommentsModal(true);
    setMomentPkforComments(momentId);
  };

  // const handleCommentMoment = (momentId) => {
  //   setMomentPkforComments(momentId);
  //   setShowCommentsModal(true);
  // };

  const handleCommentStory = (objectId) => {
    setStoryPkforComments(objectId);
    setShowCommentsModal(true);
  };

  const handleSendComment = async () => {
    try {
      if (commentDescription) {
        const response = await clientUpload.mutate({
          mutation: storyPkforComments
            ? STORY_COMMENT_MUTATION
            : MOMENT_COMMENT_MUTATION,
          variables: {
            momentId: storyPkforComments
              ? Number(storyPkforComments)
              : momentPkforComments,
            commentDescription,
          },
        });

        console.log(response, "Response Comment Moment");
        setCommentDescription("");
        if (storyPkforComments) {
          refetchStoryComments({
            momentId: storyPkforComments,
          });
        } else {
          refetchComments({
            pk: momentPkforComments,
          });
        }
      } else {
        alert("Please enter comment first.");
      }
    } catch (error) {
      console.log(error, "Error");
      alert(error?.message);
    }
  };

  const handleLikeStory = async (objectId) => {
    try {
      const response = await clientUpload.mutate({
        mutation: STORY_LIKE_MUTATION,
        variables: {
          objectId,
        },
      });

      console.log(response, "Response Like Story");
      // if (response.data) {
      //   alert(response?.data?.genericLike?.message);
      // }
      refetchData();
    } catch (error) {
      console.log(error, "Error");
      alert(error?.message);
    }
  };

  const shareOptionProps = {
    show,
    setShow,
    selected: selectedShareOption,
    setSelected: setSelectedShareOption,
    onShare: ShareStoryHandler,
    selectedScheduleDate,
    onScheduleDateSelect: setSelectedScheduleDate,
    isSharing,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <StoriesContainer>
        <AddStory
          userData={userData}
          setCurrentScreen={setCurrentScreen}
          handleFileChange={handleFileChange}
          userStoryMomentList={userStoryMomentList}
          labelText={t("home_screen.add_story")}
        />
        <Box
          sx={{
            display: "flex",

            "@media screen and (min-width: 1700px)": {
              gap: "2.2rem",
            },
            "@media screen and (max-width: 1600px)": {
              gap: "0.22rem",
            },
          }}
        >
          {userStories?.allUserMultiStories?.map((item, index) => (
            <Story
              data={item}
              index={index}
              stories={userStories?.allUserMultiStories}
              onLikeStory={handleLikeStory}
              onCommentStory={handleCommentStory}
            />
          ))}
        </Box>
      </StoriesContainer>

      <AllMomentsList
        momentData={momentData}
        setIfMomentImage={setIfMomentImage}
        setShowMomentImageState={setShowMomentImageState}
        setShowFullMomentImageState={setShowFullMomentImageState}
        setMomentPkforComments={setMomentPkforComments}
        onLikeMoment={handleLikeMoment}
        onViewLikes={handleViewLikes}
        onViewComments={handleViewComments}
        // onCommentMoment={handleCommentMoment}
      />

      {(selectedImage || showMomentImage) && (
        <SelectedImagePreview className="selected-story-image-preview">
          <CircledCrossIcon
            sx={{ right: 20, padding: "2px", zIndex: 999 }}
            onClick={() => {
              setSelectedImage(null);
              setShow(false);
            }}
          />
          <Box sx={{ height: "96vh", position: "relative" }}>
            {selectedImage?.includes("image") ||
            (showMomentImage && !videoExtensions.test(showMomentImage)) ? (
              <img
                src={selectedImage || showMomentImage}
                alt="selectedImage"
                style={{ height: "100%", borderRadius: "20px" }}
              />
            ) : (
              <video
                className="image-preview"
                controls
                autoPlay
                style={{ height: "100%", borderRadius: "20px" }}
              >
                <source src={selectedImage || showMomentImage}></source>
              </video>
            )}

            {!showMomentImage && <ShareStoryOptions {...shareOptionProps} />}
          </Box>
        </SelectedImagePreview>
      )}

      {/* <ViewModal
        open={showLikes}
        onClose={() => {
          setShowLikes(false);
          setMomentPkforLikes(null);
        }}
      >
        <div className="likes-container">
          <h5
            style={{
              textAlign: "center",
              textDecoration: "underline",
              fontWeight: "bolder",
            }}
          >
            Likes
          </h5>
          <div className="likes">
            {momentLikesData?.getMomentLikes?.map((like) => (
              <Link
                href={`/profile/${like?.user?.id}`}
                style={{ width: "100%" }}
              >
                <div className="like-item">
                  <Avatar src={like?.user?.avatarPhotos?.[0].url} />
                  <span>{like?.user?.fullName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ViewModal> */}

      <ViewModal
        open={showCommentsModal}
        onClose={() => {
          setShowCommentsModal(false);
          setMomentPkforComments(null);
          setStoryPkforComments(null);
          fetchData();
        }}
      >
        <div className="comments-container">
          <h5
            style={{
              textAlign: "center",
              textDecoration: "underline",
              fontWeight: "bolder",
            }}
          >
            {t("home_screen.comments")}
          </h5>
          <div className="comments">
            {(storyPkforComments
              ? storyCommentsData?.allStoryComments
              : commentsData?.getMomentComments
            )?.map((comment) => (
              <>
                {comment && (
                  <div className="comment">
                    <span className="user-info">
                      <Avatar src={comment?.user?.avatarPhotos[0]?.url} />
                      <span>{comment?.user?.fullName}</span>
                    </span>
                    <span className="comment-desc">
                      <span>{comment?.commentDescription}</span>{" "}
                      <span className="comment-time">
                        {new Date(comment?.createdDate).toLocaleString(
                          "en-US",
                          {
                            dateStyle: "medium",
                            timeStyle: "medium",
                          }
                        )}
                      </span>
                    </span>
                  </div>
                )}
              </>
            ))}
          </div>

          <div className="comment-input-wrapper">
            <Avatar src={userData?.user?.avatarPhotos?.[0]?.url} />
            <input
              className="comment-input"
              placeholder={t("home_screen.add_comment")}
              value={commentDescription}
              onChange={(e) => {
                setCommentDescription(e.target.value);
              }}
            />
            <SendRounded
              style={{
                backgroundColor: "gold",
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                padding: "5px",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
              onClick={handleSendComment}
            />
          </div>
        </div>
      </ViewModal>

      <ViewModal
        open={showMomentImageState}
        onClose={() => {
          setShowMomentImageState(false);
          setIfMomentImage(null);
          setMomentPkforComments(null);
          setMomentPkforLikes(null);
          fetchData();
        }}
      >
        <div
          className="gift_image_preview_modal_image"
          data-testid="image_modal"
        >
          {ifMomentImage && !videoExtensions.test(ifMomentImage) ? (
            <img src={ifMomentImage} width={"55%"} height={"auto"} />
          ) : (
            <>
              {ifMomentImage && (
                <video
                  controls={true}
                  muted={true}
                  loop
                  autoPlay={true}
                  controlsList="nodownload"
                >
                  <source src={ifMomentImage} type="video/mp4" />
                </video>
              )}
            </>
          )}
        </div>
        {/* {showComment && ( */}
        <div className="moment-likes">
          <h4
            style={{
              textAlign: "center",
              borderBottom: "1px solid white",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {t("home_screen.likes") + " "}
            <span style={{ fontSize: "20px" }}>
              ({momentLikesData?.getMomentLikes?.length})
            </span>
          </h4>
          <div className="user-likes">
            {momentLikesData?.getMomentLikes?.map((like) => (
              <Link
                href={`/profile/${like?.user?.id}`}
                style={{ width: "100%" }}
              >
                <div className="like-item">
                  <Avatar src={like?.user?.avatarPhotos?.[0].url} />
                  <span>{like?.user?.fullName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="moment-comments">
          <h4
            style={{
              textAlign: "center",
              borderBottom: "1px solid white",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {t("home_screen.comments") + " "}
            <span style={{ fontSize: "20px" }}>
              ({commentsData?.getMomentComments.length})
            </span>
          </h4>
          {commentsData?.getMomentComments.length ? (
            <div className="user-comments">
              {commentsData?.getMomentComments?.map((comment) => (
                <>
                  {comment && (
                    <div className="comment">
                      <Link href={`/profile/${comment?.user?.id}`}>
                        <span className="user-info">
                          <Avatar src={comment?.user?.avatarPhotos[0]?.url} />
                          <span>{comment?.user?.fullName}</span>
                        </span>
                      </Link>
                      <span className="comment-desc">
                        <span>{comment?.commentDescription}</span>{" "}
                        <span className="comment-time">
                          {new Date(comment?.createdDate).toLocaleString(
                            "en-US",
                            {
                              dateStyle: "medium",
                              timeStyle: "medium",
                            }
                          )}
                        </span>
                      </span>
                    </div>
                  )}
                </>
              ))}
            </div>
          ) : (
            <p className="no-comments">{t("home_screen.no_comments")}</p>
          )}
          <div className="comment-input-wrapper">
            <Avatar src={userData?.user?.avatarPhotos?.[0]?.url} />
            <input
              className="comment-input"
              placeholder={t("home_screen.add_comment")}
              value={commentDescription}
              onChange={(e) => {
                setCommentDescription(e.target.value);
              }}
            />
            <SendRounded
              style={{
                backgroundImage: "linear-gradient(-90deg, #af9040, #FDDD86)",
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                padding: "5px",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
              onClick={handleSendComment}
            />
          </div>
        </div>
        {/* )} */}
        {/* <button
          style={{
            all: "unset",
            position: "absolute",
            bottom: "10px",
            left: "10px",
            zIndex: "3",
            borderRadius: "6px",
            background: "white",
            cursor: "pointer",
            fontSize: "14px",
            padding: "6px 12px",
          }}
          onClick={() => setShowComment(!showComment)}
        >
          {showComment ? "Hide Comments" : "Show Comments"}
        </button> */}
      </ViewModal>

      <FullScreenViewModal
        open={showFullMomentImageState}
        onClose={() => {
          setIfMomentImage(null);
          setShowFullMomentImageState(false);
          setMomentPkforComments(null);
          setMomentPkforLikes(null);
          fetchData();
        }}
      >
        <div
          className="full_gift_image_preview_modal_image"
          data-testid="full_image_modal"
        >
          {ifMomentImage && !videoExtensions.test(ifMomentImage) ? (
            <img src={ifMomentImage} width={"55%"} height={"auto"} />
          ) : (
            <>
              {ifMomentImage && (
                <video
                  controls={true}
                  muted={true}
                  loop
                  autoPlay={true}
                  controlsList="nodownload"
                >
                  <source src={ifMomentImage} type="video/mp4" />
                </video>
              )}
            </>
          )}
        </div>
        <div className="moment-likes">
          <h4
            style={{
              textAlign: "center",
              borderBottom: "1px solid white",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            Likes{" "}
            <span style={{ fontSize: "20px" }}>
              ({momentLikesData?.getMomentLikes?.length})
            </span>
          </h4>
          <div className="user-likes">
            {momentLikesData?.getMomentLikes?.map((like) => (
              <Link
                href={`/profile/${like?.user?.id}`}
                style={{ width: "100%" }}
              >
                <div className="like-item">
                  <Avatar src={like?.user?.avatarPhotos?.[0].url} />
                  <span>{like?.user?.fullName}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* {showComment && ( */}
        <div className="moment-comments">
          <h4
            style={{
              textAlign: "center",
              borderBottom: "1px solid white",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {t("home_screen.comments") + " "}
            <span style={{ fontSize: "20px" }}>
              ({commentsData?.getMomentComments.length})
            </span>
          </h4>
          {commentsData?.getMomentComments.length ? (
            <div className="user-comments">
              {commentsData?.getMomentComments?.map((comment) => (
                <div className="comment">
                  <Link href={`/profile/${comment?.user?.id}`}>
                    <span className="user-info">
                      <Avatar src={comment?.user?.avatarPhotos[0]?.url} />
                      <span>{comment?.user?.fullName}</span>
                    </span>
                  </Link>
                  <span className="comment-desc">
                    <span>{comment?.commentDescription}</span>{" "}
                    <span className="comment-time">
                      {new Date(comment?.createdDate).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "medium",
                      })}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments">{t("home_screen.no_comments")}</p>
          )}
          <div className="comment-input-wrapper">
            <Avatar src={userData?.user?.avatarPhotos?.[0]?.url} />
            <input
              className="comment-input"
              placeholder={t("home_screen.add_comment")}
              value={commentDescription}
              onChange={(e) => {
                setCommentDescription(e.target.value);
              }}
            />
            <SendRounded
              style={{
                backgroundImage: "linear-gradient(-90deg, #af9040, #FDDD86)",
                height: "40px",
                width: "40px",
                borderRadius: "50%",
                padding: "5px",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
              onClick={handleSendComment}
            />
          </div>
        </div>
        {/* )} */}
        {/* <button
          style={{
            all: "unset",
            position: "absolute",
            bottom: "10px",
            left: "10px",
            zIndex: "3",
            borderRadius: "6px",
            background: "white",
            cursor: "pointer",
            fontSize: "14px",
            padding: "6px 12px",
          }}
          onClick={() => setShowComment(!showComment)}
        >
          {showComment ? "Hide Comments" : "Show Comments"}
        </button> */}
      </FullScreenViewModal>
    </Box>
  );
};

export default HomeScreen;
