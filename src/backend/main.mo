import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Persistent state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles with coin balances
  public type UserProfile = {
    displayName : Text;
    coins : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Game state definitions
  public type Player = {
    principal : Principal;
    displayName : Text;
    coins : Nat;
  };

  public type PlayerStatus = {
    var hasSeenCards : Bool;
    var hasPacked : Bool;
    var hasPlayedTurn : Bool;
  };

  public type Table = {
    id : Nat;
    players : [Player];
    var currentPot : Nat;
    var currentBet : Nat;
    var lastActionTime : Int;
    playerStatuses : [PlayerStatus];
    var currentTurn : Nat;
    var isGameActive : Bool;
  };

  // Immutable view types for public API
  public type PlayerStatusView = {
    hasSeenCards : Bool;
    hasPacked : Bool;
    hasPlayedTurn : Bool;
  };

  public type TableView = {
    id : Nat;
    players : [Player];
    currentPot : Nat;
    currentBet : Nat;
    lastActionTime : Int;
    playerStatuses : [PlayerStatusView];
    currentTurn : Nat;
    isGameActive : Bool;
  };

  // Private mutable state
  var playerQueue = Set.empty<Principal>();
  var nextTableId : Nat = 0;
  var bootAmount : Nat = 10_000;
  var inactivityTimeout : Int = 60_000_000_000; // 60 seconds in nanoseconds
  var tables : [var Table] = [var];

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Preserve existing coins if profile exists
    let existingCoins = switch (userProfiles.get(caller)) {
      case (?existing) { existing.coins };
      case (null) { 100_000 }; // Initial coin balance for new players
    };

    let updatedProfile = {
      displayName = profile.displayName;
      coins = existingCoins;
    };

    userProfiles.add(caller, updatedProfile);
  };

  // Helper functions for profiles and game state
  func getOrCreateProfile(principal : Principal) : UserProfile {
    switch (userProfiles.get(principal)) {
      case (?profile) { profile };
      case (null) {
        let newProfile = {
          displayName = principal.toText();
          coins = 100_000; // Initial balance
        };
        userProfiles.add(principal, newProfile);
        newProfile;
      };
    };
  };

  func updatePlayerCoins(principal : Principal, newCoins : Nat) {
    let profile = getOrCreateProfile(principal);
    let updatedProfile = {
      displayName = profile.displayName;
      coins = newCoins;
    };
    userProfiles.add(principal, updatedProfile);
  };

  func findTableByPlayer(principal : Principal) : ?Table {
    tables.find(func(table) { table.players.find(func(player) { player.principal == principal }) != null });
  };

  func autoPackInactivePlayers() {
    let currentTime = Time.now();
    for (table in tables.values()) {
      if (table.isGameActive) {
        var activeCount = 0;
        for (i in Nat.range(0, 3)) {
          let status = table.playerStatuses[i];
          if (not status.hasPacked and table.lastActionTime + inactivityTimeout < currentTime) {
            status.hasPacked := true;
          };
          if (not status.hasPacked) {
            activeCount += 1;
          };
        };
        if (activeCount <= 1) {
          table.isGameActive := false;
        };
      };
    };
  };

  // Game logic functions
  public shared ({ caller }) func joinQueue() : async () {
    // Only authenticated users can join the queue
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join the game");
    };

    // Ensure player has a profile
    let profile = getOrCreateProfile(caller);

    // Check if player has enough coins for boot amount
    if (profile.coins < bootAmount) {
      Runtime.trap("Insufficient coins to join game");
    };

    // Check if player is already in queue or at a table
    if (playerQueue.contains(caller)) {
      Runtime.trap("Already in queue");
    };

    switch (findTableByPlayer(caller)) {
      case (?_) { Runtime.trap("Already at a table") };
      case (null) {};
    };

    playerQueue.add(caller);

    if (playerQueue.size() >= 3) {
      let queueArray = playerQueue.toArray();
      let selectedPlayers = Array.tabulate(
        3,
        func(i) {
          if (i < queueArray.size()) { queueArray[i] } else { caller };
        },
      );

      for (p in selectedPlayers.values()) {
        playerQueue.remove(p);
      };

      let gamePlayers = selectedPlayers.map(
        func(p) {
          let prof = getOrCreateProfile(p);
          // Deduct boot amount
          updatePlayerCoins(p, prof.coins - bootAmount);
          {
            principal = p;
            displayName = prof.displayName;
            coins = prof.coins - bootAmount;
          };
        }
      );

      let playerStatusArray : [PlayerStatus] = Array.tabulate<PlayerStatus>(
        3,
        func(_) {
          {
            var hasSeenCards = false;
            var hasPacked = false;
            var hasPlayedTurn = false;
          };
        },
      );

      let newTable : Table = {
        id = nextTableId;
        players = gamePlayers;
        var currentPot = bootAmount * 3;
        var currentBet = bootAmount;
        var lastActionTime = Time.now();
        var currentTurn = 0;
        var isGameActive = true;
        playerStatuses = playerStatusArray;
      };

      let newTables = Array.tabulate(
        tables.size() + 1,
        func(i : Nat) : Table {
          if (i < tables.size()) { tables[i] } else { newTable };
        }
      );
      tables := newTables.toVarArray();

      nextTableId += 1;
    };

    autoPackInactivePlayers();
  };

  public shared ({ caller }) func performAction(action : Text) : async () {
    // Only authenticated users can perform actions
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform game actions");
    };

    switch (findTableByPlayer(caller)) {
      case (null) { Runtime.trap("Player not at a table") };
      case (?table) {
        if (not table.isGameActive) {
          Runtime.trap("Game is not active");
        };

        let currentPlayerIndex = table.currentTurn % 3;
        if (table.players[currentPlayerIndex].principal != caller) {
          Runtime.trap("Not player's turn");
        };

        let status = table.playerStatuses[currentPlayerIndex];
        if (status.hasPacked) {
          Runtime.trap("Player has already packed");
        };

        let profile = getOrCreateProfile(caller);

        switch (action) {
          case ("pack") {
            status.hasPacked := true;
            var activeCount = 0;
            for (s in table.playerStatuses.values()) {
              if (not s.hasPacked) { activeCount += 1 };
            };
            if (activeCount == 1) {
              // Find winner and award pot
              for (i in Nat.range(0, 3)) {
                if (not table.playerStatuses[i].hasPacked) {
                  let winner = table.players[i];
                  let winnerProfile = getOrCreateProfile(winner.principal);
                  updatePlayerCoins(winner.principal, winnerProfile.coins + table.currentPot);
                };
              };
              table.isGameActive := false;
            };
          };
          case ("see") {
            status.hasSeenCards := true;
          };
          case ("bet") {
            if (profile.coins >= table.currentBet) {
              updatePlayerCoins(caller, profile.coins - table.currentBet);
              table.currentPot := table.currentPot + table.currentBet;
              status.hasPlayedTurn := true;
            } else {
              Runtime.trap("Insufficient coins");
            };
          };
          case ("raise") {
            let raiseAmount = 10_000;
            let newBetAmount = table.currentBet + raiseAmount;
            if (profile.coins >= newBetAmount) {
              updatePlayerCoins(caller, profile.coins - newBetAmount);
              table.currentPot := table.currentPot + newBetAmount;
              table.currentBet := newBetAmount;
              status.hasPlayedTurn := true;
            } else {
              Runtime.trap("Insufficient coins for raise");
            };
          };
          case ("show") {
            // Simplified show logic - find winner among non-packed players
            var winnerIndex = 0;
            for (i in Nat.range(0, 3)) {
              if (not table.playerStatuses[i].hasPacked) {
                winnerIndex := i;
              };
            };
            let winner = table.players[winnerIndex];
            let winnerProfile = getOrCreateProfile(winner.principal);
            updatePlayerCoins(winner.principal, winnerProfile.coins + table.currentPot);
            table.isGameActive := false;
          };
          case (_) { Runtime.trap("Invalid action") };
        };

        table.lastActionTime := Time.now();
        var nextTurn = (table.currentTurn + 1) % 3;
        var attempts = 0;
        while (table.playerStatuses[nextTurn].hasPacked and attempts < 3) {
          nextTurn := (nextTurn + 1) % 3;
          attempts += 1;
        };
        table.currentTurn := nextTurn;
      };
    };

    autoPackInactivePlayers();
  };

  // Conversion helpers for immutable snapshots
  func toPlayerStatusView(status : PlayerStatus) : PlayerStatusView {
    {
      hasSeenCards = status.hasSeenCards;
      hasPacked = status.hasPacked;
      hasPlayedTurn = status.hasPlayedTurn;
    };
  };

  func toTableView(table : Table) : TableView {
    {
      id = table.id;
      players = table.players;
      currentPot = table.currentPot;
      currentBet = table.currentBet;
      lastActionTime = table.lastActionTime;
      playerStatuses = table.playerStatuses.map(toPlayerStatusView);
      currentTurn = table.currentTurn;
      isGameActive = table.isGameActive;
    };
  };

  // Helper function to convert all tables to TableView array
  func convertTablesToTableViews() : [TableView] {
    tables.toArray().map(func(t) { toTableView(t) });
  };

  public shared ({ caller }) func getTable() : async ?TableView {
    // Only authenticated users can view their table
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view game tables");
    };

    autoPackInactivePlayers();
    switch (findTableByPlayer(caller)) {
      case (null) { null };
      case (?table) { ?toTableView(table) };
    };
  };

  public shared ({ caller }) func getTables() : async [TableView] {
    // Admin-only function to view all tables
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all tables");
    };

    autoPackInactivePlayers();
    convertTablesToTableViews();
  };

  public query ({ caller }) func getGameSettings() : async {
    bootAmount : Nat;
    inactivityTimeout : Nat;
  } {
    // Any user (including guests) can view game settings
    {
      bootAmount;
      inactivityTimeout = Int.abs(inactivityTimeout);
    };
  };

  public shared ({ caller }) func updateGameSettings(bootAmount_ : Nat, inactivityTimeout_ : Nat) : async () {
    // Admin-only function
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update game settings");
    };

    bootAmount := bootAmount_;
    inactivityTimeout := Int.abs(inactivityTimeout_);
  };

  public query ({ caller }) func getQueueSize() : async Nat {
    // Any user can check queue size
    playerQueue.size();
  };
};
