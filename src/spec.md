# Specification

## Summary
**Goal:** Deliver a playable Teen Patti Classic online experience with Internet Identity login, virtual-coin balances, and auto-matchmaking into 3-player tables, using a distinct casino-card visual theme.

**Planned changes:**
- Add Internet Identity sign-in/sign-out, auto-created player profile (principal, display name), and persistent virtual-coin balance (virtual coins only).
- Implement an 18+ and “virtual coins only, no real-money gambling” disclaimer acknowledgement required before first matchmaking; remember per user.
- Build public auto-matchmaking: Play → searching state → seat exactly 3 players at a table; allow cancel to leave queue; no private rooms.
- Implement Teen Patti Classic round flow: boot/ante, server-authoritative shuffle/deal (3 cards each), turn-based actions (Pack, See, Bet/Call/Raise, Show), winner determination via standard hand ranking, pot award, persistent balance updates.
- Add backend persistence/resilience for profiles, balances, matchmaking queue, tables, and in-progress hand state; handle inactivity via timeout with auto-pack and turn advancement; ensure hand resolves if someone disconnects.
- Create core responsive frontend screens (Login, Lobby with balance + Play, Matchmaking, Table UI) with polling updates via React Query; enable/disable actions based on backend-allowed moves.
- Apply a consistent casino-felt aesthetic that is not Teen Patti Gold branding and not blue/purple-dominant.

**User-visible outcome:** Users can log in with Internet Identity, acknowledge an 18+ virtual-coins-only disclaimer, press Play to be auto-matched into a 3-player Teen Patti Classic table, play a complete minimal hand with turn-based actions, and see their virtual-coin balance persist across refreshes.
