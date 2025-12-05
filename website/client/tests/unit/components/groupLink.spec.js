import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import { TAVERN_ID } from '@/../../common/script/constants';
import GroupLink from '@/components/groupLink.vue';

const localVue = createLocalVue();

describe('GroupLink Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(GroupLink, {
      localVue,
      propsData: {
        group: {
          _id: 'guild-123',
          name: 'Test Guild',
          type: 'guild',
        },
      },
      stubs: ['router-link'],
    });
  });

  test('renders group name', () => {
    expect(wrapper.text()).to.equal('Test Guild');
  });

  test('generates tavern path for tavern group', () => {
    wrapper.setProps({
      group: {
        _id: TAVERN_ID,
        name: 'Tavern',
      },
    });
    expect(wrapper.vm.toPath).to.deep.equal({ name: 'tavern' });
  });

  test('generates party path for party group', () => {
    wrapper.setProps({
      group: {
        _id: 'party-123',
        name: 'My Party',
        type: 'party',
      },
    });
    expect(wrapper.vm.toPath).to.deep.equal({ name: 'party' });
  });

  test('generates guild path for guild group', () => {
    expect(wrapper.vm.toPath).to.deep.equal({
      name: 'guild',
      params: { groupId: 'guild-123' },
    });
  });
});
