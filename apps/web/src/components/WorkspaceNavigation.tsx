import { uiText, useUiLanguage, uiTemplate, uiScopedTemplate } from "../i18n";
import { useEffect, useState, type ReactNode } from "react";
import { alpha } from "@mui/material/styles";
import {
  Avatar,
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  ExpandMoreRounded,
  LogoutRounded,
  SearchRounded,
} from "@mui/icons-material";

export interface NavItem {
  text: string;
  icon: ReactNode;
  page: string;
  requiredRole?: string;
  badge?: number;
  description?: string;
}
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface Props {
  groups: NavGroup[];
  currentPage: string;
  expanded: boolean;
  compact: boolean;
  companyName: string;
  logo?: string;
  username: string;
  role: string;
  labelFor: (text: string) => string;
  onNavigate: (page: string) => void;
  onToggle: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

function NavigationSection({
  group,
  currentPage,
  expanded,
  searching,
  labelFor,
  onNavigate,
}: Pick<Props, "currentPage" | "expanded" | "labelFor" | "onNavigate"> & {
  group: NavGroup;
  searching: boolean;
}) {
  useUiLanguage();
  const active = group.items.some((item) => item.page === currentPage);
  const [open, setOpen] = useState(active || group.label === "Overview");
  useEffect(() => {
    if (active) setOpen(true);
  }, [active, currentPage]);
  const sectionId = `navigation-${(group.label || "general").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Box sx={{ mb: 1 }}>
      {expanded ? (
        <ButtonBase
          onClick={() => setOpen((value) => !value)}
          disabled={searching}
          aria-expanded={searching || open}
          aria-controls={sectionId}
          sx={{
            px: 1.5,
            py: 1,
            width: "100%",
            justifyContent: "space-between",
            borderRadius: 1,
            color: active ? "text.primary" : "text.secondary",
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: -2,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".07em",
              textTransform: "uppercase",
              textAlign: "left",
            }}
          >
            {labelFor(group.label || '')}
          </Typography>
          <ExpandMoreRounded
            sx={{
              fontSize: 17,
              transform: searching || open ? "rotate(0)" : "rotate(-90deg)",
              transition: "transform 150ms",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          />
        </ButtonBase>
      ) : (
        <Box
          sx={{
            mx: 1.5,
            my: 1.25,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        />
      )}
      <Collapse in={!expanded || searching || open} timeout="auto">
        <List
          id={sectionId}
          aria-label={labelFor(group.label || '')}
          disablePadding
          sx={{ display: "grid", gap: 0.25 }}
        >
          {group.items.map((item) => {
            const selected = item.page === currentPage;
            return (
              <ListItem
                key={item.page}
                disablePadding
                sx={{ display: "block" }}
              >
                <Tooltip
                  title={
                    expanded ? labelFor(item.description || "") : labelFor(item.text)
                  }
                  placement="right"
                  enterDelay={500}
                >
                  <ListItemButton
                    component="a"
                    href={item.page === "dashboard" ? "/" : `/${item.page}`}
                    aria-label={labelFor(item.text)}
                    aria-current={selected ? "page" : undefined}
                    selected={selected}
                    onClick={(event) => {
                      if (
                        !event.ctrlKey &&
                        !event.metaKey &&
                        !event.shiftKey &&
                        !event.altKey &&
                        event.button === 0
                      ) {
                        event.preventDefault();
                        onNavigate(item.page);
                      }
                    }}
                    sx={{
                      minHeight: 44,
                      py: 0.75,
                      px: expanded ? 1.5 : 0,
                      justifyContent: expanded ? "flex-start" : "center",
                      borderRadius: 1.5,
                      position: "relative",
                      gap: 1.25,
                      color: selected ? "primary.main" : "text.secondary",
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                      "&.Mui-selected": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.11),
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.16),
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 11,
                          bottom: 11,
                          width: 3,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                        },
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                        color: "text.primary",
                      },
                      "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: -2,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 22,
                        justifyContent: "center",
                        color: "inherit",
                        position: "relative",
                      }}
                    >
                      {item.icon}
                      {!expanded && !!item.badge && (
                        <Box
                          component="span"
                          sx={{
                            position: "absolute",
                            width: 7,
                            height: 7,
                            bgcolor: "error.main",
                            borderRadius: "50%",
                            right: -3,
                            top: -2,
                          }}
                        />
                      )}
                    </ListItemIcon>
                    {expanded && (
                      <>
                        <ListItemText
                          primary={labelFor(item.text)}
                          sx={{ my: 0 }}
                          primaryTypographyProps={{
                            fontSize: 13,
                            lineHeight: 1.4,
                            fontWeight: selected ? 700 : 500,
                          }}
                        />
                        {!!item.badge && (
                          <Box
                            component="span"
                            aria-label={uiScopedTemplate('navigation')`${item.badge} low-stock counts`}
                            sx={{
                              px: 0.75,
                              borderRadius: 1,
                              bgcolor: (theme) =>
                                alpha(theme.palette.error.main, 0.1),
                              color: "error.main",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {item.badge}
                          </Box>
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
}

export default function WorkspaceNavigation(props: Props) {
  useUiLanguage();
  const [query, setQuery] = useState("");
  const term = props.expanded ? query.trim().toLocaleLowerCase() : "";
  const groups = props.groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !term ||
          [
            item.text,
            props.labelFor(item.text),
            item.description,
            group.label,
            props.labelFor(group.label || ''),
            props.labelFor(item.description || ''),
          ].some((value) => value?.toLocaleLowerCase().includes(term)),
      ),
    }))
    .filter((group) => group.items.length);
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: props.expanded ? 2 : 1.5,
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        {props.expanded && (
          <>
            <Avatar
              src={props.logo}
              variant="rounded"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "primary.dark",
                color: "#fff",
                fontWeight: 800,
              }}
            >
              E
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                fontWeight={750}
                fontSize={14}
                title={props.companyName}
              >
                {props.companyName}
              </Typography>
              <Typography
                fontSize={10}
                color="text.secondary"
                sx={{ letterSpacing: ".12em" }}
              >
                {uiText("EVERGREEN WORKSPACE ", 'navigation')}</Typography>
            </Box>
          </>
        )}
        <Tooltip
          title={
            props.compact
              ? uiText("Close navigation", 'navigation')
              : props.expanded
                ? uiText("Collapse navigation", 'navigation')
                : uiText("Expand navigation", 'navigation')
          }
        >
          <IconButton
            onClick={props.onToggle}
            aria-label={
              props.compact
                ? uiText("Close navigation", 'navigation')
                : props.expanded
                  ? uiText("Collapse navigation", 'navigation')
                  : uiText("Expand navigation", 'navigation')
            }
            sx={{ width: 44, height: 44, mx: props.expanded ? -0.75 : "auto" }}
          >
            {props.compact ? (
              <CloseRounded />
            ) : props.expanded ? (
              <ChevronLeftRounded />
            ) : (
              <ChevronRightRounded />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      {props.expanded && (
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
            fullWidth
            size="small"
            placeholder={uiText("Find a module…", 'navigation')}
            inputProps={{ "aria-label": uiText("Find a module", 'navigation') }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label={uiText("Clear module filter", 'navigation')}
                    onClick={() => setQuery("")}
                  >
                    <CloseRounded fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
              sx: {
                fontSize: 13,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                "& fieldset": { borderColor: "transparent" },
              },
            }}
          />
        </Box>
      )}
      <Box
        component="nav"
        id="workspace-navigation"
        aria-label={uiText("Main navigation", 'navigation')}
        sx={{
          overflowY: "auto",
          minHeight: 0,
          flex: 1,
          px: props.expanded ? 1 : 1.25,
          py: 1,
          overscrollBehaviorY: "contain",
        }}
      >
        {groups.map((group) => (
          <NavigationSection
            key={group.label}
            group={group}
            currentPage={props.currentPage}
            expanded={props.expanded}
            searching={!!term}
            labelFor={props.labelFor}
            onNavigate={(page) => {
              setQuery("");
              props.onNavigate(page);
            }}
          />
        ))}
        {!groups.length && (
          <Box role="status" sx={{ px: 1, py: 3 }}>
            <Typography fontSize={13}>{uiText("No matching modules", 'navigation')}</Typography>
            <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
              {uiText("Try a different name or clear your filter. ", 'navigation')}</Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Tooltip title={uiText("My profile", 'navigation')}>
          <ButtonBase
            aria-label={uiText("My profile", 'navigation')}
            onClick={props.onProfile}
            sx={{
              flex: 1,
              minWidth: 0,
              p: 0.5,
              minHeight: 44,
              gap: 1.25,
              borderRadius: 1.5,
              justifyContent: props.expanded ? "flex-start" : "center",
              "&:hover": { bgcolor: "action.hover" },
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.13),
                color: "primary.main",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {props.username.charAt(0).toUpperCase()}
            </Avatar>
            {props.expanded && (
              <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                <Typography fontSize={13} fontWeight={650} noWrap>
                  {props.username}
                </Typography>
                <Typography fontSize={11} color="text.secondary" noWrap>
                  {props.role.toLowerCase()}
                </Typography>
              </Box>
            )}
          </ButtonBase>
        </Tooltip>
        {props.expanded && (
          <Tooltip title={uiText("Sign out", 'navigation')}>
            <IconButton
              aria-label={uiText("Sign out", 'navigation')}
              onClick={props.onLogout}
              sx={{ width: 40, height: 40 }}
            >
              <LogoutRounded sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
