import { MemberProfile, SectionHeading } from './shared';

export default function MemberIntroduction({ member }: { member: MemberProfile }) {
  const facts = [
    { label: 'Role', value: member.role },
    { label: 'Experience', value: member.yearsExperience },
    { label: 'Based in', value: member.location },
    { label: 'Languages', value: member.languages?.join(', ') },
  ].filter((item) => Boolean(item.value));

  return (
    <section id="about" className="member-section">
      <div className="member-container">
        <SectionHeading index="01" label="About" description={`The background and approach behind ${member.name}'s work.`}>
          About {member.name.split(' ')[0]}.
        </SectionHeading>

        <div className="member-about-layout">
          <div className="member-about-copy">
            <p className="member-intro-copy">{member.fullBio || member.bio}</p>
            {member.fullBio && member.bio && member.fullBio !== member.bio && (
              <p>{member.bio}</p>
            )}
          </div>
          {facts.length > 0 && (
            <dl className="member-about-facts">
              {facts.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
