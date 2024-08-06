import { useRouter } from "next/router";
import { Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosConfig from "../../common/axiosConfig";
import dynamic from "next/dynamic";
const SignInFailedModal = dynamic(() =>
  import("../../components/commons/CustomModal")
);

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Please enter your email"),
});

const LoginStepOne = ({
  handleLoginOneSuccessRes,
  checkEmailExists,
  emailExists,
  isCheckEmailLoading,
  isDeletedProfile,
}) => {
  const { t } = useTranslation();
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isShownSignInErrorModal, setShownSignInErrorModal] = useState(false);
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSignInErrorButton = () => {
    setShownSignInErrorModal(false);
    router.push("/contactUs");
    localStorage.setItem("isErrorSignInPage", true);
  };

  const onSubmit = async (data) => {
    if (isDeletedProfile) {
      setShownSignInErrorModal(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosConfig.post(
        emailExists ? "api/user/email-login/" : "api/user/email-signup/",
        { email: data.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response.status === 200) {
        handleLoginOneSuccessRes(data.email, response.data);
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      setLoading(false);
      setApiErrorMessage(
        error.response.data.error ?? "Something went to wrong."
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          id="email"
          type="text"
          name="email"
          placeholder={t("Home.labelEmail")}
          class={`form-control form-control-sm border ${
            errors.email && "border-danger"
          }`}
          {...register("email", {
            onBlur: (e) => {
              setApiErrorMessage("");
              checkEmailExists(e.target.value);
            },
            onChange: (e) => setApiErrorMessage(""),
          })}
        />
        {errors.email && (
          <p class="text-danger position-absolute">{errors.email.message}</p>
        )}
        {apiErrorMessage && (
          <p class="text-danger position-absolute">{apiErrorMessage}</p>
        )}

        <button
          disabled={isLoading || isCheckEmailLoading}
          type="submit"
          class="btn btn-primary form-control form-control-sm mt-4"
          data-mdb-ripple-init
        >
          {emailExists ? `Next` : `Sign up`}
        </button>
      </form>
      {isShownSignInErrorModal && (
        <SignInFailedModal
          handleActionButton={handleSignInErrorButton}
          buttonLabel={"Ok"}
        >
          <Typography
            style={{
              fontSize: "16px",
              textAlign: "center",
              color: "black",
              marginTop: "24px",
            }}
          >
            Sign In Failed! You have deleted your profile. Please contact us to
            re-join.
          </Typography>
        </SignInFailedModal>
      )}
    </>
  );
};

export default LoginStepOne;
