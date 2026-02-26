import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/Login";
import InventoryReservationPage from "../pages/InventoryReservationPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <LoginPage />
            },
            {
                path: "reserve",
                element: <InventoryReservationPage />
            }
        ]
    }
])
