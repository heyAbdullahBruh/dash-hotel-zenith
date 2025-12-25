import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import styles from "./Login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      await login(data);
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <FontAwesomeIcon icon={faHotel} className={styles.logo} />
          <h1>HotelZenith Admin</h1>
          <p>Sign in to your dashboard</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <Input
            label="Email Address"
            type="email"
            icon={faEnvelope}
            placeholder="admin@hotelzenith.com"
            error={errors.email?.message}
            {...register("email")}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            icon={faLock}
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            fullWidth
          >
            Sign In
          </Button>
        </form>

        <div className={styles.loginFooter}>
          <p>© 2024 HotelZenith. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
