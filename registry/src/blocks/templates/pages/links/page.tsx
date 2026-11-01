import LinkHubTemplate from "@/components/templates/link-hub-template";
import { LINK_HUB_LINKS, LINK_HUB_PROFILE } from "@/lib/link-hub-data";

export default function Page() {
  return <LinkHubTemplate profile={LINK_HUB_PROFILE} links={LINK_HUB_LINKS} />;
}
