# UI controls and tabs

Generated from every active-source UI file. Labels expressed in code are preserved as expressions; arrays and child components must be read through their source links. This includes retained components that may not currently be mounted.

| Source | Control | Label / expression | Handler |
| --- | --- | --- | --- |
| [apps/web/src/App.tsx:287](../../apps/web/src/App.tsx) | TextField | <TextField id="global-search-input" placeholder="Search invoices, stock, customers (Ctrl+K)..." fullWidth size="small" autoComplete="off" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)} onKeyDown={handleKeyDown} InputProps={{ startAdornment: ( <InputAdornment position="start"> {loading ? <SyncIcon fontSize="small" className="spin-icon" /> : <Search | `{(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}` |
| [apps/web/src/App.tsx:305](../../apps/web/src/App.tsx) | IconButton | Clear search | `{() => { setQuery(''); setResults([]); }}` |
| [apps/web/src/App.tsx:837](../../apps/web/src/App.tsx) | Button | Connect with Licensing Desk (WhatsApp) | `` |
| [apps/web/src/App.tsx:849](../../apps/web/src/App.tsx) | Button | Call Support | `` |
| [apps/web/src/App.tsx:878](../../apps/web/src/App.tsx) | IconButton | {item.icon} | `{() => setCurrentPage(item.page)}` |
| [apps/web/src/App.tsx:915](../../apps/web/src/App.tsx) | IconButton | open drawer | `{handleDrawerToggle}` |
| [apps/web/src/App.tsx:946](../../apps/web/src/App.tsx) | IconButton | Toggle language | `{toggleLanguage}` |
| [apps/web/src/App.tsx:952](../../apps/web/src/App.tsx) | IconButton | <SyncIcon className={isSyncing ? 'spin-icon' : ''} /> | `{handleSync}` |
| [apps/web/src/App.tsx:961](../../apps/web/src/App.tsx) | IconButton | {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />} | `{toggleTheme}` |
| [apps/web/src/App.tsx:967](../../apps/web/src/App.tsx) | IconButton | <Avatar alt={user.name \|\| user.username} sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.1)' }} > {(user.name \|\| user.username)?.charAt(0).toUpperCase()} </Avatar> | `{handleProfileClick}` |
| [apps/web/src/components/BusinessFlowGuide.tsx:33](../../apps/web/src/components/BusinessFlowGuide.tsx) | TextField | Search workflow guide | `{event => setSearch(event.target.value)}` |
| [apps/web/src/components/BusinessFlowGuide.tsx:59](../../apps/web/src/components/BusinessFlowGuide.tsx) | Button | {step.action} | `{() => onNavigate(step.page)}` |
| [apps/web/src/components/Login.tsx:326](../../apps/web/src/components/Login.tsx) | TextField | Username | `{(e) => { setUsername(e.target.value); if (error) setError(null); handleTyping(); }}` |
| [apps/web/src/components/Login.tsx:353](../../apps/web/src/components/Login.tsx) | TextField | Password | `{(e) => { setPassword(e.target.value); if (error) setError(null); handleTyping(); }}` |
| [apps/web/src/components/Login.tsx:380](../../apps/web/src/components/Login.tsx) | IconButton | {showPassword ? 'Hide password' : 'Show password'} | `{() => setShowPassword(!showPassword)}` |
| [apps/web/src/components/Login.tsx:389](../../apps/web/src/components/Login.tsx) | TextField | 6-Digit Authenticator Code | `{(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}` |
| [apps/web/src/components/Login.tsx:428](../../apps/web/src/components/Login.tsx) | Button | <Box sx={{ display: 'flex', alignItems: 'center', height: 24 }}> {loading && !success && <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />} {success ? ( <Fade in timeout={500}> <Box sx={{ display: 'flex', alignItems: 'center' }}> <CheckCircleIcon sx={{ mr: 1 }} /> Success! Redirecting... </Box> </Fade> ) : ( <Box sx={{ display: 'flex', alignItems: 'center' }}> {!loading && 'Sign In To  | `` |
| [apps/web/src/components/Login.tsx:476](../../apps/web/src/components/Login.tsx) | Button | Sign in with Passkey | `{handlePasskeyLogin}` |
| [apps/web/src/components/ProfileModal.tsx:197](../../apps/web/src/components/ProfileModal.tsx) | IconButton | <CloseIcon fontSize="small" /> | `{onClose}` |
| [apps/web/src/components/ProfileModal.tsx:244](../../apps/web/src/components/ProfileModal.tsx) | Tabs | <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Profile" /> <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Security" /> <Tab icon={<PaletteIcon fontSize="small" />} iconPosition="start" label="Preferences" /> | `{(_, v) => setTab(v)}` |
| [apps/web/src/components/ProfileModal.tsx:255](../../apps/web/src/components/ProfileModal.tsx) | Tab | Profile | `` |
| [apps/web/src/components/ProfileModal.tsx:256](../../apps/web/src/components/ProfileModal.tsx) | Tab | Security | `` |
| [apps/web/src/components/ProfileModal.tsx:257](../../apps/web/src/components/ProfileModal.tsx) | Tab | Preferences | `` |
| [apps/web/src/components/ProfileModal.tsx:264](../../apps/web/src/components/ProfileModal.tsx) | TextField | Display Name | `{(e) => setName(e.target.value)}` |
| [apps/web/src/components/ProfileModal.tsx:272](../../apps/web/src/components/ProfileModal.tsx) | TextField | Email Address | `{(e) => setEmail(e.target.value)}` |
| [apps/web/src/components/ProfileModal.tsx:281](../../apps/web/src/components/ProfileModal.tsx) | TextField | Username | `` |
| [apps/web/src/components/ProfileModal.tsx:303](../../apps/web/src/components/ProfileModal.tsx) | Button | {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'} | `{handleSaveProfile}` |
| [apps/web/src/components/ProfileModal.tsx:320](../../apps/web/src/components/ProfileModal.tsx) | TextField | Current Password | `{(e) => setCurrentPassword(e.target.value)}` |
| [apps/web/src/components/ProfileModal.tsx:330](../../apps/web/src/components/ProfileModal.tsx) | IconButton | {showCurrentPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} | `{() => setShowCurrentPass(!showCurrentPass)}` |
| [apps/web/src/components/ProfileModal.tsx:341](../../apps/web/src/components/ProfileModal.tsx) | TextField | New Password (min 8 characters) | `{(e) => setNewPassword(e.target.value)}` |
| [apps/web/src/components/ProfileModal.tsx:351](../../apps/web/src/components/ProfileModal.tsx) | IconButton | {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} | `{() => setShowNewPass(!showNewPass)}` |
| [apps/web/src/components/ProfileModal.tsx:362](../../apps/web/src/components/ProfileModal.tsx) | TextField | Confirm New Password | `{(e) => setConfirmPassword(e.target.value)}` |
| [apps/web/src/components/ProfileModal.tsx:371](../../apps/web/src/components/ProfileModal.tsx) | Button | {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'} | `{handleChangePassword}` |
| [apps/web/src/components/ProfileModal.tsx:400](../../apps/web/src/components/ProfileModal.tsx) | Button | Configure | `{() => { onClose(); onNavigate?.('security'); }}` |
| [apps/web/src/components/ProfileModal.tsx:490](../../apps/web/src/components/ProfileModal.tsx) | Button | English | `{() => { if (language !== 'en') onToggleLanguage(); }}` |
| [apps/web/src/components/ProfileModal.tsx:499](../../apps/web/src/components/ProfileModal.tsx) | Button | தமிழ் (Tamil) | `{() => { if (language !== 'ta') onToggleLanguage(); }}` |
| [apps/web/src/components/ProfileModal.tsx:514](../../apps/web/src/components/ProfileModal.tsx) | Button | Close | `{onClose}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:55](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Lot reference | `{e => setBatchId(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:56](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Receipt time | `{e => setDate(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:57](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Supplier | `{e => setSupplier(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:58](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Bales | `{e => setBale(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:60](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Gross weight (kg) | `{e => setGross(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:61](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Tare weight (kg) | `{e => setTare(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:63](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Moisture content (%) | `{e => setMoisture(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:64](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Deduction policy | `{e => setMethod(e.target.value as MoistureMethod)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:70](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Agreed baseline (%) | `{e => setBaseline(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:71](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | TextField | Contract reference | `{e => setContract(e.target.value)}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:84](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | Button | Cancel | `{onClose}` |
| [apps/web/src/components/WeighbridgeReceiptDialog.tsx:85](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) | Button | {busy ? 'Saving…' : 'Save receipt'} | `{save}` |
| [apps/web/src/components/command-center/CampusScene.tsx:445](../../apps/web/src/components/command-center/CampusScene.tsx) | Button | {fullscreen.fullscreen ? 'Exit TV fullscreen' : 'TV fullscreen'} | `{fullscreen.toggle}` |
| [apps/web/src/components/command-center/CampusScene.tsx:460](../../apps/web/src/components/command-center/CampusScene.tsx) | Select | <MenuItem value="" disabled>{props.machines.length ? 'Find a machine…' : props.machinesAvailable ? 'No machines registered' : 'Machine data unavailable'}</MenuItem> {props.machines.map(machine => <MenuItem key={machine.id} value={machine.id}>{machine.name}</MenuItem>)} | `{event => selectMachine(Number(event.target.value))}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:94](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | {props.cinema ? 'Exit cinema' : 'Cinema view'} | `{props.toggleCinema}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:120](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | <Box component="span" sx={{ fontSize: 9, mr: 0.8, opacity: 0.55 }}>0{i + 1}</Box> {name} | `{() => focus(name)}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:161](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | {`Focus ${location.name}`} | `{() => focus(location.name)}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:189](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | IconButton | Zoom in | `{() => props.zoom(1)}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:190](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | IconButton | Zoom out | `{() => props.zoom(-1)}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:196](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | {props.motion && !props.reduced ? 'Pause' : 'Play'} | `{props.toggleMotion}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:197](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | {props.tour ? 'Stop tour' : 'Camera tour'} | `{props.toggleTour}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:198](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Select | {[0.5, 1, 2].map(speed => <MenuItem key={speed} value={speed}>{speed}×</MenuItem>)} | `{event => props.setSpeed(Number(event.target.value))}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:201](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | IconButton | Reset camera | `{props.reset}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:211](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | {name} | `{() => setPanel(name)}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:242](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | Inspection history | `{props.onInspect}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:243](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | Clear selection | `{props.clearSelection}` |
| [apps/web/src/components/command-center/CampusWorkspace.tsx:251](../../apps/web/src/components/command-center/CampusWorkspace.tsx) | Button | {name} | `{() => props.onNavigate?.(page)}` |
| [apps/web/src/components/command-center/FleetDockTableHud.tsx:124](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) | IconButton | {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />} | `{() => setExpanded((v) => !v)}` |
| [apps/web/src/components/command-center/FleetDockTableHud.tsx:135](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) | Tabs | <Tab value="docks" label="Loading Docks (4)" /> <Tab value="vehicles" label="Fleet & Forklifts (3)" /> <Tab value="machines" label={`Machine Lines (${machines.length \|\| 8})`} /> | `{(_, val) => { sfx.playClick(); setActiveTab(val); }}` |
| [apps/web/src/components/command-center/FleetDockTableHud.tsx:162](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) | Tab | Loading Docks (4) | `` |
| [apps/web/src/components/command-center/FleetDockTableHud.tsx:163](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) | Tab | Fleet & Forklifts (3) | `` |
| [apps/web/src/components/command-center/FleetDockTableHud.tsx:164](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) | Tab | {`Machine Lines (${machines.length \|\| 8})`} | `` |
| [apps/web/src/components/command-center/ShipmentStepperHud.tsx:143](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) | IconButton | {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />} | `{() => setExpanded((v) => !v)}` |
| [apps/web/src/components/command-center/WarRoomView.tsx:350](../../apps/web/src/components/command-center/WarRoomView.tsx) | Button | Manage Machines | `{() => onNavigate?.('yarnmachine')}` |
| [apps/web/src/components/command-center/WarRoomView.tsx:536](../../apps/web/src/components/command-center/WarRoomView.tsx) | Button | Open Quality Desk → | `{() => onNavigate?.('yarnquality')}` |
| [apps/web/src/components/command-center/WarRoomView.tsx:582](../../apps/web/src/components/command-center/WarRoomView.tsx) | Button | Logistics & Challans → | `{() => onNavigate?.('outward')}` |
| [apps/web/src/components/common/BarcodeQRModal.tsx:231](../../apps/web/src/components/common/BarcodeQRModal.tsx) | Button | <CloseIcon fontSize="small" /> | `{onClose}` |
| [apps/web/src/components/common/BarcodeQRModal.tsx:321](../../apps/web/src/components/common/BarcodeQRModal.tsx) | Button | Copy Payload | `{handleCopy}` |
| [apps/web/src/components/common/BarcodeQRModal.tsx:325](../../apps/web/src/components/common/BarcodeQRModal.tsx) | Button | Print Label (4"×3") | `{handlePrint}` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:39](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | ToggleButton | Automatic | `` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:40](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | ToggleButton | Build code | `` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:41](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | ToggleButton | Manual ID | `` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:47](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | TextField | Batch ID (Optional) | `{event => onChange(event.target.value)}` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:53](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | TextField | Prefix | `{event => setPrefix(event.target.value)}` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:55](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | TextField | Suffix | `{event => setSuffix(event.target.value)}` |
| [apps/web/src/components/common/BatchCodeBuilder.tsx:58](../../apps/web/src/components/common/BatchCodeBuilder.tsx) | IconButton | Generate new suffix | `{() => { const next = generateRandomSuffix(4); setSuffix(next); setGeneratedSuffix(next); }}` |
| [apps/web/src/components/common/ConfirmDialog.tsx:60](../../apps/web/src/components/common/ConfirmDialog.tsx) | Button | {cancelText} | `{onCancel}` |
| [apps/web/src/components/common/ConfirmDialog.tsx:68](../../apps/web/src/components/common/ConfirmDialog.tsx) | Button | {confirmText} | `{onConfirm}` |
| [apps/web/src/components/common/EmptyState.tsx:95](../../apps/web/src/components/common/EmptyState.tsx) | Button | {actionLabel} | `{onAction}` |
| [apps/web/src/components/common/EntryWizardHeader.tsx:29](../../apps/web/src/components/common/EntryWizardHeader.tsx) | IconButton | Close dialog | `{onClose}` |
| [apps/web/src/components/common/ErrorBoundary.tsx:113](../../apps/web/src/components/common/ErrorBoundary.tsx) | Button | Reload Application | `{this.handleRetry}` |
| [apps/web/src/components/common/ErrorBoundary.tsx:121](../../apps/web/src/components/common/ErrorBoundary.tsx) | Button | Go to Dashboard | `{() => window.location.href = '/'}` |
| [apps/web/src/components/common/ExportButtons.tsx:87](../../apps/web/src/components/common/ExportButtons.tsx) | Button | {btn.label} | `{btn.onClick}` |
| [apps/web/src/components/common/GlassDatePicker.tsx:203](../../apps/web/src/components/common/GlassDatePicker.tsx) | IconButton | {icon} | `{fn}` |
| [apps/web/src/components/common/NotFound404.tsx:107](../../apps/web/src/components/common/NotFound404.tsx) | Button | Back to Dashboard | `{() => onNavigate('dashboard')}` |
| [apps/web/src/components/common/ProductionTimingAlert.tsx:17](../../apps/web/src/components/common/ProductionTimingAlert.tsx) | Button | Edit start time | `{onEdit}` |
| [apps/web/src/components/insights/EwayBills.tsx:42](../../apps/web/src/components/insights/EwayBills.tsx) | Button | Sync NIC | `{() => toast.error('NIC synchronization is unavailable until a provider is configured.')}` |
| [apps/web/src/components/insights/EwayBills.tsx:43](../../apps/web/src/components/insights/EwayBills.tsx) | Button | Generate EWB | `{() => { setForm({ invoiceNo: '', customer: '', amount: 0, distance: 0 }); setOpen(true); }}` |
| [apps/web/src/components/insights/EwayBills.tsx:85](../../apps/web/src/components/insights/EwayBills.tsx) | IconButton | <ViewIcon fontSize="small" /> | `` |
| [apps/web/src/components/insights/EwayBills.tsx:87](../../apps/web/src/components/insights/EwayBills.tsx) | IconButton | <CancelIcon fontSize="small" /> | `{() => handleCancel(ewb.id)}` |
| [apps/web/src/components/insights/EwayBills.tsx:101](../../apps/web/src/components/insights/EwayBills.tsx) | TextField | Invoice No | `{e => setForm({ ...form, invoiceNo: e.target.value })}` |
| [apps/web/src/components/insights/EwayBills.tsx:102](../../apps/web/src/components/insights/EwayBills.tsx) | TextField | Customer Name | `{e => setForm({ ...form, customer: e.target.value })}` |
| [apps/web/src/components/insights/EwayBills.tsx:103](../../apps/web/src/components/insights/EwayBills.tsx) | TextField | Document Value (₹) | `{e => setForm({ ...form, amount: parseFloat(e.target.value) \|\| 0 })}` |
| [apps/web/src/components/insights/EwayBills.tsx:104](../../apps/web/src/components/insights/EwayBills.tsx) | TextField | Approx Distance (km) | `{e => setForm({ ...form, distance: parseInt(e.target.value) \|\| 0 })}` |
| [apps/web/src/components/insights/EwayBills.tsx:108](../../apps/web/src/components/insights/EwayBills.tsx) | Button | Cancel | `{() => setOpen(false)}` |
| [apps/web/src/components/insights/EwayBills.tsx:109](../../apps/web/src/components/insights/EwayBills.tsx) | Button | Generate | `{handleGenerate}` |
| [apps/web/src/components/insights/TallySync.tsx:46](../../apps/web/src/components/insights/TallySync.tsx) | Button | {isSyncing ? 'Syncing...' : 'Sync Now'} | `{handleSync}` |
| [apps/web/src/context/NotificationsContext.tsx:228](../../apps/web/src/context/NotificationsContext.tsx) | IconButton | <CloseIcon sx={{ fontSize: 13 }} /> | `{(e) => { e.stopPropagation(); removeNotification(n.id); }}` |
| [apps/web/src/context/NotificationsContext.tsx:248](../../apps/web/src/context/NotificationsContext.tsx) | IconButton | <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error" max={99} sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 17, height: 17, animation: unreadCount > 0 ? 'pulse 1.8s ease-in-out infinite' : 'none', '@keyframes pulse': { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.18)' }, }, }, }} > <NotificationsIcon /> </Badge> | `{() => setOpen(true)}` |
| [apps/web/src/context/NotificationsContext.tsx:307](../../apps/web/src/context/NotificationsContext.tsx) | IconButton | <MarkAllReadIcon fontSize="small" /> | `{markAllAsRead}` |
| [apps/web/src/context/NotificationsContext.tsx:314](../../apps/web/src/context/NotificationsContext.tsx) | IconButton | <ClearAllIcon fontSize="small" /> | `{clearAll}` |
| [apps/web/src/context/NotificationsContext.tsx:320](../../apps/web/src/context/NotificationsContext.tsx) | IconButton | <CloseIcon fontSize="small" /> | `{() => setOpen(false)}` |
| [apps/web/src/context/NotificationsContext.tsx:370](../../apps/web/src/context/NotificationsContext.tsx) | Button | Clear all notifications | `{clearAll}` |
| [apps/web/src/pages/BookEllam.tsx:271](../../apps/web/src/pages/BookEllam.tsx) | Button | Export Sales / Receipts XML | `{async () => { try { const response = await api.get('/integrations/tally/export', { params: { types: 'Sales,Receipt' }, responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = 'Tally-Sales-Receipts.xml'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch { toast.error('Tally export failed. An administrator account is required.'); } }}` |
| [apps/web/src/pages/BookEllam.tsx:290](../../apps/web/src/pages/BookEllam.tsx) | Button | Export CSV Audit | `{exportToCSV}` |
| [apps/web/src/pages/BookEllam.tsx:300](../../apps/web/src/pages/BookEllam.tsx) | Button | Print Ledger Book | `{() => window.print()}` |
| [apps/web/src/pages/BookEllam.tsx:372](../../apps/web/src/pages/BookEllam.tsx) | TextField | <TextField fullWidth size="small" placeholder="Search across all books by Party, Challan #, Lot #, Vehicle #, or Status..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon color="action" /> </InputAdornment> ), }} /> | `{e => setSearchQuery(e.target.value)}` |
| [apps/web/src/pages/BookEllam.tsx:388](../../apps/web/src/pages/BookEllam.tsx) | TextField | Filter by Date | `{e => setDateFilter(e.target.value)}` |
| [apps/web/src/pages/BookEllam.tsx:400](../../apps/web/src/pages/BookEllam.tsx) | Button | Clear Filters | `{() => { setSearchQuery(''); setDateFilter(''); }}` |
| [apps/web/src/pages/BookEllam.tsx:413](../../apps/web/src/pages/BookEllam.tsx) | Tabs | <Tab label={`All Books (${allRecords.length})`} value="ALL" icon={<FilterIcon />} iconPosition="start" /> <Tab label="Inward Book (வரவு)" value="INWARD" icon={<InwardIcon />} iconPosition="start" /> <Tab label="Outward Book (செலவு)" value="OUTWARD" icon={<OutwardIcon />} iconPosition="start" /> <Tab label="Stock & Waste (சரக்கு)" value="STOCK" icon={<StockIcon />} iconPosition="start" /> <Tab labe | `{(_, val) => setActiveTab(val)}` |
| [apps/web/src/pages/BookEllam.tsx:419](../../apps/web/src/pages/BookEllam.tsx) | Tab | {`All Books (${allRecords.length})`} | `` |
| [apps/web/src/pages/BookEllam.tsx:420](../../apps/web/src/pages/BookEllam.tsx) | Tab | Inward Book (வரவு) | `` |
| [apps/web/src/pages/BookEllam.tsx:421](../../apps/web/src/pages/BookEllam.tsx) | Tab | Outward Book (செலவு) | `` |
| [apps/web/src/pages/BookEllam.tsx:422](../../apps/web/src/pages/BookEllam.tsx) | Tab | Stock & Waste (சரக்கு) | `` |
| [apps/web/src/pages/BookEllam.tsx:423](../../apps/web/src/pages/BookEllam.tsx) | Tab | Spinning Runs (உற்பத்தி) | `` |
| [apps/web/src/pages/BookEllam.tsx:424](../../apps/web/src/pages/BookEllam.tsx) | Tab | Party Ledger (பேரேடு / Khata) | `` |
| [apps/web/src/pages/CatalogueTaxonomy.tsx:35](../../apps/web/src/pages/CatalogueTaxonomy.tsx) | TextField | {`${label} name`} | `{event => setName(event.target.value)}` |
| [apps/web/src/pages/CatalogueTaxonomy.tsx:36](../../apps/web/src/pages/CatalogueTaxonomy.tsx) | Button | {editingId ? 'Update' : 'Add'} | `{save}` |
| [apps/web/src/pages/CatalogueTaxonomy.tsx:37](../../apps/web/src/pages/CatalogueTaxonomy.tsx) | Button | Cancel | `{() => { setEditingId(null); setName(''); }}` |
| [apps/web/src/pages/CatalogueTaxonomy.tsx:42](../../apps/web/src/pages/CatalogueTaxonomy.tsx) | Button | Edit | `{() => { setEditingId(row.id); setName(row.name); }}` |
| [apps/web/src/pages/CatalogueTaxonomy.tsx:42](../../apps/web/src/pages/CatalogueTaxonomy.tsx) | Button | Archive | `{() => void archive(row)}` |
| [apps/web/src/pages/CommandCenter.tsx:287](../../apps/web/src/pages/CommandCenter.tsx) | Button | Close | `{onClose}` |
| [apps/web/src/pages/CommandCenter.tsx:406](../../apps/web/src/pages/CommandCenter.tsx) | Button | Open Machine Register | `{() => { onClose(); onNavigate?.('yarnmachine'); }}` |
| [apps/web/src/pages/CommandCenter.tsx:686](../../apps/web/src/pages/CommandCenter.tsx) | ToggleButton | <ViewInArOutlined sx={{ fontSize: 16, mr: 0.75 }} /> 3D Campus | `` |
| [apps/web/src/pages/CommandCenter.tsx:689](../../apps/web/src/pages/CommandCenter.tsx) | ToggleButton | <MapOutlined sx={{ fontSize: 16, mr: 0.75 }} /> 2D Tactical Floor | `` |
| [apps/web/src/pages/CommandCenter.tsx:692](../../apps/web/src/pages/CommandCenter.tsx) | ToggleButton | <SpeedOutlined sx={{ fontSize: 16, mr: 0.75 }} /> Operations Radar | `` |
| [apps/web/src/pages/CommandCenter.tsx:699](../../apps/web/src/pages/CommandCenter.tsx) | IconButton | Toggle Strategy Audio Effects | `{handleSoundToggle}` |
| [apps/web/src/pages/CommandCenter.tsx:740](../../apps/web/src/pages/CommandCenter.tsx) | IconButton | Refresh all data | `{handleRefresh}` |
| [apps/web/src/pages/CommandCenter.tsx:756](../../apps/web/src/pages/CommandCenter.tsx) | IconButton | {floorExpanded ? 'Collapse floor' : 'Expand floor'} | `{() => { sfx.playClick(); setFloorExpanded((v) => !v); }}` |
| [apps/web/src/pages/CommandCenter.tsx:825](../../apps/web/src/pages/CommandCenter.tsx) | Button | Retry | `{handleRefresh}` |
| [apps/web/src/pages/CommerceDesk.tsx:96](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Item | `{e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, itemId: Number(e.target.value) } : entry) }))}` |
| [apps/web/src/pages/CommerceDesk.tsx:96](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Qty | `{e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, quantity: e.target.value } : entry) }))}` |
| [apps/web/src/pages/CommerceDesk.tsx:96](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Rate | `{e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, rate: e.target.value } : entry) }))}` |
| [apps/web/src/pages/CommerceDesk.tsx:96](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Discount | `{e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, discount: e.target.value } : entry) }))}` |
| [apps/web/src/pages/CommerceDesk.tsx:96](../../apps/web/src/pages/CommerceDesk.tsx) | Button | + Add line | `{() => setSales((old: any) => ({ ...old, lines: [...old.lines, { itemId: '', quantity: '', rate: '', discount: '' }] }))}` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Customer | `{() => setCustomerOpen(true)}` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Order | `{() => setOrderOpen(true)}` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Invoice Studio | `{() => setInvoiceOpen(true)}` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Tabs | <Tab icon={<CatalogueIcon />} iconPosition="start" label="Catalogue" /> <Tab icon={<CustomerIcon />} iconPosition="start" label="Customers & Ledger" /> <Tab icon={<OrderIcon />} iconPosition="start" label="Sales Orders" /> <Tab icon={<InvoiceIcon />} iconPosition="start" label="Invoices" /> | `{(_, value) => setTab(value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Tab | Catalogue | `` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Tab | Customers & Ledger | `` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Tab | Sales Orders | `` |
| [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) | Tab | Invoices | `` |
| [apps/web/src/pages/CommerceDesk.tsx:98](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Add catalogue item | `{() => { setEditingItemId(null); setItem(emptyItem()); setItemOpen(true); }}` |
| [apps/web/src/pages/CommerceDesk.tsx:98](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Edit | `{() => editItem(x)}` |
| [apps/web/src/pages/CommerceDesk.tsx:98](../../apps/web/src/pages/CommerceDesk.tsx) | Button | History | `{() => setHistoryItem(x)}` |
| [apps/web/src/pages/CommerceDesk.tsx:98](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Adjust | `{() => setAdjustItem(x)}` |
| [apps/web/src/pages/CommerceDesk.tsx:98](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Archive | `{async () => { if (!window.confirm('Archive ${x.name}? Historical documents will remain.')) return; try { await api.delete('/commerce/items/${x.id}'); await refresh(['commerce-items']); toast.success('Item archived'); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not archive item'); } }}` |
| [apps/web/src/pages/CommerceDesk.tsx:99](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Edit | `{() => editCustomer(x)}` |
| [apps/web/src/pages/CommerceDesk.tsx:99](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Ledger | `{async () => { try { setLedgerName(x.name); setLedger((await api.get('/commerce/customers/${x.id}/ledger')).data); } catch { toast.error('Could not load ledger'); } }}` |
| [apps/web/src/pages/CommerceDesk.tsx:100](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Invoice | `{() => convertOrder(x)}` |
| [apps/web/src/pages/CommerceDesk.tsx:100](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Cancel remaining | `{async()=>{try{await api.post('/commerce/orders/${x.id}/cancel',{notes:'Cancelled from Business Desk'});await refresh(['commerce-orders','commerce-items']);toast.success('Order cancelled and stock released');}catch(e:any){toast.error(e.response?.data?.message\|\|'Could not cancel order')}}}` |
| [apps/web/src/pages/CommerceDesk.tsx:101](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Download PDF | `{()=>downloadInvoicePdf(x)}` |
| [apps/web/src/pages/CommerceDesk.tsx:101](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Payments | `{() => { setPaymentInvoiceId(x.id); setPaymentKey(crypto.randomUUID()); setPaymentAmount(''); setPaymentNotes(''); }}` |
| [apps/web/src/pages/CommerceDesk.tsx:101](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Void | `{async()=>{if(!window.confirm('Void invoice ${x.invoiceNo}? This reverses billing. Direct-sale stock is returned; an existing dispatch stays dispatched.'))return;try{await api.post('/commerce/invoices/${x.id}/void',{notes:'Voided from Invoice Studio'});await refresh(['commerce-invoices','commerce-customers','commerce-items']);toast.success('Invoice voided')}catch(e:any){toast.error(e.response?.data?.message\|\|'Could not void invoice')}}}` |
| [apps/web/src/pages/CommerceDesk.tsx:108](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Amount received | `{e => setPaymentAmount(e.target.value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:109](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Method | `{e => setPaymentMethod(e.target.value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:110](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Receipt reference / reversal reason | `{e => setPaymentNotes(e.target.value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:111](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Record payment | `{async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments', { amount: Number(paymentAmount), method: paymentMethod, reference: paymentNotes, idempotencyKey: paymentKey }); setPaymentAmount(''); setPaymentKey(crypto.randomUUID()); await refresh(['commerce-invoices', 'commerce-customers']); toast.success('Payment recorded'); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not record payment'); } finally { setPaymentSaving(false); } }}` |
| [apps/web/src/pages/CommerceDesk.tsx:118](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Reverse | `{async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments/' + payment.id + '/reverse', { notes: paymentNotes }); await refresh(['commerce-invoices', 'commerce-customers']); toast.success('Payment reversed; original receipt retained'); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not reverse payment'); } finally { setPaymentSaving(false); } }}` |
| [apps/web/src/pages/CommerceDesk.tsx:122](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Close | `{() => setPaymentInvoiceId(null)}` |
| [apps/web/src/pages/CommerceDesk.tsx:127](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Name | `{e => setItem({ ...item, name: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:127](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | SKU | `{e => setItem({ ...item, sku: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:128](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Public product description | `{e => setItem({ ...item, description: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:129](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Type | `{e => setItem({ ...item, type: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:129](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | UOM | `{e => setItem({ ...item, uom: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:131](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Brand | `{e => setItem({ ...item, brandId: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:132](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Category | `{e => setItem({ ...item, categoryId: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:134](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | HSN/SAC | `{e => setItem({ ...item, hsnSac: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:134](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | GST % | `{e => setItem({ ...item, gstRate: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:134](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Sale price | `{e => setItem({ ...item, salePrice: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:135](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Cost price | `{e => setItem({ ...item, costPrice: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:135](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Low-stock threshold | `{e => setItem({ ...item, reorderLevel: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:136](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Product image reference | `{e => setItem({ ...item, imageUrl: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:140](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Cancel | `{() => setItemOpen(false)}` |
| [apps/web/src/pages/CommerceDesk.tsx:140](../../apps/web/src/pages/CommerceDesk.tsx) | Button | {busy ? 'Saving…' : 'Save'} | `{saveItem}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Name | `{e => setCustomer({ ...customer, name: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Phone | `{e => setCustomer({ ...customer, phone: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Email | `{e => setCustomer({ ...customer, email: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | GSTIN | `{e => { const gstin = e.target.value.toUpperCase(); setCustomer({ ...customer, gstin, state: customer.state \|\| gstinStateName(gstin) \|\| '' }); }}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | State | `{e => setCustomer({ ...customer, state: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Address | `{e => setCustomer({ ...customer, address: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Cancel | `{() => setCustomerOpen(false)}` |
| [apps/web/src/pages/CommerceDesk.tsx:142](../../apps/web/src/pages/CommerceDesk.tsx) | Button | {busy ? 'Saving…' : 'Save'} | `{saveCustomer}` |
| [apps/web/src/pages/CommerceDesk.tsx:143](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Quantity change | `{e => setAdjustQuantity(e.target.value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:143](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Reason | `{e => setAdjustNotes(e.target.value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:143](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Cancel | `{() => setAdjustItem(null)}` |
| [apps/web/src/pages/CommerceDesk.tsx:143](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Record adjustment | `{submitAdjustment}` |
| [apps/web/src/pages/CommerceDesk.tsx:144](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Close | `{() => setHistoryItem(null)}` |
| [apps/web/src/pages/CommerceDesk.tsx:145](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Customer | `{e => setOrder({ ...order, customerId: Number(e.target.value) })}` |
| [apps/web/src/pages/CommerceDesk.tsx:145](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Notes | `{e => setOrder({ ...order, notes: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:145](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Cancel | `{() => setOrderOpen(false)}` |
| [apps/web/src/pages/CommerceDesk.tsx:145](../../apps/web/src/pages/CommerceDesk.tsx) | Button | {busy ? 'Reserving…' : 'Reserve stock'} | `{submitOrder}` |
| [apps/web/src/pages/CommerceDesk.tsx:154](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Customer | `{e => setInvoice({ ...invoice, customerId: Number(e.target.value) })}` |
| [apps/web/src/pages/CommerceDesk.tsx:157](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Issued from | `` |
| [apps/web/src/pages/CommerceDesk.tsx:158](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Invoice date | `{e => setInvoice({ ...invoice, date: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:159](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Due Date | `{e => setInvoice({ ...invoice, dueDate: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:163](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Delivery time (optional) | `{e => setInvoiceStockDate(e.target.value)}` |
| [apps/web/src/pages/CommerceDesk.tsx:164](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Stock flow | `{e => { const outwardId = Number(e.target.value) \|\| ''; const selected = dispatches.find(row => row.id === outwardId); if (!selected) { setInvoice({ ...invoice, outwardId: '', lines: [{ itemId: '', quantity: '', rate: '', discount: '' }] }); return; } const buyer = customers.find(row => row.name.trim().toLowerCase() === selected.customerName.trim().toLowerCase()); if (!buyer) { toast.error('Add the dispatch customer in Customers before billing it'); return; } const lines = selected.items.map((row: any) => { const stockItem = items.find(item => item.type === 'YARN' && (item.legacyId === row.count \|\| item.sku === 'LEGACY-YARN-' + row.count)); const billed = invoices.filter(doc => doc.outwardId === selected.id && doc.status !== 'VOID').flatMap(doc => doc.items).filter(line => line.itemId === stockItem?.id).reduce((sum, line) => sum + Number(line.quantity \|\| 0), 0); return { itemId: stockItem?.id \|\| '' as const, quantity: String(Math.max(0, row.weight - billed)), rate: String(stockItem?.salePrice \|\| 0), discount: '' }; }).filter((line: Line) => Number(line.quantity) > 0); setInvoice({ ...invoice, outwardId, customerId: buyer.id, vehicleNo: selected.vehicleNo \|\| '', lines }); }}` |
| [apps/web/src/pages/CommerceDesk.tsx:186](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Template Theme | `{e => setInvoice({ ...invoice, theme: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:191](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Transport Mode | `{e => setInvoice({ ...invoice, transportMode: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:192](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Vehicle Number | `{e => setInvoice({ ...invoice, vehicleNo: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:193](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Authorised Signatory | `{e => setInvoice({ ...invoice, issuerSignature: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:197](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Customer Notes | `{e => setInvoice({ ...invoice, notes: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:198](../../apps/web/src/pages/CommerceDesk.tsx) | TextField | Payment Terms | `{e => setInvoice({ ...invoice, terms: e.target.value })}` |
| [apps/web/src/pages/CommerceDesk.tsx:223](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Cancel | `{() => setInvoiceOpen(false)}` |
| [apps/web/src/pages/CommerceDesk.tsx:225](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Finalise | `{() => submitInvoice(false)}` |
| [apps/web/src/pages/CommerceDesk.tsx:226](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Finalise & Download PDF | `{() => submitInvoice(true)}` |
| [apps/web/src/pages/CommerceDesk.tsx:230](../../apps/web/src/pages/CommerceDesk.tsx) | Button | Close | `{() => setLedger(null)}` |
| [apps/web/src/pages/CommerceReports.tsx:203](../../apps/web/src/pages/CommerceReports.tsx) | Button | Refresh | `{handleRefresh}` |
| [apps/web/src/pages/CommerceReports.tsx:211](../../apps/web/src/pages/CommerceReports.tsx) | Button | Print Report | `{handlePrint}` |
| [apps/web/src/pages/CommerceReports.tsx:289](../../apps/web/src/pages/CommerceReports.tsx) | Tabs | <Tab icon={<MoneyIcon fontSize="small" />} iconPosition="start" label={`Outstanding Receivables (${debtorCustomers.length})`} /> <Tab icon={<StockIcon fontSize="small" />} iconPosition="start" label={`Low Stock Watchlist (${reportData?.lowStock?.length \|\| 0})`} /> <Tab icon={<InvoiceIcon fontSize="small" />} iconPosition="start" label={`Recent Invoices (${invoices.length})`} /> <Tab icon={<Order | `{(_, val) => setTabIndex(val)}` |
| [apps/web/src/pages/CommerceReports.tsx:295](../../apps/web/src/pages/CommerceReports.tsx) | Tab | {`Outstanding Receivables (${debtorCustomers.length})`} | `` |
| [apps/web/src/pages/CommerceReports.tsx:300](../../apps/web/src/pages/CommerceReports.tsx) | Tab | {`Low Stock Watchlist (${reportData?.lowStock?.length \|\| 0})`} | `` |
| [apps/web/src/pages/CommerceReports.tsx:305](../../apps/web/src/pages/CommerceReports.tsx) | Tab | {`Recent Invoices (${invoices.length})`} | `` |
| [apps/web/src/pages/CommerceReports.tsx:310](../../apps/web/src/pages/CommerceReports.tsx) | Tab | {`Sales Orders (${orders.length})`} | `` |
| [apps/web/src/pages/CommerceReports.tsx:318](../../apps/web/src/pages/CommerceReports.tsx) | TextField | <TextField size="small" placeholder="Search in tab..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon fontSize="small" color="action" /> </InputAdornment> ), }} sx={{ width: { xs: '100%', sm: 240 } }} /> | `{(e) => setSearchQuery(e.target.value)}` |
| [apps/web/src/pages/Costing.tsx:227](../../apps/web/src/pages/Costing.tsx) | Select | Date Filter | `{(e) => setDateFilter(e.target.value as DateFilterType)}` |
| [apps/web/src/pages/Costing.tsx:260](../../apps/web/src/pages/Costing.tsx) | Button | Add Cost | `{() => { setOpenWizard(true); }}` |
| [apps/web/src/pages/Costing.tsx:273](../../apps/web/src/pages/Costing.tsx) | Tabs | <Tab label="Dashboard" /> <Tab label="EB (Electricity)" /> <Tab label="Employee" /> <Tab label="Packaging" /> <Tab label="Maintenance" /> <Tab label="Expenses" /> | `{(_, newValue) => setTabValue(newValue)}` |
| [apps/web/src/pages/Costing.tsx:274](../../apps/web/src/pages/Costing.tsx) | Tab | Dashboard | `` |
| [apps/web/src/pages/Costing.tsx:275](../../apps/web/src/pages/Costing.tsx) | Tab | EB (Electricity) | `` |
| [apps/web/src/pages/Costing.tsx:276](../../apps/web/src/pages/Costing.tsx) | Tab | Employee | `` |
| [apps/web/src/pages/Costing.tsx:277](../../apps/web/src/pages/Costing.tsx) | Tab | Packaging | `` |
| [apps/web/src/pages/Costing.tsx:278](../../apps/web/src/pages/Costing.tsx) | Tab | Maintenance | `` |
| [apps/web/src/pages/Costing.tsx:279](../../apps/web/src/pages/Costing.tsx) | Tab | Expenses | `` |
| [apps/web/src/pages/Costing.tsx:458](../../apps/web/src/pages/Costing.tsx) | IconButton | <DeleteIcon fontSize="small" /> | `{() => handleDeleteEntry(entry.id)}` |
| [apps/web/src/pages/Costing.tsx:487](../../apps/web/src/pages/Costing.tsx) | IconButton | <DeleteIcon fontSize="small" /> | `{() => handleDeleteEntry(entry.id)}` |
| [apps/web/src/pages/Costing.tsx:524](../../apps/web/src/pages/Costing.tsx) | IconButton | <CloseIcon /> | `{() => setOpenWizard(false)}` |
| [apps/web/src/pages/CostingEntry.tsx:391](../../apps/web/src/pages/CostingEntry.tsx) | Tabs | <Tab label="EB (Electricity)" /> <Tab label="Employee Costs" /> <Tab label="Packaging" /> <Tab label="Maintenance" /> <Tab label="Expenses" /> | `{(_, newValue) => setTabValue(newValue)}` |
| [apps/web/src/pages/CostingEntry.tsx:392](../../apps/web/src/pages/CostingEntry.tsx) | Tab | EB (Electricity) | `` |
| [apps/web/src/pages/CostingEntry.tsx:393](../../apps/web/src/pages/CostingEntry.tsx) | Tab | Employee Costs | `` |
| [apps/web/src/pages/CostingEntry.tsx:394](../../apps/web/src/pages/CostingEntry.tsx) | Tab | Packaging | `` |
| [apps/web/src/pages/CostingEntry.tsx:395](../../apps/web/src/pages/CostingEntry.tsx) | Tab | Maintenance | `` |
| [apps/web/src/pages/CostingEntry.tsx:396](../../apps/web/src/pages/CostingEntry.tsx) | Tab | Expenses | `` |
| [apps/web/src/pages/CostingEntry.tsx:403](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Units Consumed (kWh) | `{(e) => setEbData({ ...ebData, unitsConsumed: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:409](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Rate per Unit (₹) | `{(e) => setEbData({ ...ebData, ratePerUnit: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:415](../../apps/web/src/pages/CostingEntry.tsx) | TextField | No of Shifts | `{(e) => setEbData({ ...ebData, noOfShifts: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:425](../../apps/web/src/pages/CostingEntry.tsx) | Button | {existingEB ? (existingEB.posted ? 'Posted' : 'Update') : 'Save'} | `{handleEBSubmit}` |
| [apps/web/src/pages/CostingEntry.tsx:434](../../apps/web/src/pages/CostingEntry.tsx) | TextField | No of Shifts | `{(e) => setEmployeeData({ ...employeeData, noOfShifts: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:444](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Workers | `{(e) => setEmployeeData({ ...employeeData, workers: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:445](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Rate (₹/day) | `{(e) => setEmployeeData({ ...employeeData, workerRate: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:447](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Overtime Cost (₹) | `{(e) => setEmployeeData({ ...employeeData, overtime: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:452](../../apps/web/src/pages/CostingEntry.tsx) | Button | {existingEmployee ? (existingEmployee.posted ? 'Posted' : 'Update') : 'Save'} | `{handleEmployeeSubmit}` |
| [apps/web/src/pages/CostingEntry.tsx:482](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Package Rate (₹/kg) | `{(e) => setPackagingData({ ...packagingData, rate: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:495](../../apps/web/src/pages/CostingEntry.tsx) | Button | {existingPackaging ? (existingPackaging.posted ? 'Posted' : 'Update') : 'Confirm'} | `{handlePackagingSubmit}` |
| [apps/web/src/pages/CostingEntry.tsx:531](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Rate (₹/kg) | `{(e) => setMaintenanceData({ ...maintenanceData, ratePerKg: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:532](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Description | `{(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:534](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Total Cost | `{(e) => setMaintenanceData({ ...maintenanceData, totalCost: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:535](../../apps/web/src/pages/CostingEntry.tsx) | Button | Apply Formula | `{() => setMaintenanceData({ ...maintenanceData, totalCost: maintenanceFormulaCost.toFixed(2) })}` |
| [apps/web/src/pages/CostingEntry.tsx:538](../../apps/web/src/pages/CostingEntry.tsx) | Button | {existingMaintenance ? (existingMaintenance.posted ? 'Posted' : 'Update') : 'Save'} | `{handleMaintenanceSubmit}` |
| [apps/web/src/pages/CostingEntry.tsx:546](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Title | `{(e) => setExpenseData({ ...expenseData, title: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:547](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Type | `{(e) => setExpenseData({ ...expenseData, type: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:551](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Amount | `{(e) => setExpenseData({ ...expenseData, amount: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:552](../../apps/web/src/pages/CostingEntry.tsx) | TextField | Description | `{(e) => setExpenseData({ ...expenseData, description: e.target.value })}` |
| [apps/web/src/pages/CostingEntry.tsx:553](../../apps/web/src/pages/CostingEntry.tsx) | Button | Save Expense | `{handleExpenseSubmit}` |
| [apps/web/src/pages/Dashboard.tsx:366](../../apps/web/src/pages/Dashboard.tsx) | Button | {label} | `{onClick}` |
| [apps/web/src/pages/Dashboard.tsx:413](../../apps/web/src/pages/Dashboard.tsx) | Button | Record Production | `{() => navigate('production')}` |
| [apps/web/src/pages/Dashboard.tsx:416](../../apps/web/src/pages/Dashboard.tsx) | Button | Add Inward | `{() => navigate('inward')}` |
| [apps/web/src/pages/Dashboard.tsx:471](../../apps/web/src/pages/Dashboard.tsx) | Button | Record Production | `{() => navigate('production')}` |
| [apps/web/src/pages/Dashboard.tsx:472](../../apps/web/src/pages/Dashboard.tsx) | Button | Add Inward | `{() => navigate('inward')}` |
| [apps/web/src/pages/Dashboard.tsx:473](../../apps/web/src/pages/Dashboard.tsx) | Button | View Stock | `{() => navigate('inventory')}` |
| [apps/web/src/pages/Dashboard.tsx:511](../../apps/web/src/pages/Dashboard.tsx) | Button | Review Challans &amp; Generate Invoices | `{() => navigate('outward')}` |
| [apps/web/src/pages/Dashboard.tsx:558](../../apps/web/src/pages/Dashboard.tsx) | Select | Period | `{handleDateFilterChange}` |
| [apps/web/src/pages/Dashboard.tsx:902](../../apps/web/src/pages/Dashboard.tsx) | Button | View all logs | `{() => navigate('logs')}` |
| [apps/web/src/pages/Helpdesk.tsx:175](../../apps/web/src/pages/Helpdesk.tsx) | TextField | <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}> <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}> <HelpIcon color="primary" /> <Typography variant="h6" fontWeight={800}>Frequently Asked Questions</Typography> </Box> <Chip label={`${filteredFAQs.length} found`} size="small" variant="outlined" /> </Box> <TextField fullWidth size="smal | `{(e) => setFaqSearch(e.target.value)}` |
| [apps/web/src/pages/Helpdesk.tsx:231](../../apps/web/src/pages/Helpdesk.tsx) | Button | Raise another | `{() => { setSubmitted(false); setTicketForm({ subject: '', type: 'Bug', description: '' }); }}` |
| [apps/web/src/pages/Helpdesk.tsx:236](../../apps/web/src/pages/Helpdesk.tsx) | TextField | Subject | `{(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}` |
| [apps/web/src/pages/Helpdesk.tsx:237](../../apps/web/src/pages/Helpdesk.tsx) | TextField | Type | `{(e) => setTicketForm({ ...ticketForm, type: e.target.value })}` |
| [apps/web/src/pages/Helpdesk.tsx:243](../../apps/web/src/pages/Helpdesk.tsx) | TextField | Description | `{(e) => setTicketForm({ ...ticketForm, description: e.target.value })}` |
| [apps/web/src/pages/Helpdesk.tsx:244](../../apps/web/src/pages/Helpdesk.tsx) | Button | Save draft | `{handleSubmitTicket}` |
| [apps/web/src/pages/Insights.tsx:81](../../apps/web/src/pages/Insights.tsx) | Button | Export All | `{() => alert('All reports exported successfully!')}` |
| [apps/web/src/pages/Insights.tsx:109](../../apps/web/src/pages/Insights.tsx) | Button | Generate Reports → | `{() => alert('${cat.category} reports generated successfully!')}` |
| [apps/web/src/pages/Insights.tsx:262](../../apps/web/src/pages/Insights.tsx) | Tabs | {INSIGHT_TABS.map((t, i) => ( <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" /> ))} | `{(_, v) => setTab(v)}` |
| [apps/web/src/pages/Insights.tsx:275](../../apps/web/src/pages/Insights.tsx) | Tab | {t.label} | `` |
| [apps/web/src/pages/Integrations.tsx:47](../../apps/web/src/pages/Integrations.tsx) | Tabs | <Tab label="Import data" /> <Tab label="Connectors" /> <Tab label="API & webhooks" /> <Tab label="Import history" /> | `{(_, value) => setTab(value)}` |
| [apps/web/src/pages/Integrations.tsx:48](../../apps/web/src/pages/Integrations.tsx) | Tab | Import data | `` |
| [apps/web/src/pages/Integrations.tsx:48](../../apps/web/src/pages/Integrations.tsx) | Tab | Connectors | `` |
| [apps/web/src/pages/Integrations.tsx:48](../../apps/web/src/pages/Integrations.tsx) | Tab | API & webhooks | `` |
| [apps/web/src/pages/Integrations.tsx:48](../../apps/web/src/pages/Integrations.tsx) | Tab | Import history | `` |
| [apps/web/src/pages/Integrations.tsx:52](../../apps/web/src/pages/Integrations.tsx) | TextField | Import into | `{e => { setEntity(e.target.value as ImportEntity); setInput(null); invalidatePreview(); }}` |
| [apps/web/src/pages/Integrations.tsx:55](../../apps/web/src/pages/Integrations.tsx) | TextField | Source name | `{e => { setSource(e.target.value); invalidatePreview(); }}` |
| [apps/web/src/pages/Integrations.tsx:56](../../apps/web/src/pages/Integrations.tsx) | Button | Choose CSV <input type="file" accept=".csv,text/csv" hidden onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; invalidatePreview(); setInput(null); try { if (file.size > 500_000) throw new Error('Use a CSV smaller than 500 KB.'); const parsed = parseImportCsv(await file.text()); setInput({ entity, ...parsed, mapping: {} }); } catch (error) { showError( | `` |
| [apps/web/src/pages/Integrations.tsx:68](../../apps/web/src/pages/Integrations.tsx) | TextField | {`Map ${field}`} | `{event => { const mapping = { ...input.mapping }; if (event.target.value === '') delete mapping[field]; else mapping[field] = Number(event.target.value); setInput({ ...input, mapping }); invalidatePreview(); }}` |
| [apps/web/src/pages/Integrations.tsx:72](../../apps/web/src/pages/Integrations.tsx) | Button | Validate and preview | `{check}` |
| [apps/web/src/pages/Integrations.tsx:80](../../apps/web/src/pages/Integrations.tsx) | Button | Import {preview.records.length} records | `{commit}` |
| [apps/web/src/pages/Integrations.tsx:99](../../apps/web/src/pages/Integrations.tsx) | Button | Retry | `{() => history.refetch()}` |
| [apps/web/src/pages/Inventory.tsx:483](../../apps/web/src/pages/Inventory.tsx) | Select | Date Filter | `{handleDateFilterChange}` |
| [apps/web/src/pages/Inventory.tsx:499](../../apps/web/src/pages/Inventory.tsx) | Tabs | <Tab label="Dashboard" /> <Tab label="Cotton Inventory" /> <Tab label="Yarn Inventory" /> <Tab label="Waste Logs" /> <Tab label="All History" /> | `{(_, newValue) => setTabValue(newValue)}` |
| [apps/web/src/pages/Inventory.tsx:500](../../apps/web/src/pages/Inventory.tsx) | Tab | Dashboard | `` |
| [apps/web/src/pages/Inventory.tsx:501](../../apps/web/src/pages/Inventory.tsx) | Tab | Cotton Inventory | `` |
| [apps/web/src/pages/Inventory.tsx:502](../../apps/web/src/pages/Inventory.tsx) | Tab | Yarn Inventory | `` |
| [apps/web/src/pages/Inventory.tsx:503](../../apps/web/src/pages/Inventory.tsx) | Tab | Waste Logs | `` |
| [apps/web/src/pages/Inventory.tsx:504](../../apps/web/src/pages/Inventory.tsx) | Tab | All History | `` |
| [apps/web/src/pages/Inventory.tsx:622](../../apps/web/src/pages/Inventory.tsx) | Button | Manage Waste stock | `{() => { setWasteForm({ date: new Date().toLocaleDateString('en-CA'), quantity: '', buyer: '', price: '' }); setWasteAction('recycle'); setWasteModalOpen(true); }}` |
| [apps/web/src/pages/Inventory.tsx:706](../../apps/web/src/pages/Inventory.tsx) | IconButton | <EditIcon fontSize="small" /> | `{() => { setWasteAction(row.type === 'EXPORT' ? 'export' : 'recycle'); setWasteForm({ date: new Date(row.date).toLocaleDateString('en-CA'), quantity: Math.abs(row.quantity).toString(), buyer: row.reference.startsWith('SOLD-') ? row.reference.replace('SOLD-', '') : '', price: '' // Price is not stored in inventory log currently }); // Since we don't have PUT, we'll suggest deleting and re-adding toast.info(INFO_MESSAGES.EDIT_WORKFLOW_DELETE_CREATE); setWasteModalOpen(true); // We could set editingWasteId here if we wanted to handle it in submit }}` |
| [apps/web/src/pages/Inventory.tsx:726](../../apps/web/src/pages/Inventory.tsx) | IconButton | <DeleteIcon fontSize="small" /> | `{() => handleDeleteWaste(row.id)}` |
| [apps/web/src/pages/Inventory.tsx:753](../../apps/web/src/pages/Inventory.tsx) | TextField | <TextField placeholder="Search reference, material, type..." size="small" sx={{ maxWidth: 300, flex: 1 }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> <FormControl sx={{ minWidth: 200 }} size="small"> <InputLabel>Type Filter</InputLabel> <Select value={historyTypeFilter} label="Type Filter" onChange={(e) => setHistoryTypeFilter(e.target.value)}> <MenuItem value="all">All | `{(e) => setSearchQuery(e.target.value)}` |
| [apps/web/src/pages/Inventory.tsx:762](../../apps/web/src/pages/Inventory.tsx) | Select | Type Filter | `{(e) => setHistoryTypeFilter(e.target.value)}` |
| [apps/web/src/pages/Inventory.tsx:850](../../apps/web/src/pages/Inventory.tsx) | Select | Action | `{(e) => setWasteAction(e.target.value as 'recycle' \| 'export')}` |
| [apps/web/src/pages/Inventory.tsx:872](../../apps/web/src/pages/Inventory.tsx) | TextField | Quantity (kg) | `{(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })}` |
| [apps/web/src/pages/Inventory.tsx:883](../../apps/web/src/pages/Inventory.tsx) | TextField | Buyer Name | `{(e) => setWasteForm({ ...wasteForm, buyer: e.target.value })}` |
| [apps/web/src/pages/Inventory.tsx:890](../../apps/web/src/pages/Inventory.tsx) | TextField | Price (Total) | `{(e) => setWasteForm({ ...wasteForm, price: e.target.value })}` |
| [apps/web/src/pages/Inventory.tsx:903](../../apps/web/src/pages/Inventory.tsx) | Button | Cancel | `{() => setWasteModalOpen(false)}` |
| [apps/web/src/pages/Inventory.tsx:904](../../apps/web/src/pages/Inventory.tsx) | Button | Submit | `{handleWasteSubmit}` |
| [apps/web/src/pages/InwardEntry.tsx:319](../../apps/web/src/pages/InwardEntry.tsx) | Select | Date Filter | `{handleDateFilterChange}` |
| [apps/web/src/pages/InwardEntry.tsx:353](../../apps/web/src/pages/InwardEntry.tsx) | Button | Weighbridge receipt | `{() => setOpenWeighbridge(true)}` |
| [apps/web/src/pages/InwardEntry.tsx:355](../../apps/web/src/pages/InwardEntry.tsx) | Button | Merge ( {selectedBatches.length} ) | `{handleMergeBatches}` |
| [apps/web/src/pages/InwardEntry.tsx:366](../../apps/web/src/pages/InwardEntry.tsx) | Button | Add Batch | `{() => { setReceiptTime(localTimeValue()); setOpenWizard(true); }}` |
| [apps/web/src/pages/InwardEntry.tsx:413](../../apps/web/src/pages/InwardEntry.tsx) | TextField | {<RequiredLabel label="Date" required />} | `{(e: any) => handleInputChange(e)}` |
| [apps/web/src/pages/InwardEntry.tsx:425](../../apps/web/src/pages/InwardEntry.tsx) | TextField | Receipt time | `{e => setReceiptTime(e.target.value)}` |
| [apps/web/src/pages/InwardEntry.tsx:435](../../apps/web/src/pages/InwardEntry.tsx) | TextField | {<RequiredLabel label="Supplier Name" required />} | `` |
| [apps/web/src/pages/InwardEntry.tsx:448](../../apps/web/src/pages/InwardEntry.tsx) | TextField | {<RequiredLabel label="Total Bales" required />} | `{handleInputChange}` |
| [apps/web/src/pages/InwardEntry.tsx:461](../../apps/web/src/pages/InwardEntry.tsx) | TextField | {<RequiredLabel label="Total Weight (kg)" required />} | `{handleInputChange}` |
| [apps/web/src/pages/InwardEntry.tsx:494](../../apps/web/src/pages/InwardEntry.tsx) | Button | Cancel | `{() => { setOpenWizard(false); setTouched({}); }}` |
| [apps/web/src/pages/InwardEntry.tsx:497](../../apps/web/src/pages/InwardEntry.tsx) | Button | {isSubmitting ? 'Saving...' : 'Add Batch'} | `{handleSubmit}` |
| [apps/web/src/pages/InwardEntry.tsx:650](../../apps/web/src/pages/InwardEntry.tsx) | IconButton | <QrIcon fontSize="small" /> | `{() => setLabelBatch(row)}` |
| [apps/web/src/pages/InwardEntry.tsx:656](../../apps/web/src/pages/InwardEntry.tsx) | IconButton | <DeleteIcon fontSize="small" /> | `{() => handleDeleteBatch(row.id)}` |
| [apps/web/src/pages/JobWork.tsx:298](../../apps/web/src/pages/JobWork.tsx) | Button | Add Worker | `{() => setWorkerOpen(true)}` |
| [apps/web/src/pages/JobWork.tsx:305](../../apps/web/src/pages/JobWork.tsx) | Button | New Dispatch | `{() => setOpen(true)}` |
| [apps/web/src/pages/JobWork.tsx:398](../../apps/web/src/pages/JobWork.tsx) | TextField | <TextField size="small" placeholder="Search challan, worker, material..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon fontSize="small" color="action" /> </InputAdornment> ), }} sx={{ width: { xs: '100%', sm: 260 } }} /> <IconButton onClick={refresh} title="Refresh challans"> <RefreshIcon fontSize | `{(e) => setSearchQuery(e.target.value)}` |
| [apps/web/src/pages/JobWork.tsx:412](../../apps/web/src/pages/JobWork.tsx) | IconButton | <RefreshIcon fontSize="small" /> | `{refresh}` |
| [apps/web/src/pages/JobWork.tsx:508](../../apps/web/src/pages/JobWork.tsx) | Button | Receive | `{() => openReceipt(job)}` |
| [apps/web/src/pages/JobWork.tsx:517](../../apps/web/src/pages/JobWork.tsx) | Button | Cancel & return | `{async () => { if (!window.confirm('Confirm the outstanding material has physically returned. Received material and recorded scrap will be retained.')) return; try { await api.post('/job-work/${job.id}/cancel', { notes: 'Outstanding material returned; job cancelled', returnConfirmed: true }); await refresh(); toast.success('Job cancelled; outstanding material returned once'); } catch (error: any) { toast.error(error.response?.data?.message \|\| 'Could not cancel job'); } }}` |
| [apps/web/src/pages/JobWork.tsx:544](../../apps/web/src/pages/JobWork.tsx) | TextField | Job Worker | `{(e) => setForm({ ...form, jobWorkerId: Number(e.target.value) }) }` |
| [apps/web/src/pages/JobWork.tsx:560](../../apps/web/src/pages/JobWork.tsx) | TextField | Process Type | `{(e) => setForm({ ...form, processType: e.target.value }) }` |
| [apps/web/src/pages/JobWork.tsx:576](../../apps/web/src/pages/JobWork.tsx) | TextField | Dispatch Date | `{(e) => setForm({ ...form, date: e.target.value }) }` |
| [apps/web/src/pages/JobWork.tsx:594](../../apps/web/src/pages/JobWork.tsx) | TextField | Material Item | `{(e) => setForm({ ...form, lines: form.lines.map((entry, i) => i === index ? { ...entry, itemId: Number(e.target.value) } : entry ), }) }` |
| [apps/web/src/pages/JobWork.tsx:617](../../apps/web/src/pages/JobWork.tsx) | TextField | Quantity | `{(e) => setForm({ ...form, lines: form.lines.map((entry, i) => i === index ? { ...entry, quantity: e.target.value } : entry ), }) }` |
| [apps/web/src/pages/JobWork.tsx:635](../../apps/web/src/pages/JobWork.tsx) | Button | Remove | `{() => setForm({ ...form, lines: form.lines.filter((_, i) => i !== index), }) }` |
| [apps/web/src/pages/JobWork.tsx:651](../../apps/web/src/pages/JobWork.tsx) | Button | + Add Another Material | `{() => setForm({ ...form, lines: [...form.lines, { itemId: '', quantity: '' }], }) }` |
| [apps/web/src/pages/JobWork.tsx:663](../../apps/web/src/pages/JobWork.tsx) | TextField | Notes / Instructions | `{(e) => setForm({ ...form, notes: e.target.value })}` |
| [apps/web/src/pages/JobWork.tsx:674](../../apps/web/src/pages/JobWork.tsx) | Button | Cancel | `{() => setOpen(false)}` |
| [apps/web/src/pages/JobWork.tsx:675](../../apps/web/src/pages/JobWork.tsx) | Button | Confirm Dispatch | `{dispatch}` |
| [apps/web/src/pages/JobWork.tsx:704](../../apps/web/src/pages/JobWork.tsx) | TextField | Finished / Received Qty | `{(e) => setReceiptLines( receiptLines.map((entry, i) => i === index ? { ...entry, quantity: e.target.value } : entry ) ) }` |
| [apps/web/src/pages/JobWork.tsx:717](../../apps/web/src/pages/JobWork.tsx) | TextField | Scrap / Waste Qty | `{(e) => setReceiptLines( receiptLines.map((entry, i) => i === index ? { ...entry, scrapQty: e.target.value } : entry ) ) }` |
| [apps/web/src/pages/JobWork.tsx:737](../../apps/web/src/pages/JobWork.tsx) | Button | Cancel | `{() => setReceipt(null)}` |
| [apps/web/src/pages/JobWork.tsx:738](../../apps/web/src/pages/JobWork.tsx) | Button | Record Receipt & Close | `{saveReceipt}` |
| [apps/web/src/pages/JobWork.tsx:748](../../apps/web/src/pages/JobWork.tsx) | TextField | Worker / Vendor Name | `{(e) => setWorkerName(e.target.value)}` |
| [apps/web/src/pages/JobWork.tsx:759](../../apps/web/src/pages/JobWork.tsx) | Button | Cancel | `{() => setWorkerOpen(false)}` |
| [apps/web/src/pages/JobWork.tsx:760](../../apps/web/src/pages/JobWork.tsx) | Button | Save Worker | `{createWorker}` |
| [apps/web/src/pages/Logs.tsx:177](../../apps/web/src/pages/Logs.tsx) | TextField | <TextField size="small" placeholder="Search logs..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} sx={{ minWidth: 200, flex: 1 }} /> <TextField select size="small" label="Date Range" value={dateFilter} onChange={(e) => { setDateFilter(e.target.valu | `{(e) => { setSearchTerm(e.target.value); setPage(1); }}` |
| [apps/web/src/pages/Logs.tsx:187](../../apps/web/src/pages/Logs.tsx) | TextField | Date Range | `{(e) => { setDateFilter(e.target.value as DateFilterType); setPage(1); }}` |
| [apps/web/src/pages/Logs.tsx:203](../../apps/web/src/pages/Logs.tsx) | TextField | Module | `{(e) => { setModuleFilter(e.target.value); setPage(1); }}` |
| [apps/web/src/pages/Logs.tsx:211](../../apps/web/src/pages/Logs.tsx) | TextField | Action | `{(e) => { setActionFilter(e.target.value); setPage(1); }}` |
| [apps/web/src/pages/OperationsDesk.tsx:282](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Receive Stock | `{() => setInwardOpen(true)}` |
| [apps/web/src/pages/OperationsDesk.tsx:289](../../apps/web/src/pages/OperationsDesk.tsx) | Button | New Costing Sheet | `{() => setCostOpen(true)}` |
| [apps/web/src/pages/OperationsDesk.tsx:367](../../apps/web/src/pages/OperationsDesk.tsx) | Tabs | <Tab icon={<ShippingIcon fontSize="small" />} iconPosition="start" label={`Inward Receipts (${receipts.length})`} /> <Tab icon={<CostIcon fontSize="small" />} iconPosition="start" label={`Costing History (${costings.length})`} /> <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label={`Stock Traceability (${items.length})`} /> | `{(_, v) => setTab(v)}` |
| [apps/web/src/pages/OperationsDesk.tsx:373](../../apps/web/src/pages/OperationsDesk.tsx) | Tab | {`Inward Receipts (${receipts.length})`} | `` |
| [apps/web/src/pages/OperationsDesk.tsx:378](../../apps/web/src/pages/OperationsDesk.tsx) | Tab | {`Costing History (${costings.length})`} | `` |
| [apps/web/src/pages/OperationsDesk.tsx:383](../../apps/web/src/pages/OperationsDesk.tsx) | Tab | {`Stock Traceability (${items.length})`} | `` |
| [apps/web/src/pages/OperationsDesk.tsx:392](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | <TextField size="small" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon fontSize="small" color="action" /> </InputAdornment> ), }} sx={{ width: { xs: '100%', sm: 220 } }} /> <IconButton onClick={refresh} title="Refresh records"> <RefreshIcon fontSize="small" /> </IconButton> | `{(e) => setSearchQuery(e.target.value)}` |
| [apps/web/src/pages/OperationsDesk.tsx:406](../../apps/web/src/pages/OperationsDesk.tsx) | IconButton | <RefreshIcon fontSize="small" /> | `{refresh}` |
| [apps/web/src/pages/OperationsDesk.tsx:468](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Print | `{print}` |
| [apps/web/src/pages/OperationsDesk.tsx:536](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Duplicate | `{() => { try { const comps = typeof c.components === 'string' ? JSON.parse(c.components) : c.components \|\| []; setCosting({ styleCode: '${c.styleCode}-COPY', description: c.description \|\| '', components: comps.map((x: any) => ({ ...x, quantity: String(x.quantity \|\| x.qty \|\| ''), rate: String(x.rate \|\| ''), })), }); setCostOpen(true); } catch { toast.error('Could not parse costing components'); } }}` |
| [apps/web/src/pages/OperationsDesk.tsx:616](../../apps/web/src/pages/OperationsDesk.tsx) | Button | View History | `{async () => { try { setHistoryName(i.name); const res = await api.get('/commerce/items/${i.id}/movements'); setHistory(res.data); } catch { toast.error('Could not load movements ledger'); } }}` |
| [apps/web/src/pages/OperationsDesk.tsx:655](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Supplier Name | `{(e) => setInward({ ...inward, supplierName: e.target.value })}` |
| [apps/web/src/pages/OperationsDesk.tsx:662](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Reference / PO Number | `{(e) => setInward({ ...inward, referenceNumber: e.target.value })}` |
| [apps/web/src/pages/OperationsDesk.tsx:669](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Receipt Date | `{(e) => setInward({ ...inward, date: e.target.value })}` |
| [apps/web/src/pages/OperationsDesk.tsx:685](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Catalogue Item | `{(e) => setInward({ ...inward, lines: inward.lines.map((x, i) => i === index ? { ...x, itemId: Number(e.target.value) } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:706](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Quantity | `{(e) => setInward({ ...inward, lines: inward.lines.map((x, i) => i === index ? { ...x, quantity: e.target.value } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:721](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Unit Cost (₹) | `{(e) => setInward({ ...inward, lines: inward.lines.map((x, i) => i === index ? { ...x, unitCost: e.target.value } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:737](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Remove | `{() => setInward({ ...inward, lines: inward.lines.filter((_, i) => i !== index), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:753](../../apps/web/src/pages/OperationsDesk.tsx) | Button | + Add Item Line | `{() => setInward({ ...inward, lines: [...inward.lines, newRow()] })}` |
| [apps/web/src/pages/OperationsDesk.tsx:768](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Cancel | `{() => setInwardOpen(false)}` |
| [apps/web/src/pages/OperationsDesk.tsx:769](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Post Receipt to Stock | `{saveInward}` |
| [apps/web/src/pages/OperationsDesk.tsx:788](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Style Code | `{(e) => setCosting({ ...costing, styleCode: e.target.value })}` |
| [apps/web/src/pages/OperationsDesk.tsx:795](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Garment Description | `{(e) => setCosting({ ...costing, description: e.target.value })}` |
| [apps/web/src/pages/OperationsDesk.tsx:810](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Category | `{(e) => setCosting({ ...costing, components: costing.components.map((x, i) => i === index ? { ...x, type: e.target.value } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:831](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Component Description | `{(e) => setCosting({ ...costing, components: costing.components.map((x, i) => i === index ? { ...x, description: e.target.value } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:846](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Consumption | `{(e) => setCosting({ ...costing, components: costing.components.map((x, i) => i === index ? { ...x, quantity: e.target.value } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:861](../../apps/web/src/pages/OperationsDesk.tsx) | TextField | Rate (₹) | `{(e) => setCosting({ ...costing, components: costing.components.map((x, i) => i === index ? { ...x, rate: e.target.value } : x ), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:877](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Remove | `{() => setCosting({ ...costing, components: costing.components.filter((_, i) => i !== index), }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:893](../../apps/web/src/pages/OperationsDesk.tsx) | Button | + Add Component | `{() => setCosting({ ...costing, components: [ ...costing.components, { type: 'MATERIAL', description: '', quantity: '', rate: '' }, ], }) }` |
| [apps/web/src/pages/OperationsDesk.tsx:916](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Cancel | `{() => setCostOpen(false)}` |
| [apps/web/src/pages/OperationsDesk.tsx:917](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Save Costing Sheet | `{saveCost}` |
| [apps/web/src/pages/OperationsDesk.tsx:997](../../apps/web/src/pages/OperationsDesk.tsx) | Button | Close | `{() => setHistory(null)}` |
| [apps/web/src/pages/OutwardEntry.tsx:313](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Date Filter | `{handleFilterChange}` |
| [apps/web/src/pages/OutwardEntry.tsx:349](../../apps/web/src/pages/OutwardEntry.tsx) | Button | Add Outward | `{() => { setDispatchTime(localTimeValue()); setOpenDialog(true); }}` |
| [apps/web/src/pages/OutwardEntry.tsx:398](../../apps/web/src/pages/OutwardEntry.tsx) | IconButton | Generate QR and Barcode Label | `{() => setLabelOutward(row)}` |
| [apps/web/src/pages/OutwardEntry.tsx:409](../../apps/web/src/pages/OutwardEntry.tsx) | IconButton | <DeleteIcon fontSize="small" /> | `{() => handleDeleteOutward(row.id)}` |
| [apps/web/src/pages/OutwardEntry.tsx:441](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Date | `{(e) => setDate(e.target.value)}` |
| [apps/web/src/pages/OutwardEntry.tsx:452](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Dispatch time | `{e => setDispatchTime(e.target.value)}` |
| [apps/web/src/pages/OutwardEntry.tsx:454](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Customer Name | `{(e) => setCustomerName(e.target.value)}` |
| [apps/web/src/pages/OutwardEntry.tsx:465](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Vehicle No | `{(e) => setVehicleNo(e.target.value.toUpperCase())}` |
| [apps/web/src/pages/OutwardEntry.tsx:477](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Driver Name | `{(e) => setDriverName(e.target.value)}` |
| [apps/web/src/pages/OutwardEntry.tsx:509](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Count | `{(e) => handleItemChange(item.id, 'count', e.target.value)}` |
| [apps/web/src/pages/OutwardEntry.tsx:529](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Bags to dispatch | `{(e) => handleItemChange(item.id, 'bags', e.target.value)}` |
| [apps/web/src/pages/OutwardEntry.tsx:547](../../apps/web/src/pages/OutwardEntry.tsx) | TextField | Dispatch weight | `` |
| [apps/web/src/pages/OutwardEntry.tsx:559](../../apps/web/src/pages/OutwardEntry.tsx) | IconButton | Remove dispatch row | `{() => removeItemRow(item.id)}` |
| [apps/web/src/pages/OutwardEntry.tsx:570](../../apps/web/src/pages/OutwardEntry.tsx) | Button | Add Row | `{addItemRow}` |
| [apps/web/src/pages/OutwardEntry.tsx:588](../../apps/web/src/pages/OutwardEntry.tsx) | Button | Cancel | `{() => { setOpenDialog(false); setShowErrors(false); }}` |
| [apps/web/src/pages/OutwardEntry.tsx:589](../../apps/web/src/pages/OutwardEntry.tsx) | Button | {isSubmitting ? 'Saving...' : 'Save Entry'} | `{handleSave}` |
| [apps/web/src/pages/ProductionEntry.tsx:489](../../apps/web/src/pages/ProductionEntry.tsx) | Select | Date Filter | `{(e) => setDateFilter(e.target.value as DateFilterType)}` |
| [apps/web/src/pages/ProductionEntry.tsx:525](../../apps/web/src/pages/ProductionEntry.tsx) | Button | Add Production | `{handleOpenWizard}` |
| [apps/web/src/pages/ProductionEntry.tsx:603](../../apps/web/src/pages/ProductionEntry.tsx) | IconButton | Generate QR and Barcode Label | `{() => setLabelProduction(row)}` |
| [apps/web/src/pages/ProductionEntry.tsx:614](../../apps/web/src/pages/ProductionEntry.tsx) | IconButton | <DeleteIcon fontSize="small" /> | `{() => handleDeleteProduction(row.id)}` |
| [apps/web/src/pages/ProductionEntry.tsx:651](../../apps/web/src/pages/ProductionEntry.tsx) | StepLabel | {label} | `` |
| [apps/web/src/pages/ProductionEntry.tsx:660](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Production Date | `{e => { setDate(e.target.value); setTimingError(null); }}` |
| [apps/web/src/pages/ProductionEntry.tsx:662](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Production start time | `{e => { setStartTime(e.target.value); setTimingError(null); }}` |
| [apps/web/src/pages/ProductionEntry.tsx:697](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Select Batch | `{(e) => handleConsumedChange(item.id, 'batchNo', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:746](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Bales consumed | `{(e) => handleConsumedChange(item.id, 'bale', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:759](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Cotton weight | `{(e) => handleConsumedChange(item.id, 'weight', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:772](../../apps/web/src/pages/ProductionEntry.tsx) | IconButton | Remove cotton row | `{() => removeConsumed(item.id)}` |
| [apps/web/src/pages/ProductionEntry.tsx:788](../../apps/web/src/pages/ProductionEntry.tsx) | Button | Add Row | `{addConsumed}` |
| [apps/web/src/pages/ProductionEntry.tsx:808](../../apps/web/src/pages/ProductionEntry.tsx) | Tabs | Production output categories | `{(_, v) => setOutputTab(v)}` |
| [apps/web/src/pages/ProductionEntry.tsx:809](../../apps/web/src/pages/ProductionEntry.tsx) | Tab | Yarn Production | `` |
| [apps/web/src/pages/ProductionEntry.tsx:810](../../apps/web/src/pages/ProductionEntry.tsx) | Tab | Waste Breakdown | `` |
| [apps/web/src/pages/ProductionEntry.tsx:811](../../apps/web/src/pages/ProductionEntry.tsx) | Tab | Intermediate | `` |
| [apps/web/src/pages/ProductionEntry.tsx:834](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Yarn count | `{(e) => handleProducedChange(item.id, 'count', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:854](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Yarn weight | `{(e) => handleProducedChange(item.id, 'weight', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:867](../../apps/web/src/pages/ProductionEntry.tsx) | IconButton | Remove yarn row | `{() => removeProduced(item.id)}` |
| [apps/web/src/pages/ProductionEntry.tsx:882](../../apps/web/src/pages/ProductionEntry.tsx) | Button | Add Count | `{addProduced}` |
| [apps/web/src/pages/ProductionEntry.tsx:902](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Blow Room Waste (kg) | `{(e) => handleWasteChange('blowRoom', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:910](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Carding Waste (kg) | `{(e) => handleWasteChange('carding', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:918](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | OE Waste (kg) | `{(e) => handleWasteChange('oe', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:926](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Others (kg) | `{(e) => handleWasteChange('others', e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:949](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Intermediate Weight (kg) | `{(e) => { const val = e.target.value; if (val === '' \|\| parseFloat(val) >= 0) { setIntermediate(val); } }}` |
| [apps/web/src/pages/ProductionEntry.tsx:963](../../apps/web/src/pages/ProductionEntry.tsx) | TextField | Allocated processing cost (₹) | `{e => setProcessingCost(e.target.value)}` |
| [apps/web/src/pages/ProductionEntry.tsx:1007](../../apps/web/src/pages/ProductionEntry.tsx) | Button | Back | `{handleBack}` |
| [apps/web/src/pages/ProductionEntry.tsx:1016](../../apps/web/src/pages/ProductionEntry.tsx) | Button | {isSaving ? 'Saving…' : 'Save Production'} | `{handleSave}` |
| [apps/web/src/pages/ProductionEntry.tsx:1025](../../apps/web/src/pages/ProductionEntry.tsx) | Button | Next | `{handleNext}` |
| [apps/web/src/pages/SecuritySettings.tsx:270](../../apps/web/src/pages/SecuritySettings.tsx) | TextField | Current Password | `{(e) => setCurrentPassword(e.target.value)}` |
| [apps/web/src/pages/SecuritySettings.tsx:279](../../apps/web/src/pages/SecuritySettings.tsx) | IconButton | {showCurrentPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} | `{() => setShowCurrentPass(!showCurrentPass)}` |
| [apps/web/src/pages/SecuritySettings.tsx:293](../../apps/web/src/pages/SecuritySettings.tsx) | TextField | New Password | `{(e) => setNewPassword(e.target.value)}` |
| [apps/web/src/pages/SecuritySettings.tsx:303](../../apps/web/src/pages/SecuritySettings.tsx) | IconButton | {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} | `{() => setShowNewPass(!showNewPass)}` |
| [apps/web/src/pages/SecuritySettings.tsx:317](../../apps/web/src/pages/SecuritySettings.tsx) | TextField | Confirm New Password | `{(e) => setConfirmPassword(e.target.value)}` |
| [apps/web/src/pages/SecuritySettings.tsx:333](../../apps/web/src/pages/SecuritySettings.tsx) | Button | {passwordBusy ? 'Updating Password...' : 'Update Password'} | `` |
| [apps/web/src/pages/SecuritySettings.tsx:370](../../apps/web/src/pages/SecuritySettings.tsx) | TextField | Current 6-digit code | `{(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }` |
| [apps/web/src/pages/SecuritySettings.tsx:379](../../apps/web/src/pages/SecuritySettings.tsx) | Button | Disable 2FA | `{handleDisableTotp}` |
| [apps/web/src/pages/SecuritySettings.tsx:390](../../apps/web/src/pages/SecuritySettings.tsx) | Button | Set Up Authenticator App | `{handleGenerateTotp}` |
| [apps/web/src/pages/SecuritySettings.tsx:411](../../apps/web/src/pages/SecuritySettings.tsx) | TextField | 6-digit code | `{(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }` |
| [apps/web/src/pages/SecuritySettings.tsx:420](../../apps/web/src/pages/SecuritySettings.tsx) | Button | Verify & Enable | `{handleVerifyTotp}` |
| [apps/web/src/pages/SecuritySettings.tsx:450](../../apps/web/src/pages/SecuritySettings.tsx) | Button | Register New Passkey on this Device | `{handleRegisterPasskey}` |
| [apps/web/src/pages/SessionManagement.tsx:92](../../apps/web/src/pages/SessionManagement.tsx) | TextField | <TextField fullWidth size="small" placeholder="Search by user, IP, location, or device..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> | `{(e) => setSearchTerm(e.target.value)}` |
| [apps/web/src/pages/SessionManagement.tsx:154](../../apps/web/src/pages/SessionManagement.tsx) | Button | Revoke | `{() => { if (window.confirm('Are you sure you want to revoke this session?')) { revokeSessionMutation.mutate(session.id); } }}` |
| [apps/web/src/pages/Settings.tsx:257](../../apps/web/src/pages/Settings.tsx) | Tabs | <Tab label="Company Info" /> <Tab label="System Settings" /> <Tab label="Rates & Defaults" /> <Tab label="Appearance" /> <Tab label="Audit Logs" /> | `{(_, newValue) => setTabValue(newValue)}` |
| [apps/web/src/pages/Settings.tsx:258](../../apps/web/src/pages/Settings.tsx) | Tab | Company Info | `` |
| [apps/web/src/pages/Settings.tsx:259](../../apps/web/src/pages/Settings.tsx) | Tab | System Settings | `` |
| [apps/web/src/pages/Settings.tsx:260](../../apps/web/src/pages/Settings.tsx) | Tab | Rates & Defaults | `` |
| [apps/web/src/pages/Settings.tsx:261](../../apps/web/src/pages/Settings.tsx) | Tab | Appearance | `` |
| [apps/web/src/pages/Settings.tsx:262](../../apps/web/src/pages/Settings.tsx) | Tab | Audit Logs | `` |
| [apps/web/src/pages/Settings.tsx:294](../../apps/web/src/pages/Settings.tsx) | Button | Upload Logo <input type="file" hidden accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { if (file.size > 500 * 1024) { // 500KB limit toast.error(ERROR_MESSAGES.FILE_TOO_LARGE('500KB')); return; } const reader = new FileReader(); reader.onloadend = () => { setCompanySettings({ ...companySettings, logo: reader.result as string }); }; reader.readAsDataURL(file); } }} / | `` |
| [apps/web/src/pages/Settings.tsx:323](../../apps/web/src/pages/Settings.tsx) | Button | Remove | `{() => setCompanySettings({ ...companySettings, logo: '' })}` |
| [apps/web/src/pages/Settings.tsx:340](../../apps/web/src/pages/Settings.tsx) | TextField | Company Name | `{(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:346](../../apps/web/src/pages/Settings.tsx) | TextField | Business activities | `{event => setCompanySettings({ ...companySettings, businessMode: event.target.value as BusinessMode })}` |
| [apps/web/src/pages/Settings.tsx:351](../../apps/web/src/pages/Settings.tsx) | TextField | Workspace complexity | `{event => setCompanySettings({ ...companySettings, workspaceMode: event.target.value as WorkspaceMode })}` |
| [apps/web/src/pages/Settings.tsx:357](../../apps/web/src/pages/Settings.tsx) | TextField | Address | `{(e) => setCompanySettings({ ...companySettings, address: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:365](../../apps/web/src/pages/Settings.tsx) | TextField | GSTIN | `{(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:371](../../apps/web/src/pages/Settings.tsx) | TextField | Phone | `{(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:377](../../apps/web/src/pages/Settings.tsx) | TextField | Email | `{(e) => setCompanySettings({ ...companySettings, email: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:384](../../apps/web/src/pages/Settings.tsx) | Button | Save Company Info | `{handleSaveCompanySettings}` |
| [apps/web/src/pages/Settings.tsx:442](../../apps/web/src/pages/Settings.tsx) | TextField | Low Stock Threshold (kg) | `{(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:471](../../apps/web/src/pages/Settings.tsx) | TextField | Default Invoice Theme | `{(e) => setSystemSettings({ ...systemSettings, defaultInvoiceTheme: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:486](../../apps/web/src/pages/Settings.tsx) | Button | Save System Settings | `{handleSaveSystemSettings}` |
| [apps/web/src/pages/Settings.tsx:505](../../apps/web/src/pages/Settings.tsx) | TextField | EB Rate per Unit (₹ / kWh) | `{(e) => setRateSettings({ ...rateSettings, ebRate: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:517](../../apps/web/src/pages/Settings.tsx) | TextField | Packaging Rate (₹ / kg yarn) | `{(e) => setRateSettings({ ...rateSettings, packageRate: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:529](../../apps/web/src/pages/Settings.tsx) | TextField | Maintenance Rate (₹ / kg yarn) | `{(e) => setRateSettings({ ...rateSettings, maintenanceRate: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:541](../../apps/web/src/pages/Settings.tsx) | TextField | Supported Yarn Counts | `{(e) => setRateSettings({ ...rateSettings, supportedCounts: e.target.value })}` |
| [apps/web/src/pages/Settings.tsx:551](../../apps/web/src/pages/Settings.tsx) | Button | Save Operational Rates | `{handleSaveRates}` |
| [apps/web/src/pages/SharedPayments.tsx:14](../../apps/web/src/pages/SharedPayments.tsx) | Button | Download drafts | `{download}` |
| [apps/web/src/pages/ShopPortal.tsx:70](../../apps/web/src/pages/ShopPortal.tsx) | Button | {language === 'en' ? 'தமிழ்' : 'English'} | `{switchLanguage}` |
| [apps/web/src/pages/ShopPortal.tsx:70](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.staff} | `` |
| [apps/web/src/pages/ShopPortal.tsx:73](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.search} | `{event => setSearch(event.target.value)}` |
| [apps/web/src/pages/ShopPortal.tsx:73](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.all} | `{event => setCategory(event.target.value)}` |
| [apps/web/src/pages/ShopPortal.tsx:73](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.allBrands} | `{event => setBrand(event.target.value)}` |
| [apps/web/src/pages/ShopPortal.tsx:73](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.sort} | `{event => setSort(event.target.value)}` |
| [apps/web/src/pages/ShopPortal.tsx:75](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.retry} | `{() => void refetch()}` |
| [apps/web/src/pages/ShopPortal.tsx:78](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.view} | `{() => setSelected(product)}` |
| [apps/web/src/pages/ShopPortal.tsx:78](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.add} | `{() => setQuantity(product, quantityFor(product.id) + 1)}` |
| [apps/web/src/pages/ShopPortal.tsx:81](../../apps/web/src/pages/ShopPortal.tsx) | IconButton | {`Remove ${row.product!.name}`} | `{() => setQuantity(row.product!, row.quantity - 1)}` |
| [apps/web/src/pages/ShopPortal.tsx:81](../../apps/web/src/pages/ShopPortal.tsx) | TextField | <Typography sx={{ flex: 1 }} fontWeight={600}>{row.product!.name}</Typography> <IconButton aria-label={`Remove ${row.product!.name}`} onClick={() => setQuantity(row.product!, row.quantity - 1)}><Remove /></IconButton> <TextField type="number" size="small" value={row.quantity} onChange={event => setQuantity(row.product!, Number(event.target.value))} inputProps={{ min: 0, max: row.product!.available | `{event => setQuantity(row.product!, Number(event.target.value))}` |
| [apps/web/src/pages/ShopPortal.tsx:81](../../apps/web/src/pages/ShopPortal.tsx) | IconButton | {`Add ${row.product!.name}`} | `{() => setQuantity(row.product!, row.quantity + 1)}` |
| [apps/web/src/pages/ShopPortal.tsx:81](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.checkout} | `{() => { setError(''); setCheckoutOpen(true); }}` |
| [apps/web/src/pages/ShopPortal.tsx:83](../../apps/web/src/pages/ShopPortal.tsx) | IconButton | <Close /> | `{() => setSelected(null)}` |
| [apps/web/src/pages/ShopPortal.tsx:83](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.add} | `{() => { if (selected) setQuantity(selected, quantityFor(selected.id) + 1); setSelected(null); }}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | IconButton | <Close /> | `{() => setCheckoutOpen(false)}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.name} | `{event => setBuyer({ ...buyer, name: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.phone} | `{event => setBuyer({ ...buyer, phone: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.email} | `{event => setBuyer({ ...buyer, email: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.address} | `{event => setBuyer({ ...buyer, address: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.state} | `{event => setBuyer({ ...buyer, state: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.gstin} | `{event => setBuyer({ ...buyer, gstin: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | TextField | {t.notes} | `{event => setBuyer({ ...buyer, notes: event.target.value })}` |
| [apps/web/src/pages/ShopPortal.tsx:84](../../apps/web/src/pages/ShopPortal.tsx) | Button | {submitting ? t.placing : t.place} | `{() => void placeOrder()}` |
| [apps/web/src/pages/ShopPortal.tsx:85](../../apps/web/src/pages/ShopPortal.tsx) | Button | {t.back} | `{() => setResult(null)}` |
| [apps/web/src/pages/Store.tsx:49](../../apps/web/src/pages/Store.tsx) | Button | Open public shop | `` |
| [apps/web/src/pages/Store.tsx:49](../../apps/web/src/pages/Store.tsx) | Button | Manage catalogue | `{() => onNavigate?.('catalogue')}` |
| [apps/web/src/pages/Store.tsx:49](../../apps/web/src/pages/Store.tsx) | Button | Sales orders | `{() => onNavigate?.('orders')}` |
| [apps/web/src/pages/Store.tsx:53](../../apps/web/src/pages/Store.tsx) | TextField | Search products or SKU | `{event => setSearch(event.target.value)}` |
| [apps/web/src/pages/Store.tsx:60](../../apps/web/src/pages/Store.tsx) | Button | Add to order | `{() => changeQuantity(item, 1)}` |
| [apps/web/src/pages/Store.tsx:67](../../apps/web/src/pages/Store.tsx) | TextField | Customer | `{event => setCustomerId(Number(event.target.value))}` |
| [apps/web/src/pages/Store.tsx:68](../../apps/web/src/pages/Store.tsx) | Button | Add customer | `{() => onNavigate?.('customers')}` |
| [apps/web/src/pages/Store.tsx:69](../../apps/web/src/pages/Store.tsx) | IconButton | {`Remove ${row.item!.name}`} | `{() => changeQuantity(row.item!, -1)}` |
| [apps/web/src/pages/Store.tsx:69](../../apps/web/src/pages/Store.tsx) | IconButton | {`Add ${row.item!.name}`} | `{() => changeQuantity(row.item!, 1)}` |
| [apps/web/src/pages/Store.tsx:71](../../apps/web/src/pages/Store.tsx) | TextField | Order notes | `{event => setNotes(event.target.value)}` |
| [apps/web/src/pages/Store.tsx:73](../../apps/web/src/pages/Store.tsx) | Button | {saving ? 'Reserving…' : 'Create sales order'} | `{reserveOrder}` |
| [apps/web/src/pages/TodayDashboard.tsx:153](../../apps/web/src/pages/TodayDashboard.tsx) | IconButton | <RefreshIcon /> | `{handleRefresh}` |
| [apps/web/src/pages/TodayDashboard.tsx:254](../../apps/web/src/pages/TodayDashboard.tsx) | Button | Record Production | `{() => navigate('production')}` |
| [apps/web/src/pages/TodayDashboard.tsx:263](../../apps/web/src/pages/TodayDashboard.tsx) | Button | Add Costs | `{() => navigate('costing')}` |
| [apps/web/src/pages/Tutorial.tsx:239](../../apps/web/src/pages/Tutorial.tsx) | StepLabel | <Typography variant="body2" fontWeight={700}>{step.label}</Typography> | `` |
| [apps/web/src/pages/Tutorial.tsx:245](../../apps/web/src/pages/Tutorial.tsx) | Button | {i === chapter.steps.length - 1 ? 'Finish chapter' : 'Got it →'} | `{handleStepComplete}` |
| [apps/web/src/pages/Tutorial.tsx:246](../../apps/web/src/pages/Tutorial.tsx) | Button | Back | `{() => setActiveStep(i - 1)}` |
| [apps/web/src/pages/Tutorial.tsx:259](../../apps/web/src/pages/Tutorial.tsx) | Button | Next chapter → | `{() => { const nextIndex = TUTORIAL_CHAPTERS.findIndex((c) => c.id === selectedChapter) + 1; if (nextIndex < TUTORIAL_CHAPTERS.length) { handleChapterChange(TUTORIAL_CHAPTERS[nextIndex].id); } }}` |
| [apps/web/src/pages/Tutorial.tsx:260](../../apps/web/src/pages/Tutorial.tsx) | Button | Restart tour | `{() => { setCompletedSteps({}); setSelectedChapter('getting-started'); setActiveStep(0); }}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:195](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Open Mill Dashboard | `{() => onNavigate('dashboard')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:204](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Yarn ERP Hub (9 Modules) | `{() => onNavigate('yarnerp')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:216](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Business Desk & Invoices | `{() => onNavigate('business')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:233](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Refresh now | `{() => { void report.refetch(); void machines.refetch(); void health.refetch(); }}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:306](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Review | `{() => onNavigate('reports')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:315](../../apps/web/src/pages/UnifiedWorkspace.tsx) | TextField | Find a workspace | `{event => setSearch(event.target.value)}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:379](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | {module.action} | `{() => onNavigate(module.page)}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:420](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Live Monitor | `{() => onNavigate('yarnlive')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:428](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Quality Lab | `{() => onNavigate('yarnquality')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:436](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Financials | `{() => onNavigate('reports')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:447](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | Workflow documentation | `{() => onNavigate('tutorial')}` |
| [apps/web/src/pages/UnifiedWorkspace.tsx:448](../../apps/web/src/pages/UnifiedWorkspace.tsx) | Button | API explorer (development) | `` |
| [apps/web/src/pages/UserManagement.tsx:242](../../apps/web/src/pages/UserManagement.tsx) | Button | Add User | `{() => handleOpenDialog()}` |
| [apps/web/src/pages/UserManagement.tsx:262](../../apps/web/src/pages/UserManagement.tsx) | Button | Retry | `{() => void refetch()}` |
| [apps/web/src/pages/UserManagement.tsx:270](../../apps/web/src/pages/UserManagement.tsx) | TextField | Search users | `{(e) => setSearchTerm(e.target.value)}` |
| [apps/web/src/pages/UserManagement.tsx:306](../../apps/web/src/pages/UserManagement.tsx) | Button | Clear search | `{() => setSearchTerm('')}` |
| [apps/web/src/pages/UserManagement.tsx:336](../../apps/web/src/pages/UserManagement.tsx) | IconButton | {`Edit ${user.username}`} | `{() => handleOpenDialog(user)}` |
| [apps/web/src/pages/UserManagement.tsx:348](../../apps/web/src/pages/UserManagement.tsx) | IconButton | {`Delete ${user.username}`} | `{() => handleDelete(user.id)}` |
| [apps/web/src/pages/UserManagement.tsx:376](../../apps/web/src/pages/UserManagement.tsx) | TextField | Username | `{(e) => setFormData({ ...formData, username: e.target.value })}` |
| [apps/web/src/pages/UserManagement.tsx:386](../../apps/web/src/pages/UserManagement.tsx) | TextField | Full Name | `{(e) => setFormData({ ...formData, name: e.target.value })}` |
| [apps/web/src/pages/UserManagement.tsx:393](../../apps/web/src/pages/UserManagement.tsx) | TextField | Email | `{(e) => setFormData({ ...formData, email: e.target.value })}` |
| [apps/web/src/pages/UserManagement.tsx:402](../../apps/web/src/pages/UserManagement.tsx) | TextField | {editingUser ? 'New Password' : 'Password'} | `{(e) => setFormData({ ...formData, password: e.target.value })}` |
| [apps/web/src/pages/UserManagement.tsx:415](../../apps/web/src/pages/UserManagement.tsx) | Select | Role | `{(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}` |
| [apps/web/src/pages/UserManagement.tsx:447](../../apps/web/src/pages/UserManagement.tsx) | Button | Cancel | `{handleCloseDialog}` |
| [apps/web/src/pages/UserManagement.tsx:448](../../apps/web/src/pages/UserManagement.tsx) | Button | {isSaving ? 'Saving…' : editingUser ? 'Update User' : 'Create User'} | `` |
| [apps/web/src/pages/WorkflowDesk.tsx:96](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Supplier / job worker | `{() => setSupplierOpen(true)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:99](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | {op.title} | `{() => open(op)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:100](../../apps/web/src/pages/WorkflowDesk.tsx) | Tabs | <Tab label="Document trail" /> <Tab label="Lots, holds & WIP" /> <Tab label="Accounts & closure" /> | `{(_, v) => setTab(v)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:100](../../apps/web/src/pages/WorkflowDesk.tsx) | Tab | Document trail | `` |
| [apps/web/src/pages/WorkflowDesk.tsx:100](../../apps/web/src/pages/WorkflowDesk.tsx) | Tab | Lots, holds & WIP | `` |
| [apps/web/src/pages/WorkflowDesk.tsx:100](../../apps/web/src/pages/WorkflowDesk.tsx) | Tab | Accounts & closure | `` |
| [apps/web/src/pages/WorkflowDesk.tsx:101](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | {d.documentNo} | `{() => setSelectedDoc(d)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:102](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Inspect & release | `{() => { setRelease(h); setReleaseNotes(''); }}` |
| [apps/web/src/pages/WorkflowDesk.tsx:103](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Close through a date | `{() => setCloseOpen(true)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:104](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | {f.label} | `{e => change(f.key, f.source ? Number(e.target.value) : e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Item | `{e => changeLine(i, 'itemId', Number(e.target.value))}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Quantity | `{e => changeLine(i, 'quantity', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Unit cost ₹ | `{e => changeLine(i, 'rate', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | GST % | `{e => changeLine(i, 'gstRate', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Quarantine quantity | `{e => changeLine(i, 'rejectedQty', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Lot (blank = available lots) | `{e => changeLine(i, 'lotId', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Location | `{e => changeLine(i, 'locationId', Number(e.target.value))}` |
| [apps/web/src/pages/WorkflowDesk.tsx:105](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Add line | `{() => setLines(old => [...old, { itemId: '', quantity: '', rate: '', gstRate: '' }])}` |
| [apps/web/src/pages/WorkflowDesk.tsx:106](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Posting time (optional) | `{e => change('date', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:106](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Reason / evidence / notes | `{e => change('notes', e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:106](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Cancel | `{() => setOperation(null)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:106](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | {saving ? 'Posting…' : 'Post & synchronize'} | `{submit}` |
| [apps/web/src/pages/WorkflowDesk.tsx:107](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | {titleCase(key)} | `{e => setSupplier(s => ({ ...s, [key]: e.target.value }))}` |
| [apps/web/src/pages/WorkflowDesk.tsx:107](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Cancel | `{() => setSupplierOpen(false)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:107](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Save | `{async () => { setSaving(true); try { await api.post('/workflows/suppliers', supplier); setSupplierOpen(false); setSupplier({ name: '', code: '', gstin: '', address: '' }); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Could not save supplier'); } finally { setSaving(false); } }}` |
| [apps/web/src/pages/WorkflowDesk.tsx:108](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Inspection result / release reason | `{e => setReleaseNotes(e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:108](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Cancel | `{() => setRelease(null)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:108](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Record pass & release | `{handleRelease}` |
| [apps/web/src/pages/WorkflowDesk.tsx:109](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Close through | `{e => setCloseDate(e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:109](../../apps/web/src/pages/WorkflowDesk.tsx) | TextField | Closure reason | `{e => setCloseNotes(e.target.value)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:109](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Cancel | `{() => setCloseOpen(false)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:109](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Close period | `{async () => { setSaving(true); try { await api.post('/workflows/periods/close', { through: closeDate, notes: closeNotes }); setCloseOpen(false); } catch (e: any) { toast.error(e.response?.data?.message \|\| 'Closure failed'); } finally { setSaving(false); } }}` |
| [apps/web/src/pages/WorkflowDesk.tsx:110](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Download document PDF | `{() => downloadWorkflowDocument(selectedDoc)}` |
| [apps/web/src/pages/WorkflowDesk.tsx:110](../../apps/web/src/pages/WorkflowDesk.tsx) | Button | Close | `{() => setSelectedDoc(null)}` |
| [apps/web/src/pages/yarn/ComplianceReports.tsx:75](../../apps/web/src/pages/yarn/ComplianceReports.tsx) | Button | Refresh | `{refresh}` |
| [apps/web/src/pages/yarn/DemandForecasting.tsx:142](../../apps/web/src/pages/yarn/DemandForecasting.tsx) | Button | {isRefetching ? 'Refreshing...' : 'Refresh'} | `{() => queryClient.invalidateQueries({ queryKey: ['commerce-orders'] })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:223](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | Refresh | `{() => { queryClient.invalidateQueries({ queryKey: ['hr-staff'] }); queryClient.invalidateQueries({ queryKey: ['hr-payroll'] }); }}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:236](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | Add Staff | `{() => setOpenStaffDialog(true)}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:244](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | Process Payroll | `{() => setOpenPayrollDialog(true)}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:320](../../apps/web/src/pages/yarn/HRManagement.tsx) | Tabs | <Tab label={`Staff Directory (${employees.length})`} /> <Tab label={`Payroll Processing (${payroll.length})`} /> | `{(_, v) => setTab(v)}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:331](../../apps/web/src/pages/yarn/HRManagement.tsx) | Tab | {`Staff Directory (${employees.length})`} | `` |
| [apps/web/src/pages/yarn/HRManagement.tsx:332](../../apps/web/src/pages/yarn/HRManagement.tsx) | Tab | {`Payroll Processing (${payroll.length})`} | `` |
| [apps/web/src/pages/yarn/HRManagement.tsx:530](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Employee ID | `{(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:541](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Full Name | `{(e) => setStaffForm({ ...staffForm, name: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:553](../../apps/web/src/pages/yarn/HRManagement.tsx) | Select | Department | `{(e) => setStaffForm({ ...staffForm, department: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:568](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Designation / Role | `{(e) => setStaffForm({ ...staffForm, role: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:581](../../apps/web/src/pages/yarn/HRManagement.tsx) | Select | Salary Structure | `{(e) => setStaffForm({ ...staffForm, salaryType: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:592](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | {staffForm.salaryType === 'DAILY' ? 'Daily Wage Rate (₹)' : 'Monthly Base Salary (₹)'} | `{(e) => { const val = Number(e.target.value) \|\| 0; if (staffForm.salaryType === 'DAILY') { setStaffForm({ ...staffForm, dailyRate: val }); } else { setStaffForm({ ...staffForm, monthlySalary: val }); } }}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:609](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Contact Phone | `{(e) => setStaffForm({ ...staffForm, phone: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:618](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Date of Joining | `{(e) => setStaffForm({ ...staffForm, joinDate: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:631](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | Cancel | `{() => setOpenStaffDialog(false)}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:634](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | {createStaffMutation.isPending ? 'Saving...' : 'Register Staff'} | `{() => createStaffMutation.mutate(staffForm)}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:660](../../apps/web/src/pages/yarn/HRManagement.tsx) | Select | Select Employee | `{(e) => handleStaffSelectForPayroll(Number(e.target.value))}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:674](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Month (YYYY-MM) | `{(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:684](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Days Worked | `{(e) => setPayrollForm({ ...payrollForm, daysWorked: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:694](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Overtime Hours | `{(e) => setPayrollForm({ ...payrollForm, overtimeHrs: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:704](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Basic Pay (₹) | `{(e) => setPayrollForm({ ...payrollForm, basicPay: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:714](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Overtime Pay (₹) | `{(e) => setPayrollForm({ ...payrollForm, overtime: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:724](../../apps/web/src/pages/yarn/HRManagement.tsx) | TextField | Deductions (₹) | `{(e) => setPayrollForm({ ...payrollForm, deductions: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:748](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | Cancel | `{() => setOpenPayrollDialog(false)}` |
| [apps/web/src/pages/yarn/HRManagement.tsx:751](../../apps/web/src/pages/yarn/HRManagement.tsx) | Button | {createPayrollMutation.isPending ? 'Processing...' : 'Submit Payroll'} | `{() => createPayrollMutation.mutate(payrollForm)}` |
| [apps/web/src/pages/yarn/LiveDashboard.tsx:83](../../apps/web/src/pages/yarn/LiveDashboard.tsx) | Button | Refresh | `{handleRefresh}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:186](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | Refresh | `{() => { queryClient.invalidateQueries({ queryKey: ['machines'] }); queryClient.invalidateQueries({ queryKey: ['machine-inspections'] }); }}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:199](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | Register Machine | `{() => setOpenMachineDialog(true)}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:207](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | Log Maintenance | `{() => setOpenInspectionDialog(true)}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:282](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Tabs | <Tab label={`Machine Registry (${machines.length})`} /> <Tab label={`Maintenance & Inspections (${inspections.length})`} /> | `{(_, v) => setTab(v)}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:293](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Tab | {`Machine Registry (${machines.length})`} | `` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:294](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Tab | {`Maintenance & Inspections (${inspections.length})`} | `` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:467](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Machine Name / Designation | `{(e) => setMachineForm({ ...machineForm, name: e.target.value })}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:480](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Select | Machine Type | `{(e) => setMachineForm({ ...machineForm, type: e.target.value })}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:497](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Serial Number | `{(e) => setMachineForm({ ...machineForm, serialNo: e.target.value })}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:507](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Manufacturer / OEM | `{(e) => setMachineForm({ ...machineForm, manufacturer: e.target.value })}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:517](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Purchased / Commission Date | `{(e) => setMachineForm({ ...machineForm, purchasedAt: e.target.value })}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:528](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Notes / Location Tag | `{(e) => setMachineForm({ ...machineForm, notes: e.target.value })}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:540](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | Cancel | `{() => setOpenMachineDialog(false)}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:543](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | {createMachineMutation.isPending ? 'Registering...' : 'Register Machine'} | `{() => createMachineMutation.mutate(machineForm)}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:569](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Select | Select Machine | `{(e) => setInspectionForm({ ...inspectionForm, machineId: Number(e.target.value) }) }` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:587](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Select | Inspection Type | `{(e) => setInspectionForm({ ...inspectionForm, type: e.target.value }) }` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:603](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Select | Status | `{(e) => setInspectionForm({ ...inspectionForm, status: e.target.value }) }` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:617](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Repair / Service Cost (₹) | `{(e) => setInspectionForm({ ...inspectionForm, cost: Number(e.target.value) \|\| 0 }) }` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:629](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Description / Fault Details | `{(e) => setInspectionForm({ ...inspectionForm, description: e.target.value }) }` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:643](../../apps/web/src/pages/yarn/MachineManagement.tsx) | TextField | Technician / Inspector Name | `{(e) => setInspectionForm({ ...inspectionForm, createdBy: e.target.value }) }` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:657](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | Cancel | `{() => setOpenInspectionDialog(false)}` |
| [apps/web/src/pages/yarn/MachineManagement.tsx:660](../../apps/web/src/pages/yarn/MachineManagement.tsx) | Button | {createInspectionMutation.isPending ? 'Logging...' : 'Save Inspection'} | `{() => createInspectionMutation.mutate(inspectionForm)}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:163](../../apps/web/src/pages/yarn/QualityControl.tsx) | Button | Refresh | `{() => queryClient.invalidateQueries({ queryKey: ['quality-inspections'] })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:172](../../apps/web/src/pages/yarn/QualityControl.tsx) | Button | Record Inspection | `{() => setOpenDialog(true)}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:377](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Stock lot to inspect | `{e => setForm({ ...form, lotId: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:378](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Quantity to quarantine | `{e => setForm({ ...form, holdQuantity: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:380](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Batch / Lot Number | `{(e) => setForm({ ...form, batchId: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:390](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Yarn Count & Specification | `{(e) => setForm({ ...form, yarnCount: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:400](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Tenacity (cN/tex) | `{(e) => setForm({ ...form, tenacity: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:410](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Elongation (%) | `{(e) => setForm({ ...form, elongation: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:420](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Unevenness (U%) | `{(e) => setForm({ ...form, unevenness: Number(e.target.value) \|\| 0 })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:432](../../apps/web/src/pages/yarn/QualityControl.tsx) | Select | QC Test Status | `{(e) => setForm({ ...form, status: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:446](../../apps/web/src/pages/yarn/QualityControl.tsx) | Select | Batch Disposition | `{(e) => setForm({ ...form, disposition: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:458](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | Remarks / Test Notes | `{(e) => setForm({ ...form, remarks: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:468](../../apps/web/src/pages/yarn/QualityControl.tsx) | TextField | QC Inspector Name | `{(e) => setForm({ ...form, inspectedBy: e.target.value })}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:480](../../apps/web/src/pages/yarn/QualityControl.tsx) | Button | Cancel | `{() => setOpenDialog(false)}` |
| [apps/web/src/pages/yarn/QualityControl.tsx:483](../../apps/web/src/pages/yarn/QualityControl.tsx) | Button | {createInspectionMutation.isPending ? 'Recording...' : 'Save Inspection'} | `{() => createInspectionMutation.mutate(form)}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:83](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | Button | Refresh | `{() => queryClient.invalidateQueries({ queryKey: ['hr-shifts'] })}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:89](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | Button | Add Shift | `{handleOpen}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:148](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | TextField | Shift name | `{(e) => setForm({ ...form, name: e.target.value })}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:155](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | TextField | Start time | `{(e) => setForm({ ...form, startTime: e.target.value })}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:164](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | TextField | End time | `{(e) => setForm({ ...form, endTime: e.target.value })}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:176](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | Button | Cancel | `{() => setOpen(false)}` |
| [apps/web/src/pages/yarn/ShiftManagement.tsx:177](../../apps/web/src/pages/yarn/ShiftManagement.tsx) | Button | Save shift | `{() => createShift.mutate()}` |
| [apps/web/src/pages/yarn/SupplierPortal.tsx:51](../../apps/web/src/pages/yarn/SupplierPortal.tsx) | Button | Refresh | `{() => queryClient.invalidateQueries({ queryKey: ['inward-receipts'] })}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:177](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | Refresh | `{() => { queryClient.invalidateQueries({ queryKey: ['warehouse-locations'] }); queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] }); }}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:189](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | Add Location | `{() => setOpenLocationDialog(true)}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:197](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | Log Movement | `{() => setOpenMovementDialog(true)}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:451](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Location / Godown Name | `{(e) => setLocationForm({ ...locationForm, name: e.target.value })}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:462](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Zone / Bay | `{(e) => setLocationForm({ ...locationForm, zone: e.target.value })}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:472](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Description | `{(e) => setLocationForm({ ...locationForm, description: e.target.value }) }` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:488](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | Cancel | `{() => setOpenLocationDialog(false)}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:491](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | {createLocationMutation.isPending ? 'Saving...' : 'Save Location'} | `{() => createLocationMutation.mutate(locationForm)}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:517](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Select | Storage Location | `{(e) => setMovementForm({ ...movementForm, locationId: Number(e.target.value) }) }` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:535](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Select | Movement Type | `{(e) => setMovementForm({ ...movementForm, movementType: e.target.value }) }` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:549](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Destination location | `{e => setMovementForm({ ...movementForm, toLocationId: Number(e.target.value) })}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:554](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Stock item | `{(e) => setMovementForm({ ...movementForm, itemId: Number(e.target.value) \|\| '' }) }` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:568](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Quantity (kg / bags / units) | `{(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) \|\| 0 }) }` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:581](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Reference Doc / Delivery Challan | `{(e) => setMovementForm({ ...movementForm, referenceId: e.target.value }) }` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:593](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | TextField | Notes | `{(e) => setMovementForm({ ...movementForm, notes: e.target.value })}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:605](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | Cancel | `{() => setOpenMovementDialog(false)}` |
| [apps/web/src/pages/yarn/WarehouseManagement.tsx:608](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) | Button | {createMovementMutation.isPending ? 'Logging...' : 'Save Movement'} | `{() => createMovementMutation.mutate(movementForm)}` |
