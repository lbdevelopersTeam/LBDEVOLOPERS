import { describe, expect, it } from 'vitest';
import { withPhpSystems } from './technology-groups';

const php = { category: 'PHP Systems', techs: ['PHP', 'Laravel', 'MySQL', 'WordPress'].map(name => ({ name, level: 'Toolkit', description: `${name} systems` })) };

describe('PHP technology content', () => {
  it('keeps the PHP layer when existing CMS content only contains older layers', () => {
    const cms = { category: 'Frontend Architecture', techs: [{ name: 'React 19', level: 'Expert', description: 'Custom CMS copy' }] };
    expect(withPhpSystems([cms], php)).toEqual([cms, php]);
  });
  it('fills missing PHP tools without replacing CMS descriptions or duplicating layers', () => {
    const cms = { category: 'php systems', techs: [{ name: 'PHP', level: 'Custom', description: 'Keep this copy' }] };
    const result = withPhpSystems([cms], php);
    expect(result).toHaveLength(1);
    expect(result[0].techs[0]).toEqual(cms.techs[0]);
    expect(result[0].techs.map(tool => tool.name)).toEqual(['PHP', 'Laravel', 'MySQL', 'WordPress']);
    expect(withPhpSystems(result, php)).toEqual(result);
  });
});
