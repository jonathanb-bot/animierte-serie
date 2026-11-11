#!/usr/bin/env bash
# /watch (Plugin bradautomates/claude-video, Jonathans Wunsch 11.11.): Videos Bild für Bild ansehen,
# auch aus Cloud-Sitzungen vom Handy. Nur in Cloud-Sitzungen: yt-dlp nachinstallieren und die
# Einstellungen setzen, damit /watch ohne Einrichtungsfragen startet.
# Lokaler Modus (Bilder + Untertitel). Der Gemini-Modus des Plugins scheitert am Proxy (HTTP 502, getestet 11.11.).
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
command -v yt-dlp >/dev/null 2>&1 || pip install -q --disable-pip-version-check "yt-dlp[default]" >/dev/null 2>&1 || true
CFG="$HOME/.config/watch/.env"
if [ ! -f "$CFG" ]; then
  mkdir -p "$(dirname "$CFG")"
  umask 077
  printf 'SETUP_COMPLETE=true\nWATCH_ENGINE=local\nWATCH_DETAIL=balanced\nWATCH_WHISPER_BACKEND=none\n' > "$CFG"
fi
exit 0
