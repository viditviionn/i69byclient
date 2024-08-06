import { gql, useSubscription } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { formatTime } from '../../common/formatTime';
import { Avatar } from '../Home2';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { ChatVideoPlayer } from '../Home';

const NEW_MESSEGE = gql`
subscription onNewMessege($roomId:Int!,$token:String){
    onNewMessage(roomId:$roomId,token:$token){
        message{
            content
            timestamp
          }
        
    }
  }
`

const IncomingChat = ({ roomId, incomingMessages }) => {
  const roomIdAsInt = Number(roomId);
  const [getToken, setGetToken] = useState();
  const [videoUrlState, setVideoUrlState] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [giftImage, setGiftImage] = useState(null);
  const [showGiftDetails, setShowGiftDetails] = useState(false);

  useEffect(() => {
    // Retrieve token from localStorage on component mount
    const token = localStorage.getItem('token');
    setGetToken(token || '');
  }, []);


  const { data, error, loading } = useSubscription(NEW_MESSEGE, {
    variables: {
      roomId: roomIdAsInt,
      token: getToken
    }
  })

  const showGiftDetailView = (image) => {
    setGiftImage(image);
    setShowGiftDetails(true);
  };

console.log(  showGiftDetails ,"!!")

  //  useEffect(()=>{

  //     console.log(data)

  //  },[data])

  const { content, timestamp } = data?.onNewMessage?.message || {};



  const hideGiftDetail = () => {
    setShowGiftDetails(false);
  };

  return (
    <>
      {incomingMessages && incomingMessages.length > 0 && incomingMessages.map((item, index) => (
           <div key={index} className="msg-left">
           <div className="bubble-2">
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
              {
                 showGiftDetails  && 
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
             <small className="text-right w-100">
               {formatTime(item?.node?.timestamp)}
             </small>
           </div>
         </div>
      ))}
    </>
  )
}

export default IncomingChat
