type Technology = { name: string; level: string; description: string };
type TechnologyGroup = { category: string; techs: Technology[] };

// Keep CMS copy authoritative while ensuring the newly requested PHP toolkit
// is also available on deployments with older technology content.
export function withPhpSystems<T extends TechnologyGroup>(groups: T[], phpGroup: T): T[] {
  const index = groups.findIndex(group => group.category.trim().toLowerCase() === 'php systems');
  if (index < 0) return [...groups, phpGroup];
  return groups.map((group, i) => i !== index ? group : {
    ...group,
    techs: [...group.techs, ...phpGroup.techs.filter(tool =>
      !group.techs.some(existing => existing.name.trim().toLowerCase() === tool.name.toLowerCase()))],
  });
}
