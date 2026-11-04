import { uiText, useUiLanguage } from "../i18n";
import AiAssistant from "../../../../packages/portal-ui/AiAssistant";
import { getToken } from "../utils/authStorage";
import api from "../utils/api";
export default function StaffAssistant({ embedded = false, onBusyChange }: { embedded?: boolean; onBusyChange?: (busy: boolean) => void }) {
  useUiLanguage();
  return (
    <AiAssistant
      endpoint={`${api.defaults.baseURL}/ai/staff`}
      title={uiText(embedded ? 'Loom Agent' : 'Loom')}
      purpose={uiText('Your mill workflow and learning assistant')}
      embedded={embedded}
      translate={uiText}
      onBusyChange={onBusyChange}
      authorization={() => {
        const token = getToken();
        return token ? `Bearer ${token}` : undefined;
      }}
      prompts={[
        uiText('Guide me from inward material to customer payment.'),
        uiText('How do I import customers and export Tally XML?'),
        uiText('Help me describe an issue for the helpdesk.'),
      ]}
    />
  );
}
