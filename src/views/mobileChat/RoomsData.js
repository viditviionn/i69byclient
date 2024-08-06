import { gql, useLazyQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useRouter } from "next/router";

const ROOMS_QUERY = gql`
  query room($id: ID) {
    room(id: $id) {
      messageSet {
        edges {
          node {
            content
            timestamp
          }
        }
      }
      target {
        fullName
        avatarPhotos {
              url
            }
      }
      userId {
        fullName
      }
    }
  }
`;

const RoomsData = ({userData}) => {
  const [room, setRoom] = useState();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const roomId = localStorage.getItem("roomId");
      setRoom(roomId);
    }
    refetch();
  }, [room]);

  const [getRoomsData, { data, refetch }] =
    useLazyQuery(ROOMS_QUERY);

  useEffect(() => {
    if (room) {
      getRoomsData({
        variables: {
          id: room,
        },
      });
    }
  }, [room]);
console.log("data",data);
  return (
    <>
      <div  className="roomDataDiv">
        <ArrowBackOutlinedIcon sx={ {color :"black"}} onClick= { () => router.push("/chat")}/>
      <Avatar
                    sizes="small"
                    alt="user-avatar"
                    src={data?.room?.target?.avatarPhotos[0]?.url}
                    sx={{ cursor: "pointer"  }}
                    className="AvatarForMobile"
                  />
                  
        <h4 style={{ color: "black" , position:"relative" , top : "4.2px" }}>{data?.room?.target?.fullName}</h4>
        {/* <Avatar
                    sizes="small"
                    alt="user-avatar"
                    src={userData?.user?.avatarPhotos[0]?.url}
                    sx={{ cursor: "pointer" }}
                  /> */}
      </div>
    </>
  );
};

export default RoomsData;
