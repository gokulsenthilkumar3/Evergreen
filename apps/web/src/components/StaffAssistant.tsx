import AiAssistant from "../../../../packages/portal-ui/AiAssistant";
import { getToken } from "../utils/authStorage";
import api from "../utils/api";
export default function StaffAssistant() {
  return (
    <AiAssistant
      endpoint={`${api.defaults.baseURL}/ai/staff`}
      title="Loom"
      purpose="Your mill workflow and learning assistant"
      authorization={() => {
        const token = getToken();
        return token ? `Bearer ${token}` : undefined;
      }}
      prompts={[
        "Guide me from inward material to customer payment.",
        "How do I import customers and export Tally XML?",
        "Help me describe an issue for the helpdesk.",
      ]}
    />
  );
}
