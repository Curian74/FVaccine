import AuthService from "@/services/AuthService";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Response } from "@/types/response";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button } from "@material-tailwind/react";
// import { Icons } from "@/components/Icons";  
import { checkEmail, cn } from "@/helpers/utils";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
type LoginFormsInputs = {
  email: string;
  password: string;
};
const validation = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .test("is-CorrectEmail", "Email must correct such as example@domain.com", value => {
      return checkEmail(value);
    }),
  password: Yup.string().required("Password is required")
});
const Login: React.FC = () => {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormsInputs>({
    mode: "onTouched",
    resolver: yupResolver(validation)
  });

  const { mutate: handleLogin, isPending: pending } = useMutation({
    mutationFn: async (form: LoginFormsInputs) => {
      await AuthService.login(form.email, form.password);
    },
    onSuccess: async () => {
      navigate("/");
    },
    onError: e => {
      const error = e as AxiosError;
      setError((error?.response?.data as Response)?.message || error.message);
    }
  });

  const isPending = pending;

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">

      <div className="flex flex-col w-full max-w-lg p-8 bg-white shadow-lg">

        <div className="flex flex-col mb-4 items-center">
          {/* <Icons.logo className="w-10 h-10" /> */}
          <span className="font-semibold text-lg">Login</span>
        </div>

        <form onSubmit={handleSubmit(form => handleLogin(form))}
          className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm m-1 text-gray-700">
              Email
            </label>
            <Input
              type="email"
              id="email"
              placeholder="Email Address"
              className={cn(
                "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                Boolean(errors?.email?.message) &&
                "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
              )}
              labelProps={{ className: "hidden" }}
              crossOrigin={undefined}
              disabled={isPending}

              onPointerEnterCapture={() => { }}
              onPointerLeaveCapture={() => { }}
              {...register("email")}
            />
            {errors.email && (
              <span
                className={cn(
                  "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                )}
              >
                <CircleAlert className="w-3 h-3" /> {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm m-1 text-gray-700">
              Password
            </label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              className={cn(
                "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                Boolean(errors?.password?.message) &&
                "focus:!border-red-700 focus:!border-t-red-700 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
              )}
              crossOrigin={undefined}
              labelProps={{ className: "hidden" }}
              onPointerEnterCapture={() => { }}
              onPointerLeaveCapture={() => { }}
              {...register("password")}
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center">
                <CircleAlert className="w-3 h-3" /> {errors.password.message}
              </span>
            )}
          </div>
          {error && (
            <span className="flex items-center tracking-wide text-xs text-red-500 mt-1 ml-1 gap-x-1">
              <CircleAlert className="w-3 h-3" /> {error}
            </span>
          )}
          <div className="flex justify-end">
            <Link
              className="text-xs text-deep-orange-600 font-semibold hover:underline"
              to={"/auth/forgot-password"}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            placeholder={""}
            className="mt-6 text-sm normal-case"
            fullWidth
            variant="gradient"
            color="deep-orange"
            onPointerEnterCapture={() => { }}
            onPointerLeaveCapture={() => { }}
          >
            Sign in
          </Button>
        </form>
        <div className="mt-4 text-xs text-gray-600 text-center">
        <p>
          You don't have an account?{" "}
          <Link
            to="/register"
            className="text-deep-orange-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;
