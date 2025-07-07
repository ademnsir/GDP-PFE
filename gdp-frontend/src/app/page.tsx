import ECommerce from "@/app/Dashboard/page";
import { Metadata } from "next";

export const metadata = {
  title: "Wifak Bank",
  description: "wifakbank",
  icons: {
    icon: "images/logo/mini-logo.png",
  },
};

export default function Home() {
  return <ECommerce />;
}
