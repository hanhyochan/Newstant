import { getCurrentUserSnapshot } from "./current-user";

export function useCurrentUser() {
  return getCurrentUserSnapshot();
}
