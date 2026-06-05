import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { getUserFriendGroups } from "@/lib/friend-groups";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Display } from "@/components/ui/Display";
import { createFriendGroup, joinByCode } from "./actions";

export const dynamic = "force-dynamic";

export default async function GroupsHubPage() {
  const user = await requireUser();
  const groups = await getUserFriendGroups(user.id);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-16">
      <div className="mb-10">
        <SectionLabel num="SOC.">Mes potes</SectionLabel>
        <Display
          size={64}
          className="mt-3.5"
          style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
        >
          Crée un groupe.
          <br />
          <span style={{ color: "var(--paper-3)" }}>Invite tes potes.</span>
        </Display>
      </div>

      {/* Create / Join cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <form
          action={createFriendGroup}
          className="rounded-[12px] p-6"
          style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
        >
          <SectionLabel num="+">Nouveau groupe</SectionLabel>
          <div className="mt-3 text-[13px] text-[color:var(--paper-2)]">
            Donne un nom — un code d&rsquo;invitation est généré.
          </div>
          <label className="mt-4 block">
            <span className="font-mono text-[10px] tracking-[0.13em] text-[color:var(--paper-3)]">
              NOM DU GROUPE
            </span>
            <input
              required
              name="name"
              minLength={2}
              maxLength={60}
              placeholder="Les potes / Le Groupe des Mecs Sûrs de Rien / …"
              className="mt-1.5 w-full px-3 py-2.5 rounded-md outline-none text-[14px]"
              style={{
                background: "var(--ink-1)",
                border: "1px solid var(--line-strong)",
                color: "var(--paper-1)",
              }}
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn btn-primary btn-md">
              Créer mon groupe →
            </button>
          </div>
        </form>

        <form
          action={joinByCode}
          className="rounded-[12px] p-6 relative overflow-hidden"
          style={{ background: "var(--ink-2)", border: "1px solid var(--line)" }}
        >
          <span
            aria-hidden
            className="absolute top-0 left-0 right-0"
            style={{
              height: 3,
              background:
                "linear-gradient(90deg, var(--usa) 0% 33%, var(--paper-1) 33% 67%, var(--canada) 67% 100%)",
            }}
          />
          <SectionLabel num="✕">Rejoindre</SectionLabel>
          <div className="mt-3 text-[13px] text-[color:var(--paper-2)]">
            Tu as reçu un code ? Colle-le ici (ou clique le lien partagé).
          </div>
          <label className="mt-4 block">
            <span className="font-mono text-[10px] tracking-[0.13em] text-[color:var(--paper-3)]">
              CODE D&rsquo;INVITATION
            </span>
            <input
              required
              name="code"
              minLength={3}
              maxLength={20}
              placeholder="WC26-K3X9"
              autoCapitalize="characters"
              className="mt-1.5 w-full px-3 py-2.5 rounded-md outline-none text-[18px] tracking-[0.15em] font-mono uppercase"
              style={{
                background: "var(--ink-1)",
                border: "1px solid var(--line-strong)",
                color: "var(--gold)",
              }}
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn btn-primary btn-md">
              Rejoindre →
            </button>
          </div>
        </form>
      </div>

      {/* My groups */}
      <div>
        <SectionLabel num={`${groups.length}`}>Mes groupes</SectionLabel>
        {groups.length === 0 ? (
          <div
            className="mt-4 p-8 rounded-[10px] text-center text-[color:var(--paper-3)] text-[13.5px]"
            style={{
              background: "var(--ink-2)",
              border: "1px dashed var(--line-strong)",
            }}
          >
            Aucun groupe pour l&rsquo;instant. Crée le tien ou rejoins-en un avec un code.
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="rounded-[10px] p-5 block transition-colors"
                style={{
                  background: "var(--ink-2)",
                  border: "1px solid var(--line)",
                  color: "inherit",
                }}
              >
                <div className="font-display text-[28px] leading-tight truncate">
                  {g.name}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--paper-3)]">
                    {g.memberCount} MEMBRE{g.memberCount > 1 ? "S" : ""}
                  </span>
                  <span
                    className="font-mono text-[11px] tracking-[0.12em]"
                    style={{ color: "var(--gold)" }}
                  >
                    {g.inviteCode}
                  </span>
                </div>
                <div className="mt-3 font-mono text-[10px] tracking-[0.12em] text-[color:var(--paper-4)]">
                  VOIR LE CLASSEMENT →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
