import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Clock, Copy, Download, Mail, MessageSquare, Phone } from 'lucide-react';
import ContactForm from '../../common/ContactForm';
import { MemberProfile, SectionHeading, socialPlatforms, usableLink, whatsAppNumber } from './shared';

export default function MemberContactSection({
  member,
  sectionIndex,
}: {
  member: MemberProfile;
  sectionIndex: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<number | null>(null);
  const mounted = useRef(false);
  const hasDirectContact = usableLink(member.email) || socialPlatforms.some(({ key }) => usableLink(member.socialLinks[key]));

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!member.email) return;
    try {
      await navigator.clipboard.writeText(member.email);
      if (!mounted.current) return;
      setCopied(true);
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = window.setTimeout(() => {
        copyResetTimer.current = null;
        setCopied(false);
      }, 2500);
    } catch {
      if (mounted.current) setCopied(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-28 px-5 py-20 md:px-8 md:py-28 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index={sectionIndex}
          label="Direct Contact"
          description={`Get in touch with ${member.name} for technical consulting, project scoping, design systems, or bespoke full-stack delivery.`}
        >
          Have a project in mind?<br />
          <span className="text-white/28">Start the conversation.</span>
        </SectionHeading>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-10">
          {/* Left Direct Channels Card */}
          <div className="member-glass flex flex-col justify-between rounded-xl p-6 sm:p-8 md:p-10 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                <MessageSquare className="h-4 w-4 text-[var(--member-accent)]" />
                <span>Direct Inquiries</span>
              </div>

              <p className="mt-4 text-base leading-relaxed text-white/60">
                Send a project brief directly for {member.name}. The LB CodeBase engineering and design lead team will review your specifications and follow up with a detailed proposal.
              </p>

              {/* Direct email display & copy button */}
              {usableLink(member.email) && (
                <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Direct Email</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <a
                      href={`mailto:${member.email}`}
                      className="truncate text-sm font-bold text-white hover:underline"
                    >
                      {member.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/15 bg-white/[0.05] text-white/70 transition-colors hover:border-[var(--member-accent)]/60 hover:text-white"
                      title="Copy Email"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Phone number */}
              {member.phone && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Phone / WhatsApp</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--member-accent)]" />
                    <a
                      href={`tel:${member.phone}`}
                      className="text-sm font-bold text-white hover:underline"
                    >
                      {member.phone}
                    </a>
                    <span className="text-white/20" aria-hidden="true">/</span>
                    <a
                      href={`https://wa.me/${whatsAppNumber(member.phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-black uppercase tracking-wider text-[var(--member-accent)] hover:underline"
                      aria-label={`Message ${member.name} on WhatsApp`}
                    >
                      Message on WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* Response SLA Note */}
              <div className="mt-6 flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] p-3 text-xs text-white/50">
                <Clock className="h-4 w-4 text-[var(--member-accent)] shrink-0" />
                <span>Typical response time is within 24 hours on business days.</span>
              </div>

              {/* vCard Download */}
              <div className="mt-6">
                <a
                  href={`/api/v2/team/${member.slug}/vcard`}
                  download={`${member.slug}.vcf`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-3 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:border-[var(--member-accent)]/50 hover:bg-white/[0.08]"
                >
                  <Download className="h-3.5 w-3.5 text-[var(--member-accent)]" />
                  <span>Download vCard Contact (.vcf)</span>
                </a>
              </div>
            </div>

            {/* Social Channels */}
            {hasDirectContact && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Social Profiles</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialPlatforms.map(
                    ({ key, label, icon: Icon }) =>
                      usableLink(member.socialLinks[key]) && (
                        <a
                          key={key}
                          href={member.socialLinks[key]}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60 transition-colors hover:border-[var(--member-accent)]/50 hover:text-white"
                        >
                          <Icon className="h-3 w-3" />
                          <span>{label}</span>
                          <ArrowUpRight className="h-2.5 w-2.5 opacity-40" />
                        </a>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Contact Form */}
          <div className="member-glass member-glass-strong rounded-xl p-6 sm:p-8 md:p-10 lg:col-span-7">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-lg font-black uppercase text-white">Project Inquiry Form</h3>
                <p className="mt-0.5 text-xs text-white/45">Direct routing to {member.name}</p>
              </div>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: 'var(--member-accent)' }}
              />
            </div>
            <ContactForm memberId={member.id} memberName={member.name} variant="editorial" />
          </div>
        </div>
      </div>
    </section>
  );
}
