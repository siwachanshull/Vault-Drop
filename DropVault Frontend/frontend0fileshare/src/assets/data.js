import { LayoutDashboard, Upload, Folder, CreditCard, Receipt } from "lucide-react";

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/Dashboard",
    },
    {
        id: "02",
        label: "Upload",
        icon: Upload,
        path: "/Upload",
    },
    {
        id: "03",
        label: "My Files",
        icon: Folder,
        path: "/MyFiles",
    },
    {
        id: "04",
        label: "Subscriptions",
        icon: CreditCard,
        path: "/Subscriptions",
    },
    {
        id: "05",
        label: "Transactions",
        icon: Receipt,
        path: "/Transactions",
    },
];