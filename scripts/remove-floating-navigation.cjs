// One-time removal of the retired customer navigation option.
const fs = require('node:fs');
const appPath = 'apps/web/src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/^.*const \[floatingNav, setFloatingNav\].*\r?\n/m, '')
  .replace(/^.*localStorage.setItem\('floatingNav'.*\r?\n/m, '')
  .replace(/              \{\/\* Floating bottom nav pill \*\/\}[\s\S]*?(?=              <Box sx=\{\{\r?\n                display: 'flex')/, '')
  .replace(/^.*pb: floatingNav.*\r?\n/m, '')
  .replace(/^.*floatingNav=\{floatingNav\}.*\r?\n/m, '')
  .replace(/^.*onFloatingNavChange=\{setFloatingNav\}.*\r?\n/m, '');
fs.writeFileSync(appPath, app);
const settingsPath = 'apps/web/src/pages/Settings.tsx';
let settings = fs.readFileSync(settingsPath, 'utf8');
settings = settings.replace(/^.*floatingNav\??.*\r?\n/gm, '').replace(/^.*onFloatingNavChange\??.*\r?\n/gm, '');
// Remove the complete final appearance section, retaining its enclosing panel.
settings = settings.replace(/                        \{\/\* Divider \*\/\}[\s\S]*?(?=                    <\/Box>\r?\n                <\/TabPanel>\r?\n\r?\n                \{\/\* Audit Logs Tab)/, '');
fs.writeFileSync(settingsPath, settings);
const cssPath = 'apps/web/src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/\/\* ─── Floating bottom nav[\s\S]*?(?=\/\* ─── Neumorphic calendar)/, '');
fs.writeFileSync(cssPath, css);
