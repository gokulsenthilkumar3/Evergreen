import { Box, Button, Checkbox, Divider, FormControlLabel, Stack, Typography } from '@mui/material';
import { defaultTamilPreferences, formatUiCurrency, formatUiDate, setTamilPreferences, uiText, useTamilPreferences, type TamilPreferences } from '../i18n';

type Option = { key: keyof TamilPreferences; label: string; detail: string };
const groups: Array<{ title: string; options: Option[] }> = [
  { title: 'இடைமுகப் பகுதிகள்', options: [
    { key: 'navigation', label: 'வழிசெலுத்தல் மற்றும் பக்கத் தலைப்புகள்', detail: 'பக்கப்பட்டி, பகுதி பெயர்கள், வழித்தடம் மற்றும் வழிசெலுத்தல் உதவிக் குறிப்புகள்.' },
    { key: 'tabs', label: 'தாவல்கள் மற்றும் பிரிவுகள்', detail: 'சரக்கு, விற்பனை, அமைப்புகள் போன்ற பகுதிகளின் தாவல் பெயர்கள்.' },
    { key: 'forms', label: 'படிவங்கள் மற்றும் தேர்வுகள்', detail: 'புலப் பெயர்கள், உள்ளீட்டு வழிகாட்டிகள் மற்றும் தேர்வுப் பட்டியல்கள்.' },
    { key: 'actions', label: 'பொதுவான செயல் பொத்தான்கள்', detail: 'சேமி, ரத்து, திருத்து, நீக்கு, பதிவிறக்கு போன்ற பொதுவான செயல்களின் பெயர்கள். அந்தப் பகுதியின் தமிழ் விருப்பமும் இயக்கப்பட்டிருக்க வேண்டும்.' },
    { key: 'statuses', label: 'பொதுவான நிலைக் குறிச்சொற்கள்', detail: 'நிலுவை, முடிந்தது, அங்கீகரிக்கப்பட்டது போன்ற பொதுவான நிலைகள். பதிவுகளில் சேமித்த நிலை மதிப்புகள் மாறாது.' },
    { key: 'tables', label: 'அட்டவணைத் தலைப்புகள்', detail: 'தேதி, வாடிக்கையாளர், அளவு, நிலை போன்ற நெடுவரிசைப் பெயர்கள்.' },
  ] },
  { title: 'அளவீடுகள் மற்றும் அறிக்கைகள்', options: [
    { key: 'metrics', label: 'அளவீட்டுப் பெயர்கள் மற்றும் அலகுகள்', detail: 'உற்பத்தி, இருப்பு, செலவு போன்ற சுருக்க அட்டைகள் மற்றும் கிலோ, மூட்டை போன்ற அலகுகள்.' },
    { key: 'charts', label: 'வரைபடப் பெயர்கள்', detail: 'உற்பத்தி, செலவு மற்றும் சரக்கு வரைபடங்களின் தொடர் பெயர்கள்.' },
    { key: 'numbers', label: 'அளவீடுகளில் தமிழ் எண்கள் (௧, ௨, ௩)', detail: 'திரையில் காட்டும் அளவுகளைத் தமிழ் எண்களில் காணுங்கள். பதிவுகளின் எண்கள் மாற்றப்படாது.' },
    { key: 'grouping', label: 'இந்திய எண் பிரிப்பு (௧,௨௩,௪௫௬)', detail: 'பெரிய அளவுகளை இலட்சம், கோடி அடிப்படையில் காற்புள்ளியுடன் பிரிக்கும்.' },
    { key: 'currency', label: 'ரூபாய் குறியீடு தமிழில் (ரூ.)', detail: 'திரையில் ₹ என்பதற்குப் பதில் ரூ. காட்டும். நாணயம் INR ஆகவே இருக்கும்.' },
    { key: 'currencyDecimals', label: 'முழு ரூபாய்க்கும் இரண்டு தசம இடங்கள்', detail: 'இயக்கினால் ரூ. ௧௦௦.௦௦; அணைத்தால் ரூ. ௧௦௦. பைசா உள்ள தொகைகளின் துல்லியம் மாறாது.' },
    { key: 'dates', label: 'தேதி மற்றும் நாட்காட்டி தமிழில்', detail: 'மாதம், கிழமை மற்றும் தேதிக் காட்சியைத் தமிழாக்கும். சேமித்த தேதியும் நேர மண்டலமும் மாறாது.' },
    { key: 'dateNumbers', label: 'தேதிகளில் தமிழ் எண்கள்', detail: 'தமிழ் தேதி இயக்கப்பட்டிருக்கும்போது நாள் மற்றும் ஆண்டைத் தமிழ் எண்களில் காட்டும். அளவீட்டு எண்களின் விருப்பத்திலிருந்து தனியாகத் தேர்ந்தெடுக்கலாம்.' },
  ] },
  { title: 'வழிகாட்டல் மற்றும் அறிவிப்புகள்', options: [
    { key: 'feedback', label: 'உறுதிப்படுத்தல்கள் மற்றும் செயலி அறிவிப்புகள்', detail: 'செயலி வழங்கும் வெற்றி, பிழை மற்றும் உறுதிப்படுத்தல் செய்திகளைத் தமிழில் காட்டும்.' },
    { key: 'help', label: 'பயிற்சிகள் மற்றும் செயல்முறை வழிகாட்டிகள்', detail: 'படிப்படியான பயிற்சிகளையும் பொருள் முதல் வசூல் வரையிலான வழிகாட்டியையும் தமிழில் படிக்கலாம்.' },
  ] },
];

