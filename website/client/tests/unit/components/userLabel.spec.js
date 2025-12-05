import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import UserLabel from '@/components/userLabel.vue';

const localVue = createLocalVue();

describe('UserLabel Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(UserLabel, {
      localVue,
      propsData: {
        user: {
          profile: { name: 'TestUser' },
          contributor: { level: 0 },
          backer: {},
        },
      },
      directives: {
        'b-tooltip': {},
      },
    });
  });

  test('renders user display name', () => {
    expect(wrapper.text()).to.include('TestUser');
  });

  test('uses name prop when provided', () => {
    wrapper.setProps({ name: 'CustomName' });
    expect(wrapper.vm.displayName).to.equal('CustomName');
  });

  test('calculates contributor level from user', () => {
    wrapper.setProps({
      user: {
        profile: { name: 'TestUser' },
        contributor: { level: 6 },
      },
    });
    expect(wrapper.vm.level).to.equal(6);
  });

  test('identifies NPC users correctly', () => {
    wrapper.setProps({
      backer: { tier: 800 },
    });
    expect(wrapper.vm.isNPC).to.be.true;
  });

  test('hasTier returns true for users with contributor level', () => {
    wrapper.setProps({
      contributor: { level: 5 },
    });
    expect(wrapper.vm.hasTier).to.be.true;
  });

  test('displays tier icon when user has tier', () => {
    wrapper.setProps({
      contributor: { level: 4 },
    });
    expect(wrapper.find('.svg-icon').exists()).to.be.true;
  });
});
