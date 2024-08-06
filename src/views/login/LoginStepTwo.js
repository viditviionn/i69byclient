import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosConfig from "../../common/axiosConfig";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Please enter your email"),
  code: Yup.number()
    .typeError("Only numeric values are allowed")
    .required("Number is required")
    .positive("Number must be positive")
    .integer("Number must be an integer"),
});

const LoginStepTwo = ({
  handleLoginSecondSuccessRes,
  email,
  emailExists,
}) => {
  const { t } = useTranslation();
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: email,
      code: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosConfig.post(
        emailExists
          ? "api/user/email-login-verify/"
          : "api/user/email-signup-verify/",
        { email: data.email, code: data.code },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response && (response.status === 200) | (response.status === 201)) {
        setLoading(false);
        handleLoginSecondSuccessRes(response.data);
      }
    } catch (error) {
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
          readOnly
          placeholder={t("Home.labelEmail")}
          class={`form-control form-control-sm  mb-3 border ${
            errors.email && "border-danger mb-0"
          }`}
          {...register("email")}
        />
        {errors.email && (
          <p class="text-danger position-absolute">{errors.email.message}</p>
        )}

        <input
          id="code"
          type="text"
          name="code"
          placeholder={"Code"}
          class={`form-control form-control-sm border ${
            errors.code || apiErrorMessage ? "border-danger" : ""
          }`}
          {...register("code", {
            onBlur: () => {
              setApiErrorMessage("");
            },
            onChange: () => {
              setApiErrorMessage("");
            },
          })}
        />
        {errors.code && (
          <p class="text-danger position-absolute">{errors.code.message}</p>
        )}
        {apiErrorMessage && (
          <p className="text-danger position-absolute">{apiErrorMessage}</p>
        )}

        <button
          disabled={isLoading}
          type="submit"
          class="btn btn-primary form-control form-control-sm mt-4"
          data-mdb-ripple-init
        >
          Submit
        </button>
      </form>
    </>
  );
};

export default LoginStepTwo;
