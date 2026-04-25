import Navbar from "./Navbar";
import { logout } from "@/app/actions/auth";

interface NavbarWrapperProps {
  user: any;
  profile: { full_name?: string; role?: string } | null;
}

export default function NavbarWrapper({ user, profile }: NavbarWrapperProps) {
  return <Navbar user={user} profile={profile} />;
}
