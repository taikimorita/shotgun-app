import { useRouter } from "expo-router";

import { CreateRideScreen } from "@/src/screens/CreateRideScreen";

export default function CreateRideRoute() {
  const router = useRouter();

  return <CreateRideScreen onCancel={() => router.back()} />;
}
