import HMACObj from "hmac-obj";
import config from "../config";
import {
  IMG_EXTENSIONS,
  USER_NAME_ELLIPSIS,
  VIDEO_EXTENSIONS,
} from "./constant";

export const googlePlayStoreImage = () => {};

export const generateAppsecretProof = async (token) => {
  const appsecret_proof = await HMACObj.new(
    config.facebooksecreateKey,
    token,
    "SHA-256"
  );
  if (appsecret_proof) {
    return appsecret_proof.hexdigest();
  }
  return "";
};

export const getEllipsisText = (text) => {
  return text.length > USER_NAME_ELLIPSIS
    ? text.substring(0, USER_NAME_ELLIPSIS - 3) + "..."
    : text;
};

export const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("position", position);
        localStorage.setItem("lat", position.coords.latitude);
        localStorage.setItem("long", position.coords.longitude);
      },
      (error) => {
        console.log(error);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};

export const isImageUrl = (url) => {
  for (let i = 0; i < IMG_EXTENSIONS.length; i++) {
    const imgType = IMG_EXTENSIONS[i];
    if (String(url).toLowerCase().includes(`.${imgType}`)) {
      return true;
    }
  }
  return false;
};

export const isVideoUrl = (url) => {
  return VIDEO_EXTENSIONS.some((videoType) => String(url).includes(videoType));
};

export const localePostfix_gql = (locale) => {
  if (locale === "en") return "";
  else if (locale?.length && locale.length === 5)
    return (
      locale[0].toUpperCase() + locale[1] + locale[3].toUpperCase() + locale[4]
    );
  else if (locale?.length && locale.length === 2)
    return locale[0].toUpperCase() + locale[1];

  return "";
};
