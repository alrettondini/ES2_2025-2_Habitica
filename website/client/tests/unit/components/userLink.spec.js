import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import UserLink from '@/components/userLink.vue';

const localVue = createLocalVue();

describe('UserLink Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(UserLink, {
      localVue,
      propsData: {
        user: {
          _id: '123',
          profile: { name: 'TestUser' },
          contributor: { level: 0 },
          backer: {},
        },
      },
      stubs: ['router-link'],
      directives: {
        'b-tooltip': {},
      },
      mocks: {
        $t: () => 'mocked translation',
      },
    });
  });

  test('renders user display name', () => {
    expect(wrapper.vm.displayName).to.equal('TestUser');
  });

  test('uses name prop when provided', () => {
    wrapper.setProps({ name: 'CustomName' });
    expect(wrapper.vm.displayName).to.equal('CustomName');
  });

  test('calculates contributor level from user', () => {
    wrapper.setProps({
      user: {
        _id: '123',
        profile: { name: 'TestUser' },
        contributor: { level: 5 },
      },
    });
    expect(wrapper.vm.level).to.equal(5);
  });

  test('identifies NPC users correctly', () => {
    wrapper.setProps({
      backer: { tier: 800 },
    });
    expect(wrapper.vm.isNPC).to.be.true;
  });

  test('generates tier icon for contributor level', () => {
    wrapper.setProps({
      contributor: { level: 3 },
    });
    const icon = wrapper.vm.tierIcon();
    expect(icon).to.be.a('string');
    expect(icon.length).to.be.greaterThan(0);
  });

  test('shows buffed indicator when showBuffed is true', () => {
    wrapper = shallowMount(UserLink, {
      localVue,
      propsData: {
        user: {
          _id: '123',
          profile: { name: 'TestUser' },
          contributor: { level: 0 },
        },
        showBuffed: true,
      },
      stubs: ['router-link'],
      directives: {
        'b-tooltip': {},
      },
      mocks: {
        $t: () => 'mocked translation',
      },
    });
    expect(wrapper.find('.is-buffed').exists()).to.be.true;
  });
});