export default function TamilOptions() {
  const preferences = useTamilPreferences();
  const change = (key: keyof TamilPreferences, checked: boolean) => setTamilPreferences({ [key]: checked });
  return <Box lang="ta">
    <Typography component="h2" variant="subtitle1" fontWeight={750}>தமிழ் காட்சி விருப்பங்கள்</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 1.5, lineHeight: 1.7 }}>எந்தப் பகுதிகள் தமிழில் தெரிய வேண்டும் என்பதைத் தனித்தனியாகத் தேர்ந்தெடுங்கள். மாற்றங்கள் உடனே செயல்படும்; இந்த உலாவியில் சேமிக்கப்படும்.</Typography>
    <Stack direction="row" gap={1} sx={{ mb: 1 }} flexWrap="wrap">
      <Button size="small" variant="outlined" onClick={() => setTamilPreferences({ ...defaultTamilPreferences })}>அனைத்தும் தமிழில்</Button>
      <Button size="small" onClick={() => setTamilPreferences({ ...defaultTamilPreferences, numbers: false, currency: false, dateNumbers: false })}>தமிழ் உரை · வழக்கமான எண்கள்</Button>
      <Button size="small" onClick={() => setTamilPreferences(Object.fromEntries(Object.keys(defaultTamilPreferences).map(key => [key, false])) as TamilPreferences)}>அனைத்தையும் அணை</Button>
    </Stack>
    <FormControlLabel sx={{ m: 0, alignItems: 'flex-start' }} control={<Checkbox size="small" inputProps={{ 'aria-label': 'முழு இடைமுகம் மற்றும் தாவல்கள்' }} checked={preferences.interface} onChange={(_, checked) => change('interface', checked)} />}
      label={<Box sx={{ pt: .75 }}><Typography variant="body2" fontWeight={700}>முழு இடைமுகம் மற்றும் தாவல்கள்</Typography><Typography variant="caption" color="text.secondary">தமிழ் உரைக்கான முதன்மைக் கட்டுப்பாடு. எண், நாணயம் மற்றும் தேதி விருப்பங்கள் தனியாகச் செயல்படும்.</Typography></Box>} />
    {groups.map(group => <Box component="fieldset" key={group.title} sx={{ border: 0, m: 0, mt: 2, p: 0 }}>
      <Typography component="legend" variant="subtitle2" fontWeight={700}>{group.title}</Typography>
      {group.options.map(option => <FormControlLabel key={option.key} sx={{ display: 'flex', alignItems: 'flex-start', m: 0, py: .25 }}
        disabled={(!preferences.interface && ['navigation','tabs','forms','tables','metrics','charts','feedback','help','actions','statuses'].includes(option.key)) || (option.key === 'dateNumbers' && !preferences.dates)}
        control={<Checkbox size="small" inputProps={{ 'aria-label': option.label }} checked={preferences[option.key]} onChange={(_, checked) => change(option.key, checked)} />}
        label={<Box sx={{ pt: .75 }}><Typography variant="body2">{option.label}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.65 }}>{option.detail}</Typography></Box>} />)}
    </Box>)}
    <Divider sx={{ my: 2 }} />
    <Box role="status" aria-label="காட்சி முன்னோட்டம்" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant="caption" fontWeight={700}>முன்னோட்டம் · மாதிரி மதிப்புகள்</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>{uiText('Inventory', 'navigation')} · {uiText('Invoices', 'tabs')} · {uiText('Total Cost', 'metrics')}</Typography>
      <Typography variant="h6" sx={{ my: .5 }}>{formatUiCurrency(123456.75)}</Typography>
      <Typography variant="body2">{formatUiDate(new Date(2026, 10, 1), { day: 'numeric', month: 'long', year: 'numeric' })}</Typography>
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.7 }}>நிறுவனப் பெயர்கள், வாடிக்கையாளர் தரவு, ஆவண மற்றும் தொகுதி அடையாளங்கள், API மதிப்புகள் மாற்றப்படாது. பதிவிறக்கும் சட்டப்பூர்வ ஆவணங்களின் மொழியும் இதனால் மாறாது.</Typography>
  </Box>;
}
