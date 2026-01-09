import { redirect } from "@sveltejs/kit";

function _load() {
  try {
    return {};
  } catch (error) {
    console.error("Load error in +layout.server.ts:", error);
    throw redirect(302, "/");
  }
}
