import {
  describe, expect, test, beforeEach,
} from 'vitest';
import { mount, createLocalVue } from '@vue/test-utils';
import SecondaryMenu from '@/components/secondaryMenu.vue';

const localVue = createLocalVue();

describe('SecondaryMenu Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SecondaryMenu, {
      localVue,
      slots: {
        default: '<a class="nav-link">Test Link</a>',
      },
    });
  });

  test('renders as a nav element', () => {
    expect(wrapper.find('nav').exists()).to.be.true;
  });

  test('has secondary-menu class', () => {
    expect(wrapper.classes()).to.include('secondary-menu');
  });

  test('renders slot content', () => {
    expect(wrapper.text()).to.include('Test Link');
  });
});
