import { gql, useLazyQuery } from "@apollo/client";
import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../layouts/Navbar";
import Checkbox from "@mui/material/Checkbox";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";
import NotificationIcon from "../../../public/images/notificationIcon.svg";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { localePostfix_gql } from "../../common/utils";

const USER_INTERESTS_QUERY = (locale) => gql`
  query UserInterests {
    userInterests {
      id
      categoryName
      createdAt
      strName : strName${localePostfix_gql(locale)}
    }
  }
`;

const icons = {
  SERIOUS_RELATIONSHIP: "goldenHeart",
  CAUSAL_DATING: "datingIcon",
  NEW_FRIENDS: "emojiIcon",
  ROOM_MATES: "keyIcon",
  BUSINESS_CONTACTS: "dollarIcon",
};

const genderPickerData = [
  { title: "MAN", value: 1, iconName: "manSymbolicIcon", iconSize: 50 },
  { title: "WOMAN", value: 2, iconName: "womanSymbolicIcon", iconSize: 50 },
  { title: "BOTH", value: 3, iconName: "bothGenderIcon", iconSize: 50 },
];

const CustomCheckbox = ({ selectedValue, currentValue, onChange, sx }) => {
  // console.log("selectedValue",selectedValue);
  // console.log("currentValue",currentValue);
  return (
    <Checkbox
      checked={selectedValue === currentValue}
      sx={{
        "& .MuiSvgIcon-root": { fontSize: 28 },
        color: "#FFD778",
        "&.Mui-checked": {
          color: "#FFD778",
        },
        height: "40px",
        width: "40px",
        position: "absolute",
        top: 0,
        ...sx,
      }}
      icon={<RadioButtonUncheckedIcon />}
      checkedIcon={<CheckCircleIcon />}
      onChange={() => onChange(currentValue)}
    />
  );
};

const InterestedInSection = ({ interestsPickerHandler }) => {
  const { locale } = useRouter();
  const { t } = useTranslation();
  const [gender, setGender] = useState(1);
  const [relationValue, setRelationValue] = useState("");

  const isSmallScreen = useMemo(
    () => Boolean(window?.innerWidth < 600),
    [window?.innerWidth]
  );

  const [
    getUserInterestsData,
    { data: userInterestsData, loading: userInterestsLoading },
  ] = useLazyQuery(USER_INTERESTS_QUERY(locale));

  useEffect(() => {
    getUserInterestsData();
  }, []);

  // console.log("userInterests", userInterestsData?.userInterests);
  if (userInterestsLoading)
    return (
      <div className="loading-screen">
        <CircularProgress />
      </div>
    );

  const relationPickHandler = (value) => {
    // console.log('value', value);
    setRelationValue(value);
  };
  const genderPickerHandler = (value, id) => {
    // console.log('value', value);
    setGender(1);
    setRelationValue("");
    interestsPickerHandler({ relationValue, gender: value });
  };

  const GenderPickerTooltip = ({ interestsItem, children }) => {
    const specialIndexes =
      interestsItem !== "SERIOUS_RELATIONSHIP" &&
      interestsItem !== "CAUSAL_DATING";
    return (
      <Tooltip
        title={
          <Box
            sx={{
              display: "grid",
              width: "100%",
              gap: isSmallScreen ? 1 : 3,
            }}
          >
            <Typography
              sx={{
                color: "#FFD778",
                textTransform: "uppercase",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "30px",
              }}
            >
              {t("edit_profile.gender")}
            </Typography>
            {genderPickerData?.map(
              (item, index) =>
                (index !== genderPickerData.length - 1 || specialIndexes) && (
                  <Typography
                    className="gender-picker"
                    key={item.title}
                    sx={{
                      backgroundColor:
                        gender === item.title ? "#1F2430" : "#1F243080",
                    }}
                    onClick={() => genderPickerHandler(item.value)}
                  >
                    <img
                      src={`/images/${item.iconName}.svg`}
                      width={isSmallScreen ? 30 : item.iconSize}
                    />
                    <span
                      style={{ fontSize: isSmallScreen ? "22px" : "inherit" }}
                    >
                      {t(`edit_profile.${item?.title?.toLowerCase()}`)}
                    </span>
                    {gender === item.value && (
                      <CustomCheckbox
                        selectedValue={gender}
                        currentValue={item.value}
                        onChange={genderPickerHandler}
                        sx={{ right: 0 }}
                      />
                    )}
                  </Typography>
                )
            )}
          </Box>
        }
        componentsProps={{
          tooltip: {
            sx: {
              borderRadius: 2.5,
              backgroundColor: "#185765",
              ...(isSmallScreen
                ? {}
                : { px: 6, py: 3, width: "100%", minWidth: "500px" }),
            },
          },
          arrow: {
            sx: {
              color: "#1F243080",
            },
          },
        }}
        open={interestsItem === relationValue}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        placement={isSmallScreen ? "bottom-end" : "right-start"}
        arrow
      >
        {children}
      </Tooltip>
    );
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="header-control header-gold interests-header">
        <Typography
          sx={{
            margin: "auto",
            color: "#070707",
            fontSize: "22px",
            fontWeight: 600,
            fontFamily: "Open Sans",
            textTransform: "uppercase",
          }}
        >
          {t("edit_profile.interested_in")}
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
      <Box
        className="texture-02 interested-in-container"
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: relationValue ? "start" : "center",
        }}
      >
        {userInterestsData?.userInterests?.map((item) => (
          <GenderPickerTooltip
            key={`gender-picker-${item.categoryName}`}
            interestsItem={item.categoryName}
          >
            <Box
              onClick={() => relationPickHandler(item.categoryName)}
              className="relation-picker"
              key={item.categoryName}
            >
              <img
                src={`/images/${icons[item.categoryName]}.svg`}
                width="60px"
              />
              <Typography
                sx={{
                  color: "#FFD778",
                  fontSize: "30px",
                  fontWeight: 700,
                  paddingLeft: "4px",
                  flex: 1,
                }}
              >
                {item?.strName}
              </Typography>
              <Box
                className="relation-picker-icons"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CustomCheckbox
                  selectedValue={relationValue}
                  currentValue={item.categoryName}
                  onChange={relationPickHandler}
                />
                <img src="/images/arrowRightIcon.svg" alt="arrow" />
              </Box>
            </Box>
          </GenderPickerTooltip>
        ))}
      </Box>
    </>
  );
};

export default InterestedInSection;
