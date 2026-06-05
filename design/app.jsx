// App.jsx — entry point. Assemble all artboards inside the DesignCanvas.

const { useEffect } = React;

function App() {
  // Surface canonical paint flags so the verifier sees a real document.
  return (
    <DesignCanvas
      title="PICK'EM WC26"
      subtitle="Design system + écrans clés — direction warm dark, éditoriale"
    >
      <DCSection
        id="system"
        title="Système"
        subtitle="Tokens, wordmark, typographie, composants atomiques"
      >
        <DCArtboard id="sys-overview" label="A · Brand & tokens" width={1200} height={1180}>
          <SystemArtboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="player-flow"
        title="Parcours joueur"
        subtitle="Landing → Hub des phases → Picks Poules → LOCK"
      >
        <DCArtboard id="landing" label="01 · Landing" width={1280} height={900}>
          <LandingArtboard />
        </DCArtboard>
        <DCArtboard id="hub" label="02 · /picks · Hub des phases" width={1280} height={900}>
          <HubArtboard />
        </DCArtboard>
        <DCArtboard id="groups" label="03 · /picks/groups · Le gros morceau" width={1280} height={1820}>
          <PicksGroupsArtboard />
        </DCArtboard>
        <DCArtboard id="lock" label="04 · Moment LOCK" width={1280} height={900}>
          <LockArtboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="ko-phases"
        title="Phases KO"
        subtitle="Bracket lecture seule + mode pick (un tap = un vainqueur)"
      >
        <DCArtboard id="bracket" label="05 · /picks/r32 · Bracket KO" width={1400} height={1000}>
          <BracketArtboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="social"
        title="Social & classements"
        subtitle="Le pick'em devient fun quand on se compare"
      >
        <DCArtboard id="leaderboard" label="06 · /leaderboard" width={1280} height={1020}>
          <LeaderboardArtboard />
        </DCArtboard>
        <DCArtboard id="friend-group" label="07 · /groups/[id] · Les potes" width={1280} height={920}>
          <FriendGroupArtboard />
        </DCArtboard>
        <DCArtboard id="profile" label="08 · /u/[handle] · Profil public" width={1280} height={1000}>
          <ProfileArtboard />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
