// Updates are explicit: check -> download -> stop writes -> verified snapshot -> install.
function createUpdater({ updater, dialog, prepare, recover = () => {}, enabled }) {
  let busy = false;
  updater.autoDownload = false;
  updater.autoInstallOnAppQuit = false;
  updater.allowDowngrade = false;
  updater.allowPrerelease = false;
  updater.on('error', () => {}); // handled by the awaited operation, without leaking URLs or tokens
  return async function check() {
    if (busy) return;
    if (!enabled) {
      await dialog.showMessageBox({ type: 'info', message: 'Updates are not configured for this build.', detail: 'Use an installer from your release administrator.' }); return;
    }
    busy = true;
    let preparing = false;
    try {
      const result = await updater.checkForUpdates();
      if (!result?.isUpdateAvailable) {
        await dialog.showMessageBox({ type: 'info', message: 'EverGreen is up to date.' }); return;
      }
      const choice = await dialog.showMessageBox({ type: 'info', buttons: ['Download and install', 'Later'], defaultId: 0, cancelId: 1,
        message: `EverGreen ${result.updateInfo.version} is available.`, detail: 'Save your work first. The app will back up its database and restart after the download.' });
      if (choice.response !== 0) return;
      await updater.downloadUpdate();
      preparing = true;
      await prepare();
      updater.quitAndInstall(false, true);
    } catch {
      await dialog.showMessageBox({ type: 'error', message: 'The update could not be installed.', detail: 'Your previous database is retained. Reopen EverGreen and try again, or contact your release administrator.' });
      if (preparing) recover();
    } finally { busy = false; }
  };
}
module.exports = { createUpdater };
