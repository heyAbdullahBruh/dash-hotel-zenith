import { useNavigate as useRouterNavigate } from "react-router";

export const useNavigation = () => {
  const routerNavigate = useRouterNavigate();

  const navigate = (to, options = {}) => {
    if (typeof to === "string") {
      routerNavigate(to, options);
    } else if (typeof to === "number") {
      // Go back/forward
      routerNavigate(to);
    }
  };

  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return {
    navigate,
    goBack,
    goForward,
  };
};
